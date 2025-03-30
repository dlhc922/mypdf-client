import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

export const PdfToWordContext = createContext();

export function usePdfToWordContext() {
  const context = useContext(PdfToWordContext);
  if (!context) {
    throw new Error('usePdfToWordContext must be used within a PdfToWordProvider');
  }
  return context;
}

export function PdfToWordProvider({ children }) {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (selectedFile) => {
    console.log('📂 文件选择:', selectedFile?.name);
    if (selectedFile) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleCleanup = useCallback(() => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    
    setFile(null);
    setFileUrl(null);
    setLoading(false);
    setConverting(false);
    setError(null);
    setResultUrl(null);
    setProgress(0);
  }, [fileUrl]);

  const convertPdfToWord = useCallback(async () => {
    console.log('🚀 开始转换');
    if (!file) {
      console.log('❌ 没有文件');
      return;
    }

    try {
      setConverting(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      // 检查 API URL
      const apiUrl = `${process.env.REACT_APP_API_URL}/convert/pdf-to-word`;
      console.log('🌐 请求地址:', apiUrl);

      const response = await axios.post(
        apiUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('📤 上传进度:', percentCompleted);
            setProgress(percentCompleted);
          }
        }
      );

      console.log('✅ 响应:', response.data);
      setProgress(100);
      setResultUrl(response.data.downloadUrl);
      return response.data;

    } catch (err) {
      console.error('❌ 错误:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'convert failed');
      throw err;
    } finally {
      setConverting(false);
    }
  }, [file]);

  // 添加 debug 信息
  console.log('PdfToWordContext 当前状态:', {
    hasFile: !!file,
    isConverting: converting,
    progress,
    hasError: !!error,
    hasResult: !!resultUrl
  });

  const value = {
    file,
    fileUrl,
    loading,
    converting,
    error,
    resultUrl,
    progress,
    handleFileChange,
    handleCleanup,
    convertPdfToWord,
    setLoading
  };

  return (
    <PdfToWordContext.Provider value={value}>
      {children}
    </PdfToWordContext.Provider>
  );
} 