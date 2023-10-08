import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import PdfTransformationApp from './components/PdfTransformationApp';
import theme from './themes/theme';
import { Worker } from '@react-pdf-viewer/core';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"> */}

      <Worker workerUrl={`${process.env.PUBLIC_URL}/pdf.worker.min.js`}>
        <div className="App">
          <PdfTransformationApp />
        </div>
      </Worker>
    </ThemeProvider>
  );
}

export default App;