package com.jakubrurak.presignedurl;

import java.net.URL;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

public class PresignedUrlGeneratorHandler implements RequestHandler<Map<String, Integer>, List<String>> {

    private static final String UPLOAD_BUCKET_NAME = "pdftransform-source-pdfs";
    private static final Region AWS_REGION = Region.EU_CENTRAL_1;
    private static final int URL_EXPIRATION_TIME_IN_SECONDS = 120;

    private final S3Presigner s3Presigner;

    public PresignedUrlGeneratorHandler() {
        this.s3Presigner = S3Presigner.builder().region(AWS_REGION).build();
    }

    @Override
    public List<String> handleRequest(Map<String, Integer> input, Context context) {
        try {
            int numberOfUrls = input.getOrDefault("numberOfUrls", 1); // Default to 2 if not provided
            List<String> presignedUrls = new ArrayList<>();
            String batchUUID = UUID.randomUUID().toString();

            for (int i = 0; i < numberOfUrls; i++) {
                String objectKey = "uploads/" + batchUUID + "/upload_" + System.currentTimeMillis() + "_" + i + ".pdf";
                String presignedUrl = generatePresignedUrl(UPLOAD_BUCKET_NAME, objectKey, URL_EXPIRATION_TIME_IN_SECONDS);
                presignedUrls.add(presignedUrl);
            }

            context.getLogger().log("Generated pre-signed URLs: " + presignedUrls);
            return presignedUrls;
        } catch (Exception e) {
            throw new RuntimeException("Error generating pre-signed URLs", e);
        }
    }

    private String generatePresignedUrl(String bucketName, String objectKey, int expirationTimeInSeconds) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        PutObjectPresignRequest putObjectPresignRequest = PutObjectPresignRequest.builder()
                .putObjectRequest(putObjectRequest)
                .signatureDuration(Duration.ofSeconds(expirationTimeInSeconds))
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(putObjectPresignRequest);

        URL url = presignedRequest.url();
        return url.toString();
    }
}