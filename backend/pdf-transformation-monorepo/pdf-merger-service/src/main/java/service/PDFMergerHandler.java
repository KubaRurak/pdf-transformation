package service;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.HttpURLConnection;


public class PDFMergerHandler implements RequestHandler<S3Event, String> {

    public String handleRequest(S3Event s3Event, Context context) {
        context.getLogger().log("Received event: " + s3Event);

        try {
            InputStream pdfStream1 = getPdfStream("https://example.com/path/to/first.pdf");
            InputStream pdfStream2 = getPdfStream("https://example.com/path/to/second.pdf");
            
            PDDocument mergedDocument = mergePdfs(pdfStream1, pdfStream2);

            saveToS3(mergedDocument);

            // Cleanup
            mergedDocument.close();
            pdfStream1.close();
            pdfStream2.close();

            return "Successfully merged PDFs!";
        } catch (Exception e) {
            throw new RuntimeException("Error merging PDFs", e);
        }
    }

    private InputStream getPdfStream(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        return connection.getInputStream();
    }

    PDDocument mergePdfs(InputStream pdfStream1, InputStream pdfStream2) throws IOException {
        PDDocument doc1 = PDDocument.load(pdfStream1);
        PDDocument doc2 = PDDocument.load(pdfStream2);

        PDFMergerUtility pdfMergerUtility = new PDFMergerUtility();
        pdfMergerUtility.appendDocument(doc1, doc2);

        doc2.close();

        return doc1;  // merged document
    }

    private void saveToS3(PDDocument document) throws IOException {
//        OutputStream outputStream = // obtain an OutputStream, e.g., from S3 SDK;
//        document.save(outputStream);
    }
}
