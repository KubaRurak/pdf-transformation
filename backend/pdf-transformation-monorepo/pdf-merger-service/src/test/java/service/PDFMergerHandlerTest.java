package service;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.io.InputStream;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;

public class PDFMergerHandlerTest {

    @Test
    public void testMergePdfs() throws IOException {
    	
        PDFMergerHandler handler = new PDFMergerHandler();

        // Load sample PDFs from test resources
        try (InputStream pdfStream1 = getClass().getResourceAsStream("/sample1.pdf");
             InputStream pdfStream2 = getClass().getResourceAsStream("/sample2.pdf")) {

            PDDocument mergedDoc = handler.mergePdfs(pdfStream1, pdfStream2);

            try (PDDocument doc1 = PDDocument.load(getClass().getResourceAsStream("/sample1.pdf"));
                 PDDocument doc2 = PDDocument.load(getClass().getResourceAsStream("/sample2.pdf"))) {
                
                // Check if merged document has the correct number of pages
                assertEquals(doc1.getNumberOfPages() + doc2.getNumberOfPages(), mergedDoc.getNumberOfPages());
            }

            mergedDoc.close();
        }
    }
}