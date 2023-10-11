package com.jakubrurak.validation;

import java.util.List;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;

public class ValidatorHandler implements RequestHandler<Map<String, Object>, Boolean> {

    private static final Region AWS_REGION = Region.EU_CENTRAL_1;
    private static final long MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
    private static final String UPLOAD_BUCKET_NAME = "pdftransform-source-pdfs";
    private final S3Client s3Client = S3Client.builder().region(AWS_REGION).build();

    @Override
    public Boolean handleRequest(Map<String, Object> input, Context context) {
        List<String> s3Keys = (List<String>) input.get("s3Keys");
        long totalSize = 0;
        
        for (String s3Key : s3Keys) {
            HeadObjectResponse s3Object = getS3ObjectMetadata(s3Key);
            totalSize += s3Object.contentLength();
        }

        if (totalSize <= MAX_SIZE) {
            return true;
        } else {
            deleteS3Objects(s3Keys);
            throw new RuntimeException("Total file size exceeds the allowed limit of 25MB");
        }
    }

    private HeadObjectResponse getS3ObjectMetadata(String s3Key) {
        return s3Client.headObject(b -> b.bucket(UPLOAD_BUCKET_NAME).key(s3Key));
    }

    private void deleteS3Objects(List<String> s3Keys) {
        for (String key : s3Keys) {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(UPLOAD_BUCKET_NAME).key(key).build());
        }
    }
}