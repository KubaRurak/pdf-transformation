package com.jakubrurak.pdfoperations.merge;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.s3.S3Client;

public class PDFMergerHandlerTest {
	
	
    private S3Client mockS3Client;
    private DynamoDbClient mockDynamoDBClient;

    @BeforeEach
    public void setup() {
        mockS3Client = mock(S3Client.class);
        mockDynamoDBClient = mock(DynamoDbClient.class);
    }

    @Test
    public void testMergePdfs() throws IOException {
        PDFMergerHandler handler = new PDFMergerHandler();

        // Load sample PDFs from test resources
        try (InputStream pdfStream1 = getClass().getResourceAsStream("/sample1.pdf");
             InputStream pdfStream2 = getClass().getResourceAsStream("/sample2.pdf")) {

            List<InputStream> streams = Arrays.asList(pdfStream1, pdfStream2);
            PDDocument mergedDoc = handler.mergePdfs(streams);

            try (PDDocument doc1 = PDDocument.load(getClass().getResourceAsStream("/sample1.pdf"));
                 PDDocument doc2 = PDDocument.load(getClass().getResourceAsStream("/sample2.pdf"))) {
                
                // Check if merged document has the correct number of pages
                assertEquals(doc1.getNumberOfPages() + doc2.getNumberOfPages(), mergedDoc.getNumberOfPages());
            }

            mergedDoc.close();
        }
    }
    
    @Test
    public void testMergeThreePdfs() throws IOException {
        PDFMergerHandler handler = new PDFMergerHandler();

        // Load 3 sample PDFs from test resources
        try (InputStream pdfStream1 = getClass().getResourceAsStream("/sample1.pdf");
             InputStream pdfStream2 = getClass().getResourceAsStream("/sample2.pdf");
             InputStream pdfStream3 = getClass().getResourceAsStream("/sample3.pdf")) {

            List<InputStream> streams = Arrays.asList(pdfStream1, pdfStream2, pdfStream3);
            PDDocument mergedDoc = handler.mergePdfs(streams);

            try (PDDocument doc1 = PDDocument.load(getClass().getResourceAsStream("/sample1.pdf"));
                 PDDocument doc2 = PDDocument.load(getClass().getResourceAsStream("/sample2.pdf"));
                 PDDocument doc3 = PDDocument.load(getClass().getResourceAsStream("/sample3.pdf"))) {
                
                // Check if merged document has the correct number of pages
                int expectedPages = doc1.getNumberOfPages() + doc2.getNumberOfPages() + doc3.getNumberOfPages();
                assertEquals(expectedPages, mergedDoc.getNumberOfPages());
            }

            mergedDoc.close();
        }
    }
}