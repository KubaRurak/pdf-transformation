import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Document, Page } from 'react-pdf';

import '@react-pdf-viewer/core/lib/styles/index.css';



function truncateFilename(filename, maxLength = 18) {
    if (filename.length <= maxLength) return filename;
    return `${filename.substring(0, maxLength - 3)}...`;
}



function FileCard({ fileName, onDelete, fileURL }) {

    return (
        <Card
            sx={{
                width: '100%',
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                padding: 1
            }}
        >
            <IconButton
                aria-label="delete"
                onClick={() => onDelete(fileName)}
                sx={{ position: 'absolute', right: 0, top: 0 }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            <CardContent sx={{ mt: 2, pt: 1, pb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '130px', overflow: 'hidden' }}>
                    <Document file={fileURL}>
                        <Page pageNumber={1} width={130} /> {/* You can adjust the width as needed */}
                    </Document>
                </div>

                <Typography align="center" variant="caption" color="text.secondary" sx={{ fontWeight: 500, position: 'absolute', bottom: 8}}>
                    {truncateFilename(fileName)}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default FileCard;