import { useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { useTranslation } from 'react-i18next';

// 辅助函数：格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 辅助函数：解析页面范围字符串
const parsePageRanges = (rangeStr, totalPages) => {
  if (!rangeStr || !totalPages) return [];
  
  // 去除空格并分割逗号
  const parts = rangeStr.replace(/\s/g, '').split(',');
  const pageSet = new Set();
  
  for (const part of parts) {
    if (part.includes('-')) {
      // 处理页面范围，如 "1-5"
      const [start, end] = part.split('-').map(num => parseInt(num, 10));
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        continue; // 跳过无效范围
      }
      for (let i = start; i <= end; i++) {
        pageSet.add(i);
      }
    } else {
      // 处理单页，如 "1"
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pageSet.add(pageNum);
      }
    }
  }
  
  return [...pageSet].sort((a, b) => a - b);
};

export const useRotate = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [rotatedFile, setRotatedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // 旋转角度，默认90度
  const [rotationAngle, setRotationAngle] = useState(90);
  
  // 页面选择设置
  const [pageRangeType, setPageRangeType] = useState('all'); // 'all', 'even', 'odd', 'custom'
  const [customPageRange, setCustomPageRange] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);

  // 处理文件选择
  const handleFileSelect = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.[0]) return;
    const pdfFile = selectedFiles[0];
    if (pdfFile.type !== 'application/pdf') {
      setError(t('rotate.noFileSelected'));
      return;
    }
    
    setFile(pdfFile);
    setRotatedFile(null);
    setError(null);
    setMessage(null);
    setProgress(0);
    setSelectedPages([]);
    setCustomPageRange('');
  }, [t]);

  // 更新页面总数
  const updateTotalPages = useCallback((numPages) => {
    setTotalPages(numPages);
    // 默认选择所有页面
    if (pageRangeType === 'all') {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  }, [pageRangeType]);

  // 处理页面范围类型变更
  const handlePageRangeTypeChange = useCallback((type) => {
    setPageRangeType(type);
    
    if (!totalPages) return;
    
    // 根据类型更新选定页面
    switch (type) {
      case 'all':
        setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
        break;
      case 'even':
        setSelectedPages(Array.from({ length: Math.floor(totalPages / 2) }, (_, i) => (i + 1) * 2));
        break;
      case 'odd':
        setSelectedPages(Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => i * 2 + 1));
        break;
      case 'custom':
        // 自定义模式下，需要手动输入页码范围
        setSelectedPages(parsePageRanges(customPageRange, totalPages));
        break;
      default:
        setSelectedPages([]);
    }
  }, [totalPages, customPageRange]);

  // 处理自定义页面范围变更
  const handleCustomPageRangeChange = useCallback((rangeStr) => {
    setCustomPageRange(rangeStr);
    if (pageRangeType === 'custom') {
      setSelectedPages(parsePageRanges(rangeStr, totalPages));
    }
  }, [pageRangeType, totalPages]);

  // 执行旋转操作
  const handleRotate = async () => {
    if (!file) {
      setError(t('rotate.noFileSelected'));
      return;
    }

    if (selectedPages.length === 0) {
      setError(t('rotate.noPageSelected'));
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
      const totalSelectedPages = selectedPages.length;

      // 处理每一个选中的页面
      for (let i = 0; i < totalSelectedPages; i++) {
        const pageIndex = selectedPages[i] - 1; // 页码从1开始，索引从0开始
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          // 应用旋转
          page.setRotation(degrees(page.getRotation().angle + rotationAngle));
        }
        
        // 更新进度
        const currentProgress = Math.round(((i + 1) / totalSelectedPages) * 100);
        setProgress(currentProgress);
      }

      // 保存修改后的PDF
      const rotatedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
      setRotatedFile(blob);
      setMessage(t('rotate.rotateSuccess'));
    } catch (err) {
      console.error('旋转失败:', err);
      setError(err.message || t('rotate.rotateFailed'));
      setRotatedFile(null);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // 处理下载
  const handleDownload = useCallback((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = file.name.replace('.pdf', '');
    link.download = `${fileName}_rotated.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [file]);

  // 重置所有状态
  const resetState = useCallback(() => {
    setFile(null);
    setRotatedFile(null);
    setError(null);
    setMessage(null);
    setProgress(0);
    setSelectedPages([]);
    setCustomPageRange('');
    setPageRangeType('all');
    setRotationAngle(90);
  }, []);

  return {
    file,
    rotatedFile,
    loading,
    error,
    message,
    progress,
    rotationAngle,
    setRotationAngle,
    pageRangeType,
    setPageRangeType: handlePageRangeTypeChange,
    customPageRange,
    setCustomPageRange: handleCustomPageRangeChange,
    selectedPages,
    totalPages,
    updateTotalPages,
    handleFileSelect,
    handleRotate,
    handleDownload,
    setFile,
    setRotatedFile,
    setError,
    setMessage,
    resetState,
    formatFileSize,
  };
}; 