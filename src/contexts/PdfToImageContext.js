// client/src/contexts/PdfToImageContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { pdfjs } from 'react-pdf';

export const PdfToImageContext = createContext();

export function usePdfToImageContext() {
  const context = useContext(PdfToImageContext);
  if (!context) {
    throw new Error('usePdfToImageContext must be used within a PdfToImageProvider');
  }
  return context;
}

export function PdfToImageProvider({ children }) {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [imageFormat, setImageFormat] = useState('png'); // 'png', 'jpeg'
  const [imageQuality, setImageQuality] = useState(1.0); // 0.1 - 1.0
  const [resolution, setResolution] = useState(1.5); // 缩放因子，影响图像分辨率

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setError(null);
      setImageUrls([]);
    }
  };

  const handleCleanup = useCallback(() => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    
    // 清理所有图片 URL
    imageUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    setFile(null);
    setFileUrl(null);
    setLoading(false);
    setConverting(false);
    setError(null);
    setImageUrls([]);
    setProgress(0);
    setTotalPages(0);
  }, [fileUrl, imageUrls]);

  const convertPdfToImage = useCallback(async () => {
    if (!file) return;

    try {
      setConverting(true);
      setError(null);
      setProgress(0);
      setImageUrls([]);
      
      // 加载 PDF 文档
      const fileArrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: fileArrayBuffer }).promise;
      setTotalPages(pdf.numPages);
      
      const newImageUrls = [];
      
      // 逐页转换
      for (let i = 1; i <= pdf.numPages; i++) {
        // 更新进度
        setProgress(((i - 1) / pdf.numPages) * 100);
        
        // 获取页面
        const page = await pdf.getPage(i);
        
        // 设置缩放以获得更高分辨率
        const viewport = page.getViewport({ scale: resolution });
        
        // 创建 canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // 渲染到 canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // 转换为图片
        let imageUrl;
        if (imageFormat === 'jpeg') {
          imageUrl = canvas.toDataURL('image/jpeg', imageQuality);
        } else {
          imageUrl = canvas.toDataURL('image/png');
        }
        
        // 创建 Blob 对象，便于下载
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        newImageUrls.push({
          url: blobUrl,
          pageNumber: i
        });
        
        setProgress((i / pdf.numPages) * 100);
      }
      
      setImageUrls(newImageUrls);
      setProgress(100);
      
    } catch (err) {
      console.error("转换失败:", err);
      setError(err.message || '转换过程中出错');
    } finally {
      setConverting(false);
    }
  }, [file, imageFormat, imageQuality, resolution]);

  const downloadAllImages = useCallback(() => {
    if (imageUrls.length === 0) return;

    // 创建 zip 文件
    const downloadZip = async () => {
      try {
        // 动态导入 JSZip 库
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        // 添加所有图片到 zip
        for (let i = 0; i < imageUrls.length; i++) {
          const imageData = await fetch(imageUrls[i].url).then(r => r.blob());
          const extension = imageFormat === 'jpeg' ? 'jpg' : 'png';
          zip.file(`page_${imageUrls[i].pageNumber}.${extension}`, imageData);
        }
        
        // 生成 zip 文件并下载
        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(content);
        
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${file.name.replace('.pdf', '')}_images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理
        URL.revokeObjectURL(zipUrl);
      } catch (error) {
        console.error('下载失败:', error);
        setError('创建压缩包失败');
      }
    };
    
    downloadZip();
  }, [imageUrls, file, imageFormat]);

  const downloadSingleImage = useCallback((imageUrl, pageNumber) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const extension = imageFormat === 'jpeg' ? 'jpg' : 'png';
    link.download = `page_${pageNumber}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageFormat]);

  const value = {
    file,
    fileUrl,
    loading,
    converting,
    error,
    imageUrls,
    progress,
    totalPages,
    imageFormat,
    imageQuality,
    resolution,
    handleFileChange,
    handleCleanup,
    convertPdfToImage,
    downloadAllImages,
    downloadSingleImage,
    setImageFormat,
    setImageQuality,
    setResolution,
    setLoading
  };

  return (
    <PdfToImageContext.Provider value={value}>
      {children}
    </PdfToImageContext.Provider>
  );
}