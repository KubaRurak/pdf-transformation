import { useState } from 'react';

function useFileOperations(fileData, action) {
    const [presignedUrls, setPresignedUrls] = useState([]);
    const [orchestrationResult, setOrchestrationResult] = useState(null);
    const [progress, setProgress] = useState({
        generatingLinks: false,
        uploading: false,
        uploadProgress: 0,  // in percentage
        waitingForMerge: false
    });

    const fetchPresignedUrls = async () => {
        try {
            const response = await fetch("https://l91xlk3wo2.execute-api.eu-central-1.amazonaws.com/presignedurl", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ numberOfUrls: fileData.length })  
            });

            const data = await response.json();

            if (data && data.presignedUrls && data.presignedUrls.length) {
                return { presignedUrls: data.presignedUrls, uuid: data.uuid };
            } else {
                throw new Error("Invalid response format or no pre-signed URLs found");
            }
        } catch (error) {
            console.error("Failed to fetch presigned URLs", error);
            return {};
        }
    };

    const uploadToPresignedUrl = async (file, presignedUrl) => {
        try {
            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': 'application/pdf'
                }
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload ${file.name}. Status: ${uploadResponse.status}`);
            }

            console.log(`Successfully uploaded ${file.name}`);
        } catch (error) {
            console.error(error);
        }
    };

    const startOrchestration = async (uuid, action, numberOfFiles) => {
        try {
            const response = await fetch("https://l91xlk3wo2.execute-api.eu-central-1.amazonaws.com/tasks/start-orchestration", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    uuid: uuid,
                    action: action,
                    numberOfFiles: numberOfFiles
                })  
            });

            const responseData = await response.json();
            console.log(`Orchestration result: `, responseData);

            return responseData;
        } catch (error) {
            console.error("Failed to start the orchestration", error);
            return null; // or some error handling value
        }
    };

    const executeFileOperations = async () => {
        setProgress(prev => ({ ...prev, generatingLinks: true }));
        const { presignedUrls, uuid } = await fetchPresignedUrls();
        setProgress(prev => ({ ...prev, generatingLinks: false }));

        if (presignedUrls && presignedUrls.length) {
            setPresignedUrls(presignedUrls);

            setProgress(prev => ({ ...prev, uploading: true }));
            for (let i = 0; i < fileData.length; i++) {
                const fileBlob = await fetch(fileData[i].url).then(r => r.blob());
                const presignedUrl = presignedUrls[i];
                await uploadToPresignedUrl(fileBlob, presignedUrl);
                const percentRaw = ((i + 1) / fileData.length) * 100;
                const percent = parseFloat(percentRaw.toFixed(2));
                setProgress(prev => ({ ...prev, uploadProgress: percent }));
            }
            setProgress(prev => ({ ...prev, uploading: false, waitingForMerge: true }));

            const result = await startOrchestration(uuid, action, fileData.length);
            setProgress(prev => ({ ...prev, waitingForMerge: false }));
            setOrchestrationResult(result);

            return result;
        } else {
            console.warn("No pre-signed URLs fetched. Skipping file upload.");
            return null;
        }
    };

    return { presignedUrls, orchestrationResult, executeFileOperations, progress };
}

export default useFileOperations