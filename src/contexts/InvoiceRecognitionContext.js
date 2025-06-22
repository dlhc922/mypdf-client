import React, { createContext, useState, useContext } from 'react';

const InvoiceRecognitionContext = createContext();

export const useInvoiceRecognitionContext = () => {
  return useContext(InvoiceRecognitionContext);
};

export const InvoiceRecognitionProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'completed'
  const [fileStatuses, setFileStatuses] = useState({}); // To track individual file status
  const [fileProgress, setFileProgress] = useState({}); // To track individual file progress

  const addFiles = (newFiles) => {
    const newFileObjects = Array.from(newFiles).map(file => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        status: 'pending', // 'pending', 'processing', 'success', 'error'
        error: null,
        progress: 0,
    }));
    setFiles(prevFiles => [...prevFiles, ...newFileObjects]);
  };

  const updateFileStatus = (fileName, status) => {
    setFileStatuses(prev => ({ ...prev, [fileName]: status }));
  };

  const updateFileProgress = (fileName, progress) => {
    setFileProgress(prev => ({ ...prev, [fileName]: progress }));
  };

  const resetState = () => {
    setFiles([]);
    setInvoiceData([]);
    setProgress(0);
    setStatus('idle');
    setFileStatuses({});
    setFileProgress({});
  }

  const value = {
    files,
    setFiles, // Directly exposing setFiles for simplicity in the hook
    addFiles,
    invoiceData,
    setInvoiceData,
    progress,
    setProgress,
    status,
    setStatus,
    fileStatuses,
    fileProgress,
    updateFileStatus,
    updateFileProgress,
    resetState,
  };

  return (
    <InvoiceRecognitionContext.Provider value={value}>
      {children}
    </InvoiceRecognitionContext.Provider>
  );
}; 