import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function PdfUpload({ onUpload, uploadedFiles }) {

    const handleFiles = (event) => {
        if (event.target.files.length > 0) {
            onUpload(event.target.files);
        }
    };

    return (
        <div>
            <Button variant="contained" component="label" sx={{ mt: 2, mb: 2, width: '100%' }}>
                Browse Files
                <input
                    type="file"
                    accept=".pdf"
                    multiple
                    hidden
                    onChange={handleFiles}
                />
            </Button>
            {uploadedFiles.map((name, index) => (
                <Typography key={index} sx={{ mb: 1 }}>
                    {name}
                </Typography>
            ))}
        </div>
    );
}

export default PdfUpload;