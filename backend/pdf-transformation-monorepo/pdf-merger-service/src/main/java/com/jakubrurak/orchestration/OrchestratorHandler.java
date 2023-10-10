package com.jakubrurak.orchestration;

import java.util.List;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;

public class OrchestratorHandler implements RequestHandler<Map<String, Object>, String> {
	
	
		
    private final LambdaClient lambdaClient = LambdaClient.builder()
            .region(Region.of("YOUR_REGION")) // replace with your AWS region
            .build();
    
    @Override
    public String handleRequest(Map<String, Object> input, Context context) {
        // Extract action and s3Keys from input
        String action = (String) input.get("action");
        List<String> s3Keys = (List<String>) input.get("s3Keys");
        boolean isValid = invokeValidatorLambda(s3Keys);  // Pseudo-code
        if (!isValid) {
            return "Validation failed for provided files.";
        }

        switch (action) {
            case "merge":
                return invokeMergeLambda(s3Keys);  // Pseudo-code
            default:
                return "Unknown action";
        }
    }

    private boolean invokeValidatorLambda(List<String> s3Keys) {
        String payloadJson = String.format("{\"s3Keys\":%s}", s3Keys.toString());
        InvokeRequest request = InvokeRequest.builder()
                                             .functionName("PDFMergerFunction")
                                             .payload(SdkBytes.fromUtf8String(payloadJson))
                                             .build();

        InvokeResponse response = lambdaClient.invoke(request);
        String payload = response.payload().asUtf8String();
        return Boolean.parseBoolean(payload);
    }

    private String invokeMergeLambda(List<String> s3Keys) {
        String payloadJson = String.format("{\"s3Keys\":%s}", s3Keys.toString());
        InvokeRequest request = InvokeRequest.builder()
                                             .functionName("PdfMergerLambdaFunctionName")
                                             .payload(SdkBytes.fromUtf8String(payloadJson))
                                             .build();

        InvokeResponse response = lambdaClient.invoke(request);
        return response.payload().asUtf8String();
    }
}