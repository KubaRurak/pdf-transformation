package com.jakubrurak.apigateway;

import java.util.List;
import java.util.Map;

public class ApiGatewayResponse {
	
    private int statusCode;
    private Map<String, String> headers;
    private String body; 

    
	public int getStatusCode() {
		return statusCode;
	}
	public void setStatusCode(int statusCode) {
		this.statusCode = statusCode;
	}
	public String getBody() {
		return body;
	}
	public void setBody(String body) {
		this.body = body;
	}
	public Map<String, String> getHeaders() {
		return headers;
	}
	public void setHeaders(Map<String, String> headers) {
		this.headers = headers;
	}

}