import React, { createContext, useContext } from 'react';
import { useMerge } from '../hooks/merge/useMerge';

const MergeContext = createContext(null);

export const MergeProvider = ({ children }) => {
  const {
    files,
    loading,
    error,
    mergedFileUrl,
    hasServerFiles,
    handleFileSelect,
    handleMerge,
    handleDownload,
    handleRemoveFile,
    handleDragEnd,
    handleCleanup,
    message,
    setMessage,
    updateFilesOrder, // 新增用于更新文件顺序的函数
  } = useMerge();

  const value = {
    files,
    loading,
    error,
    mergedFileUrl,
    hasServerFiles,
    handleFileSelect,
    handleMerge,
    handleDownload,
    handleRemoveFile,
    handleDragEnd,
    handleCleanup,
    message,
    setMessage,
    updateFilesOrder,
  };

  console.log('MergeProvider state:', {
    hasServerFiles,
    message,
    filesCount: files.length,
  });

  return (
    <MergeContext.Provider value={value}>
      {children}
    </MergeContext.Provider>
  );
};

export function useMergeContext() {
  const context = useContext(MergeContext);
  if (!context) {
    throw new Error('useMergeContext must be used within a MergeProvider');
  }
  return context;
}