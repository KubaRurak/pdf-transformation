package com.jakubrurak.polling;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

public class PollingHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final String DYNAMODB_TABLE_NAME = "MergedPDFStatus";
    private final DynamoDbClient dynamoDBClient;

    public PollingHandler() {
        this.dynamoDBClient = DynamoDbClient.create(); // This initializes the DynamoDB client for SDK v2.x
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        String id = request.getQueryStringParameters().get("id");
        if (id == null || id.isEmpty()) {
            return generateErrorResponse("Missing 'id' parameter");
        }

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(DYNAMODB_TABLE_NAME)
                .key(Collections.singletonMap("id", AttributeValue.builder().s(id).build()))
                .build();

        GetItemResponse result = dynamoDBClient.getItem(getItemRequest);
        Map<String, AttributeValue> item = result.item();

        if (item == null || item.isEmpty()) {
            return generateErrorResponse("Invalid 'id' or processing not yet started");
        }

        String status = item.get("status").s();
        if ("complete".equalsIgnoreCase(status)) {
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("status", "complete");
            responseBody.put("url", item.get("url").s());
            return new APIGatewayProxyResponseEvent().withStatusCode(200).withBody(responseBody.toString());
        } else {
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("status", "processing");
            return new APIGatewayProxyResponseEvent().withStatusCode(202).withBody(responseBody.toString());
        }
    }

    private APIGatewayProxyResponseEvent generateErrorResponse(String message) {
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("error", message);
        return new APIGatewayProxyResponseEvent().withStatusCode(400).withBody(responseBody.toString());
    }
}