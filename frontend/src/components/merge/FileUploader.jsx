import React, { useState } from 'react';

const FileUploader = ({ onFilesSelected }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        onFilesSelected(files);
    };

    return (
        <div>
            <input type="file" multiple onChange={handleFileChange} />
            <ul>
                {selectedFiles.map(file => (
                    <li key={file.name}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FileUploader;