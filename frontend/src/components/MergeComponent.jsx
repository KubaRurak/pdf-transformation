import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import PdfUpload from './PdfUpload';
import Grid from '@mui/material/Grid'; // <-- Import the Grid component
import FileCard from './FileCard';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';

function MergeComponent() {
    const [fileData, setFileData] = useState([]);
    const [dragging, setDragging] = useState(false);
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
                    <PdfUpload onUpload={handleUpload} uploadedFiles={fileData} />
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