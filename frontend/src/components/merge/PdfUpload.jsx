import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function PdfUpload({ onUpload, uploadedFiles, presignedUrls }) {

    const handleFiles = (event) => {
        if (event.target.files.length > 0) {
            onUpload(event.target.files);
        }
    };

    return (
        <div>
            <Button variant="contained" component="label" sx={{ mt: 2, mb: 2, width: '100%' }}>
                Add files to merge
                <input
                    type="file"
                    accept=".pdf"
                    multiple
                    hidden
                    onChange={handleFiles}
                />
            </Button>
            <Typography align="center">Or drop the files on the screen</Typography>
        </div>
    );
}

export default PdfUpload;