package service;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.lambda.runtime.events.models.s3.S3EventNotification.S3EventNotificationRecord;

import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.net.HttpURLConnection;


public class PDFMergerHandler implements RequestHandler<S3Event, String> {
	
	public String handleRequest(S3Event s3Event, Context context) {
	    context.getLogger().log("Received event: " + s3Event);

	    try {
	    	List<String> pdfUrls = getPdfUrlsFromS3Event(s3Event);

	        // Load all PDF streams
	        List<InputStream> pdfStreams = new ArrayList<>();
	        for (String url : pdfUrls) {
	            pdfStreams.add(getPdfStream(url));
	        }

	        PDDocument mergedDocument = mergePdfs(pdfStreams);
	        saveToS3(mergedDocument);
	        mergedDocument.close();
	        for (InputStream stream : pdfStreams) {
	            stream.close();
	        }

	        return "Successfully merged PDFs!";
	    } catch (Exception e) {
	        throw new RuntimeException("Error merging PDFs", e);
	    }
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

    private InputStream getPdfStream(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        return connection.getInputStream();
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

    private void saveToS3(PDDocument document) throws IOException {
//        OutputStream outputStream = // obtain an OutputStream, e.g., from S3 SDK;
//        document.save(outputStream);
    }
}
