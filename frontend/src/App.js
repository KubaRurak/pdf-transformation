import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import PdfTransformationApp from './components/PdfTransformationApp';
import theme from './themes/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <PdfTransformationApp />
      </div>
    </ThemeProvider>
  );
}

export default App;