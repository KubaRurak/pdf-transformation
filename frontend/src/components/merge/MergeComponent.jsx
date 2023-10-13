import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import PdfUpload from './PdfUpload';
import Button from '@mui/material/Button';
import useFileOperations from './useFileOperations';
import { useDragDrop } from './useDragDrop';
import FileGrid from './FileGrid';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';

function MergeComponent() {

    const action = "merge";
    const [fileData, setFileData] = useState([]);
    const [mergeState, setMergeState] = useState('idle'); // possible values: 'idle', 'processing', 'completed'

    const handleUpload = (files) => {
        const newFiles = [...files].map(file => ({
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setFileData(prevData => [...prevData, ...newFiles]);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedFileData = Array.from(fileData);
        const [reorderedItem] = reorderedFileData.splice(result.source.index, 1);
        reorderedFileData.splice(result.destination.index, 0, reorderedItem);

        setFileData(reorderedFileData);
    };

    const { dragging, handleDrop, handleDragEnter, handleDragLeave } = useDragDrop(handleUpload);
    const { presignedUrls, orchestrationResult, executeFileOperations, progress } = useFileOperations(fileData, action);

    const handleMergeOperation = async () => {
        setMergeState('processing');
        const downloadLink = await executeFileOperations();
        if (downloadLink) {
            setMergeState('completed');
        } else {
            alert('There was an error during the orchestration. Please try again.');
            setMergeState('idle');
        }
    };

    const handleFileChange = (event) => {
        handleUpload(event.target.files);
    };

    const OverlayComponent = () => (
        <Box
            sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 2
            }}
        >
            <Typography variant="h6" color="rgba(255, 255, 255, 0.8)">Select PDF files</Typography>
        </Box>
    );

    const DescriptionComponent = () => {
        return (
            <Box sx={{ pt: 8, pb: 0 }}>
                {fileData && fileData.length === 0 ? (
                    <>
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
                    </>
                ) : (
                    <Typography variant="h5" align="center" color="text.secondary" paragraph>
                        Drag and drop files to change the order of PDFs
                    </Typography>
                )}
            </Box>
        );
    };

    function UploadButtonComponent({ onFileChange }) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 3
                }}
            >
                <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="add-more-files"
                    multiple
                    type="file"
                    onChange={onFileChange}
                />
                <Tooltip title="Add more files">
                    <label htmlFor="add-more-files">
                        <Fab
                            component="span"
                            color="primary"
                            size="small"
                        >
                            <AddIcon />
                        </Fab>
                    </label>
                </Tooltip>
            </Box>
        );
    }

    function MergeProgressComponent({ progress }) {
        return (
            <>
                {progress.generatingLinks && (
                    <div align="center">
                        <Typography align="center">Generating upload links...</Typography>
                        <CircularProgress />
                    </div>
                )}
                {progress.uploading && (
                    <div>
                        <Typography align="center">Uploading files... {progress.uploadProgress}%</Typography>
                        <LinearProgress variant="determinate" value={progress.uploadProgress} />
                    </div>
                )}
                {progress.waitingForMerge && (
                    <div align="center">
                        <Typography align="center">Waiting for server to merge files...</Typography>
                        <CircularProgress />
                    </div>
                )}
            </>
        );
    }

    function SuccessComponent({ orchestrationResult }) {
        return (
            <div>
                <Typography align="center">Merging successful!</Typography>
                <a href={orchestrationResult} download style={{ textDecoration: 'none' }}>
                    <Button
                        variant="contained"
                        sx={{ mt: 2, mb: 2, width: '100%' }}>
                        Download Merged PDF
                    </Button>
                </a>
            </div>
        );
    }

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
                    {mergeState === 'idle' && (
                        <Box position="relative">
                            <FileGrid
                                fileData={fileData}
                                onDragEnd={handleDragEnd}
                                onDelete={(nameToDelete) => {
                                    setFileData(prevNames => prevNames.filter(f => f.name !== nameToDelete));
                                }}
                            />
                            {fileData && fileData.length > 0 && (
                                <UploadButtonComponent onFileChange={handleFileChange} />
                            )}
                            <DescriptionComponent />
                            {(!fileData || fileData.length === 0) &&
                                <PdfUpload onUpload={handleUpload} uploadedFiles={fileData} presignedUrls={presignedUrls} />
                            }
                            {(fileData && fileData.length > 0) && (
                                <Button
                                    variant="contained"
                                    component="label"
                                    sx={{ mt: 2, mb: 2, width: '100%' }}
                                    onClick={handleMergeOperation}
                                    disabled={!fileData || fileData.length === 0}>
                                    Merge PDFs
                                </Button>
                            )}
                        </Box>
                    )}

                    {mergeState === 'processing' && (
                        <MergeProgressComponent progress={progress} />
                    )}

                    {mergeState === 'completed' && (
                        <SuccessComponent orchestrationResult={orchestrationResult} />
                    )}
                </Container>
            </Box>
        </main>
    );
}



export default MergeComponent;