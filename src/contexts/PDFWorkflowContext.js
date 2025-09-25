import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PDFWorkflowContext = createContext();

export const usePDFWorkflow = () => {
  const context = useContext(PDFWorkflowContext);
  if (!context) {
    throw new Error('usePDFWorkflow must be used within PDFWorkflowProvider');
  }
  return context;
};

export const PDFWorkflowProvider = ({ children }) => {
  const [currentFile, setCurrentFile] = useState(null);
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [currentMode, setCurrentMode] = useState('stamp'); // 'stamp' | 'sign'
  const [isProcessing, setIsProcessing] = useState(false);
  
  console.log('=== PDFWorkflowProvider 初始化 ===');
  console.log('currentFile:', currentFile);
  console.log('workflowHistory:', workflowHistory);
  console.log('currentMode:', currentMode);
  
  // 添加文件到工作流
  const addToWorkflow = useCallback((operation, resultFile, metadata = {}) => {
    console.log('=== PDFWorkflowContext.addToWorkflow ===');
    console.log('操作类型:', operation);
    console.log('文件信息:', {
      name: resultFile.name,
      size: resultFile.size,
      type: resultFile.type
    });
    console.log('元数据:', metadata);
    
    const newEntry = {
      id: Date.now(),
      operation,
      file: resultFile,
      timestamp: Date.now(),
      metadata
    };
    
    setWorkflowHistory(prev => {
      const newHistory = [...prev, newEntry];
      console.log('工作流历史更新:', newHistory);
      return newHistory;
    });
    
    setCurrentFile(resultFile);
    console.log('当前文件已设置:', resultFile.name);
    console.log('=== addToWorkflow 完成 ===');
  }, []);
  
  // 切换模式
  const switchMode = useCallback((mode) => {
    setCurrentMode(mode);
    console.log(`切换到模式: ${mode}`);
  }, []);
  
  // 清理工作流
  const clearWorkflow = useCallback(() => {
    setCurrentFile(null);
    setWorkflowHistory([]);
    setCurrentMode('stamp');
    setIsProcessing(false);
    console.log('工作流已清理');
  }, []);
  
  // 设置处理状态
  const setProcessing = useCallback((processing) => {
    setIsProcessing(processing);
  }, []);
  
  // 获取当前操作的文件
  const getCurrentFile = useCallback(() => {
    return currentFile;
  }, [currentFile]);
  
  // 获取工作流历史
  const getWorkflowHistory = useCallback(() => {
    return workflowHistory;
  }, [workflowHistory]);
  
  // 检查是否有可用的文件
  const hasFile = useCallback(() => {
    return currentFile !== null;
  }, [currentFile]);
  
  // 获取最后处理的文件
  const getLastProcessedFile = useCallback(() => {
    if (workflowHistory.length === 0) return null;
    return workflowHistory[workflowHistory.length - 1].file;
  }, [workflowHistory]);
  
  // 监听文件变化，通知子组件
  useEffect(() => {
    // 可以通过事件或其他方式通知子组件文件已更新
    if (currentFile) {
      console.log('当前文件已更新:', currentFile.name);
    }
  }, [currentFile]);
  
  const value = {
    currentFile,
    workflowHistory,
    currentMode,
    isProcessing,
    addToWorkflow,
    switchMode,
    clearWorkflow,
    setProcessing,
    getCurrentFile,
    getWorkflowHistory,
    hasFile,
    getLastProcessedFile
  };
  
  return (
    <PDFWorkflowContext.Provider value={value}>
      {children}
    </PDFWorkflowContext.Provider>
  );
};
