package com.jakubrurak.orchestration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jakubrurak.apigateway.ApiGatewayInput;
import com.jakubrurak.apigateway.ApiGatewayResponse;

import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;

public class OrchestratorHandler implements RequestHandler<ApiGatewayInput, ApiGatewayResponse> {

    private static final Region AWS_REGION = Region.EU_CENTRAL_1;

    private final LambdaClient lambdaClient = LambdaClient.builder()
            .region(AWS_REGION)
            .build();

    @Override
    public ApiGatewayResponse handleRequest(ApiGatewayInput input, Context context) {
        ApiGatewayResponse response = new ApiGatewayResponse();

        try {
            String inputBody = input.getBody();
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(inputBody);

            String uuid = rootNode.path("uuid").asText();
            String action = rootNode.path("action").asText();
            int numFiles = rootNode.path("numberOfFiles").asInt();

            if (uuid == null || uuid.trim().isEmpty()) {
                response.setBody("Invalid UUID.");
                response.setStatusCode(400); // Bad Request
                return response;
            }

            context.getLogger().log("uuid: " + uuid + " action: " + action + " numberOfFiles: " + numFiles);
            List<String> s3Keys = generateS3Keys(uuid, numFiles);
            String payloadJson = String.format("{\"s3Keys\":%s}", objectMapper.writeValueAsString(s3Keys));
            context.getLogger().log("payloadJson: " + payloadJson);

            boolean isValid = invokeValidatorLambda(payloadJson);
            if (!isValid) {
                response.setBody("Validation failed for provided files.");
                response.setStatusCode(400); // Bad Request
                return response;
            }

            context.getLogger().log("pdfs are validated");
            String result;

            switch (action) {
                case "merge":
                    result = invokeMergeLambda(payloadJson);
                    break;
                default:
                    result = "Unknown action";
            }

            response.setBody(result);
            response.setStatusCode(200); // OK

        } catch (Exception e) {
            response.setStatusCode(500); // Internal Server Error
            response.setBody("{\"message\":\"Error processing request: " + e.getMessage() + "\"}");
            context.getLogger().log("Error: " + e.getMessage());
        }

        return response;
    }
    
    private List<String> generateS3Keys(String batchUUID, int numberOfFiles) {
        List<String> s3Keys = new ArrayList<>();
        for (int i = 0; i < numberOfFiles; i++) {
            s3Keys.add("uploads/" + batchUUID + "/upload_" + i + ".pdf");
        }
        return s3Keys;
    }

    private boolean invokeValidatorLambda(String payloadJson) {
        InvokeRequest request = InvokeRequest.builder()
                                             .functionName("PDFValidationLambdaFunction")
                                             .payload(SdkBytes.fromUtf8String(payloadJson))
                                             .build();

        InvokeResponse response = lambdaClient.invoke(request);
        String payload = response.payload().asUtf8String();
        return Boolean.parseBoolean(payload);
    }

    private String invokeMergeLambda(String payloadJson) {
        InvokeRequest request = InvokeRequest.builder()
                                             .functionName("PDFMergerFunction")
                                             .payload(SdkBytes.fromUtf8String(payloadJson))
                                             .build();

        InvokeResponse response = lambdaClient.invoke(request);
        return response.payload().asUtf8String();
    }
}