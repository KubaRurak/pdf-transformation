import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import PdfUpload from './PdfUpload';
import Grid from '@mui/material/Grid'; // <-- Import the Grid component
import FileCard from './FileCard';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import Button from '@mui/material/Button';


function MergeComponent() {
    const [fileData, setFileData] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [presignedUrls, setPresignedUrls] = useState([]);
    // const [UUID, setUUID] = useState(0);
    const dragCounter = useRef(0);

    const handleUpload = (files) => {
        const newFiles = [...files].map(file => ({
            id: `${file.name}-${Date.now()}`,  // unique id based on name and timestamp
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setFileData(prevData => [...prevData, ...newFiles]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);  // Reset the drag state on drop
        dragCounter.current = 0;  // Reset the dragCounter on drop
        if (event.dataTransfer.items) {
            const files = [];
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    files.push(event.dataTransfer.items[i].getAsFile());
                }
            }
            handleUpload(files);
        }
        setDragging(false);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        console.log(dragCounter.current);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        console.log(dragCounter.current);
        if (dragCounter.current === 0) {
            setDragging(false);
        }
    };

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
            return {}; // Return an empty object in case of an error
        }
    };

    const uploadToPresignedUrl = async (file, presignedUrl) => {
        try {
            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': 'application/pdf' // Since you are uploading PDFs
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
    
    const uploadFiles = async (presignedUrls) => {
        for (let i = 0; i < fileData.length; i++) {
            const fileBlob = await fetch(fileData[i].url).then(r => r.blob());
            const presignedUrl = presignedUrls[i];
            await uploadToPresignedUrl(fileBlob, presignedUrl);
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
            
            // if (!response.ok) {
            //     throw new Error(`Failed to start orchestration. Status: ${response.status}`);
            // }
    
            const responseData = await response.json();
            console.log(`Orchestration result: `, responseData);
    
            return responseData;
    
        } catch (error) {
            console.error("Failed to start the orchestration", error);
            return null; // or some error handling value
        }
    };
    
    const handleUploadButtonClick = async () => {
        const { presignedUrls, uuid } = await fetchPresignedUrls();
        if (presignedUrls && presignedUrls.length) {
            setPresignedUrls(presignedUrls); // Save the fetched URLs to the state
            await uploadFiles(presignedUrls);
    
            const orchestrationResult = await startOrchestration(uuid, "merge", fileData.length);
            if (orchestrationResult) {
                const downloadLink = orchestrationResult; // Assuming orchestrationResult is the direct URL
    
                // Update the state or display a message to the user with the download link
                alert(`Merging successful! Your merged PDF is available here: ${downloadLink}`);
    
                // Optionally, you can automatically start the download or redirect the user
                window.open(downloadLink, '_blank');  // Open in a new tab
            } else {
                alert('There was an error during the orchestration. Please try again.');
            }
    
        } else {
            console.warn("No pre-signed URLs fetched. Skipping file upload.");
        }
    };

    

    const handleDragEnd = (result) => {
        if (!result.destination) return;  // Dropped outside the list

        const reorderedFileData = Array.from(fileData);
        const [reorderedItem] = reorderedFileData.splice(result.source.index, 1);
        reorderedFileData.splice(result.destination.index, 0, reorderedItem);

        setFileData(reorderedFileData);
    };



    const renderGrid = () => (
        <DragDropContext onDragEnd={handleDragEnd}>
            <StrictModeDroppable droppableId="fileNames" direction="horizontal">
                {(provided) => (
                    <Grid container spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                        {fileData.map((file, index) => (
                            <Draggable key={file.id} draggableId={file.id} index={index}>
                                {(provided, snapshot) => (
                                    <Grid item xs={6} sm={4} md={3} lg={2.4}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <FileCard
                                            fileName={file.name}
                                            fileURL={file.url}
                                            isDragging={snapshot.isDragging}
                                            onDelete={(nameToDelete) => {
                                                setFileData(prevNames => prevNames.filter(f => f.name !== nameToDelete));
                                            }}
                                        />
                                    </Grid>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Grid>
                )}
            </StrictModeDroppable>
        </DragDropContext>
    );

    return (
        <main
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            style={{ position: 'relative' }}
        >
            <Box sx={{ pt: 8, pb: 0 }}>
                {dragging && <OverlayComponent />}
                <Container maxWidth="md">
                    {renderGrid()}
                    <DescriptionComponent />
                    <PdfUpload onUpload={handleUpload} uploadedFiles={fileData} presignedUrls={presignedUrls} />
                    <Button variant="contained" onClick={handleUploadButtonClick} sx={{ mt: 2, mb: 2, width: '100%' }}>
                        Get Presigned URLs
                    </Button>
                </Container>
            </Box>
        </main>
    );
}

const OverlayComponent = () => (
    <Box
        sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 2
        }}
    >
        <Typography variant="h6" color="rgba(255, 255, 255, 0.8)">Drop Files</Typography>
    </Box>
);

const DescriptionComponent = () => (
    <Box sx={{ pt: 8, pb: 0 }}>
        <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
        >
            Merge PDFs
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Combine PDFs in whatever order you want
        </Typography>
    </Box>
);

export default MergeComponent;