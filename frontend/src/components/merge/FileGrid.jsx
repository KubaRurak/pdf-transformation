import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import Grid from '@mui/material/Grid';
import FileCard from './FileCard';

function FileGrid({ fileData, onDragEnd, onDelete }) {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
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
                                            onDelete={onDelete}
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
}

export default FileGrid;