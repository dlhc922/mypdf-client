import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTranslation } from 'react-i18next';

// 格式化文件大小的工具函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const useCompress = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [quality, setQuality] = useState(70); // 默认压缩质量 70%
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.[0]) return;
    const pdfFile = selectedFiles[0];
    if (pdfFile.type !== 'application/pdf') {
      setError(t('compress.selectPDF'));
      return;
    }
    setFile(pdfFile);
    setCompressedFile(null);
    setError(null);
    setMessage(null);
  }, [t]);

  const handleCompress = async () => {
    if (!file) {
      setError(t('compress.selectFile'));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // 创建新的 PDF 文档
      const newPdfDoc = await PDFDocument.create();

      // 处理每一页
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const [newPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        
        // 获取页面尺寸
        const { width, height } = page.getSize();
        
        // 压缩页面内容
        newPage.setSize(width, height);
        
        newPdfDoc.addPage(newPage);

        // 更新进度
        const currentProgress = Math.round(((i + 1) / totalPages) * 100);
        setProgress(currentProgress);
      }

      // 移除文档元数据
      newPdfDoc.setTitle('');
      newPdfDoc.setAuthor('');
      newPdfDoc.setSubject('');
      newPdfDoc.setKeywords([]);
      newPdfDoc.setCreator('');
      newPdfDoc.setProducer('');

      // 使用优化的压缩选项
      const compressedBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        preserveEditability: false,
        objectsPerTick: 20,
        updateFieldAppearances: false,
        compress: true
      });

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      setCompressedFile(blob);

      // 计算压缩率
      const originalSize = file.size;
      const compressedSize = blob.size;
      const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      if (compressedSize >= originalSize) {
        setMessage(t('compress.alreadyOptimal', { fileSize: formatFileSize(originalSize) }));
        setCompressedFile(null);
      } else {
        setMessage(t('compress.compressSuccess', { 
          originalSize: formatFileSize(originalSize), 
          compressedSize: formatFileSize(compressedSize), 
          ratio 
        }));
      }
    } catch (err) {
      console.error('压缩失败:', err);
      setError(err.message || t('compress.fileProcessingFailed'));
      setCompressedFile(null);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = useCallback((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [file]);

  return {
    file,
    compressedFile,
    loading,
    error,
    message,
    quality,
    setQuality,
    handleFileSelect,
    handleCompress,
    handleDownload,
    setFile,
    setCompressedFile,
    setError,
    setMessage,
    formatFileSize,
    progress,
    setProgress,
  };
}; 