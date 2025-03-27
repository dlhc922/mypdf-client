// client/src/contexts/PdfToExcelContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

export const PdfToExcelContext = createContext();

export function usePdfToExcelContext() {
  const context = useContext(PdfToExcelContext);
  if (!context) {
    throw new Error('usePdfToExcelContext must be used within a PdfToExcelProvider');
  }
  return context;
}

export function PdfToExcelProvider({ children }) {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (selectedFile) => {
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

  const convertPdfToExcel = useCallback(async () => {
    if (!file) return;

    try {
      setConverting(true);
      setError(null);
      setProgress(0);
      
      const formData = new FormData();
      formData.append('pdf', file);
      
      console.log('准备上传文件:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/convert/pdf-to-excel`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('上传进度:', percentCompleted + '%');
            setProgress(percentCompleted);
          }
        }
      );

      console.log('服务器响应:', response.data);

      // 检查不同格式的下载链接字段
      let downloadUrl = null;
      
      if (response.data.downloadUrl) {
        downloadUrl = response.data.downloadUrl;
      } else if (response.data.download_url) {
        downloadUrl = response.data.download_url;
      } else if (response.data.url) {
        downloadUrl = response.data.url;
      } else if (typeof response.data === 'string') {
        // 如果响应直接是字符串形式的URL
        downloadUrl = response.data;
      }
      
      // 确保下载链接是完整的URL
      if (downloadUrl) {
        // 如果是相对路径，添加服务器基础URL
        if (downloadUrl.startsWith('/')) {
          downloadUrl = `${process.env.REACT_APP_API_URL}${downloadUrl}`;
        } else if (!downloadUrl.startsWith('http')) {
          downloadUrl = `${process.env.REACT_APP_API_URL}/${downloadUrl}`;
        }
        
        setResultUrl(downloadUrl);
        setProgress(100);
        console.log('最终下载链接:', downloadUrl);
      } else {
        throw new Error('未获取到下载链接');
      }

    } catch (err) {
      console.error("转换失败:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = err.response?.data?.message || err.message || '转换失败';
      setError(errorMessage);
    } finally {
      setConverting(false);
    }
  }, [file]);

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
    convertPdfToExcel,
    setLoading
  };

  return (
    <PdfToExcelContext.Provider value={value}>
      {children}
    </PdfToExcelContext.Provider>
  );
}