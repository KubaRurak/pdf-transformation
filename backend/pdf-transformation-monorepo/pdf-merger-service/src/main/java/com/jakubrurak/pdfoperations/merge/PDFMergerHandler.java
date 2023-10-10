package com.jakubrurak.pdfoperations.merge;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Date;

import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.lambda.runtime.events.models.s3.S3EventNotification.S3EventNotificationRecord;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;


public class PDFMergerHandler implements RequestHandler<S3Event, String> {
	
    private static final String DESTINATION_BUCKET_NAME = "pdftransform-output-pdfs";
    private static final Region AWS_REGION = Region.EU_CENTRAL_1;
    private final S3Client s3Client;
    private final DynamoDbClient dynamoDBClient;
    private static final int URLExpirationTimeInSeconds = 60;

    public PDFMergerHandler() {
        this(S3Client.builder().region(AWS_REGION).build(),
             DynamoDbClient.builder().region(AWS_REGION).build());
    }

    protected PDFMergerHandler(S3Client s3Client, DynamoDbClient dynamoDbClient) {
        this.s3Client = s3Client;
        this.dynamoDBClient = dynamoDbClient;
    }
	
    public String handleRequest(S3Event s3Event, Context context) {
        context.getLogger().log("Received event: " + s3Event);
        List<InputStream> pdfStreams = new ArrayList<>();
        List<String[]> s3Infos = new ArrayList<>();

        try {
            context.getLogger().log("Extracting S3 info from event.");
            s3Infos = getS3InfosFromEvent(s3Event);
            for (String[] info : s3Infos) {
                String bucket = info[0];
                String key = info[1];
                context.getLogger().log("Fetching PDF stream for bucket: " + bucket + ", key: " + key);
                pdfStreams.add(getPdfStream(bucket, key));
                context.getLogger().log("Successfully loaded PDF from bucket: " + bucket + " and key: " + key);
            }
            context.getLogger().log("Merging PDFs.");
            PDDocument mergedDocument = mergePdfs(pdfStreams);
            context.getLogger().log("Saving merged PDF to S3.");
            String objectKey = saveToS3(mergedDocument);
            mergedDocument.close();
            String presignedUrl = generatePresignedUrl(DESTINATION_BUCKET_NAME, objectKey, URLExpirationTimeInSeconds);
            context.getLogger().log("Log - presigned url address: " + presignedUrl);
            context.getLogger().log("Saving data to db");
            saveRecordToDynamoDB(objectKey, presignedUrl);
            context.getLogger().log("Db data saved succesfully");
            return "Your merged PDF is available here: " + presignedUrl;
        } catch (Exception e) {
            throw new RuntimeException("Error merging PDFs", e);
        } finally {
            context.getLogger().log("Closing all opened streams.");
            pdfStreams.forEach(stream -> {
                try {
                    stream.close();
                } catch (IOException e) {
                    context.getLogger().log("Error closing stream: " + e.getMessage());
                }
            });
            // Delete source files irrespective of the success or failure of merging
//            for (String[] info : s3Infos) {
//                context.getLogger().log("Deleting source files");
//                deleteSourceFile(info[0], info[1]);
//            }
        }
    }
    
    List<String[]> getS3InfosFromEvent(S3Event s3Event) {
        List<String[]> s3Infos = new ArrayList<>();
        for (S3EventNotificationRecord record : s3Event.getRecords()) {
            String bucketName = record.getS3().getBucket().getName();
            String objectKey;
            try {
                objectKey = java.net.URLDecoder.decode(record.getS3().getObject().getKey(), StandardCharsets.UTF_8.name());
                
            } catch (IOException e) {
                throw new RuntimeException("Error decoding object key", e);
            }
            s3Infos.add(new String[]{bucketName, objectKey});
        }

        return s3Infos;
    }

    private InputStream getPdfStream(String bucketName, String objectKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucketName).key(objectKey).build();
        return s3Client.getObject(getObjectRequest);
    }
    
    private void deleteSourceFile(String bucketName, String objectKey) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build());
    }

    PDDocument mergePdfs(List<InputStream> pdfStreams) throws IOException {
        PDFMergerUtility pdfMergerUtility = new PDFMergerUtility();
        PDDocument firstDoc = PDDocument.load(pdfStreams.get(0));
        for (int i = 1; i < pdfStreams.size(); i++) {
            PDDocument nextDoc = PDDocument.load(pdfStreams.get(i));
            pdfMergerUtility.appendDocument(firstDoc, nextDoc);
            nextDoc.close();
        }

        return firstDoc;
    }

    private String saveToS3(PDDocument document) throws IOException {
        String tempFilePath = "/tmp/merged_" + System.currentTimeMillis() + ".pdf";
        File tempFile = new File(tempFilePath);
        String objectKey = "merged_" + System.currentTimeMillis() + ".pdf";
        document.save(tempFile);
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(DESTINATION_BUCKET_NAME)
                .key(objectKey)
                .build(), 
            software.amazon.awssdk.core.sync.RequestBody.fromFile(tempFile)
        );
        tempFile.delete();
        
        return objectKey;
    }
    
    private String generatePresignedUrl(String bucketName, String objectKey, int expirationTimeInSeconds) {        
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * expirationTimeInSeconds;
        expiration.setTime(expTimeMillis);
        
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(expirationTimeInSeconds))
                .getObjectRequest(getObjectRequest)
                .build();
        
        try (S3Presigner presigner = S3Presigner.create()) {
            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        }
    }
    
    private void saveRecordToDynamoDB(String objectKey, String presignedUrl) {
        String tableName = "MergedPDFStatus"; // Change this to your actual table name

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("id", AttributeValue.builder().s(objectKey).build()); // Using objectKey as the unique ID for simplicity
        item.put("status", AttributeValue.builder().s("complete").build());
        item.put("url", AttributeValue.builder().s(presignedUrl).build());

        PutItemRequest putItemRequest = PutItemRequest.builder().tableName(tableName).item(item).build();
        dynamoDBClient.putItem(putItemRequest);
    }
}