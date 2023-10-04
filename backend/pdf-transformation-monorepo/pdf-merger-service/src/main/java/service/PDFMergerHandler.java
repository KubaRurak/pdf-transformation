package service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;

import com.amazonaws.HttpMethod;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.lambda.runtime.events.models.s3.S3EventNotification.S3EventNotificationRecord;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;


public class PDFMergerHandler implements RequestHandler<S3Event, String> {
	
    private static final String DESTINATION_BUCKET_NAME = "pdftransform-output-pdfs";
    private static final Regions AWS_REGION = Regions.EU_CENTRAL_1;
    private static final int URLExpirationTimeInSeconds = 60;
	
    public String handleRequest(S3Event s3Event, Context context) {
        context.getLogger().log("Received event: " + s3Event);
        List<InputStream> pdfStreams = new ArrayList<>();

        try {
            context.getLogger().log("Extracting S3 info from event.");
            List<String[]> s3Infos = getS3InfosFromEvent(s3Event);
            for (String[] info : s3Infos) {
                String bucket = info[0];
                String key = info[1];
                try {
                    context.getLogger().log("Fetching PDF stream for bucket: " + bucket + ", key: " + key);
                    pdfStreams.add(getPdfStream(bucket, key));
                    context.getLogger().log("Successfully loaded PDF from bucket: " + bucket + " and key: " + key);
                } catch (Exception e) {
                    context.getLogger().log("Failed to load PDF from bucket: " + bucket + " and key: " + key);
                    throw e;
                }
            }
            context.getLogger().log("Merging PDFs.");
            PDDocument mergedDocument = mergePdfs(pdfStreams);
            context.getLogger().log("Saving merged PDF to S3.");
            String objectKey = saveToS3(mergedDocument);
            mergedDocument.close();
            String presignedUrl = generatePresignedUrl(DESTINATION_BUCKET_NAME, objectKey, URLExpirationTimeInSeconds);
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
	
	List<String> getPdfUrlsFromS3Event(S3Event s3Event) {
		
	    List<String> pdfUrls = new ArrayList<>();
	    for (S3EventNotificationRecord record : s3Event.getRecords()) {
	        String bucketName = record.getS3().getBucket().getName();
	        String objectKey = record.getS3().getObject().getKey();
	        String url = "https://s3.amazonaws.com/" + bucketName + "/" + objectKey;
	        pdfUrls.add(url);
	    }
	    
	    return pdfUrls;
	}

    private InputStream getPdfStream(String bucketName, String objectKey) {
        AmazonS3 s3 = AmazonS3Client.builder().withRegion(AWS_REGION).build();
        return s3.getObject(bucketName, objectKey).getObjectContent();
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
        AmazonS3 s3 = AmazonS3Client.builder().withRegion(AWS_REGION).build();
        String tempFilePath = "/tmp/merged_" + System.currentTimeMillis() + ".pdf";
        File tempFile = new File(tempFilePath);
        String objectKey = "merged_" + System.currentTimeMillis() + ".pdf";
        document.save(tempFile);
        s3.putObject(DESTINATION_BUCKET_NAME, objectKey, tempFile);
        tempFile.delete();
        
        return objectKey; // return object key for use in generating pre-signed URL
    }
    
    private String generatePresignedUrl(String bucketName, String objectKey, int expirationTimeInSeconds) {
        AmazonS3 s3 = AmazonS3Client.builder().withRegion(AWS_REGION).build();
        
        java.util.Date expiration = new java.util.Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * expirationTimeInSeconds;
        expiration.setTime(expTimeMillis);
        
        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, objectKey)
                .withMethod(HttpMethod.GET)
                .withExpiration(expiration);
        
        URL url = s3.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }
}
