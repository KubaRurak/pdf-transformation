import React from 'react';
import FileUploader from './components/FileUploader';
import './App.css';

function App() {

  const handleFilesSelected = (files) => {
    console.log(files);
};

  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Merger</h1>
        <FileUploader onFilesSelected={handleFilesSelected} />
      </header>
    </div>
  );
}

export default App;
