import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function FileCard({ fileName, isDragging, onDelete }) {
    return (
        <Card
            sx={{
                width: '100%',
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                padding: 1,
                transition: 'background-color 0.3s, transform 0.3s', // existing transition
                "&:hover": {
                    backgroundColor: '#f5f5f5', // slight grey on hover
                },
                ...(isDragging && {
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // enhanced shadow when dragging
                    backgroundColor: '#e0e0e0', // slight change in background when dragging
                    transform: 'scale(1.05)'   // scale up a bit when dragging
                })
            }}
        >
            <IconButton
                aria-label="delete"
                onClick={() => onDelete(fileName)}
                sx={{ position: 'absolute', right: 5, top: 5 }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
            <CardContent sx={{ mt: 5, pt: 3, pb: 1 }}>
                <Typography align="left" gutterBottom variant="h7" component="div" sx={{ fontWeight: 500 }}>
                    {fileName}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default FileCard;