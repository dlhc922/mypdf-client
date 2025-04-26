import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { convertToMarkdown, downloadMarkdownFile } from '../../services/markdownService';

export const useMarkdown = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [convertedMarkdown, setConvertedMarkdown] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { t } = useTranslation();
  
  
  // 自动检测文件类型
  const detectFileType = (file) => {
    const fileName = file.name.toLowerCase();
    
    // 文档类型
    if (/\.pdf$/.test(fileName)) return 'pdf';
    if (/\.(docx?|dot|dotx)$/.test(fileName)) return 'word';
    if (/\.(xlsx?|xlsm|xlsb|xls)$/.test(fileName)) return 'excel';
    if (/\.(pptx?|ppt|potx?)$/.test(fileName)) return 'powerpoint';
    
    // 图像类型
    if (/\.(jpe?g|png|gif|bmp|webp|svg)$/.test(fileName)) return 'image';
    
    // 音频类型
    if (/\.(mp3|wav|ogg|flac|aac)$/.test(fileName)) return 'audio';
    
    // 视频类型
    if (/\.(mp4|webm|mov|avi)$/.test(fileName)) return 'video';
    
    // 文本类型
    if (/\.(txt|md)$/.test(fileName)) return 'text';
    if (/\.(html?|xml)$/.test(fileName)) return 'html';
    if (/\.(json|csv)$/.test(fileName)) return 'data';
    
    // 默认类型
    return 'unknown';
  };
  
  // 判断文件是否可以预览
  const isPreviewable = (type) => {
    return ['pdf', 'image', 'audio', 'video', 'text', 'html'].includes(type);
  };
  
  // 判断文件是否支持转换
  const isSupportedForConversion = (type) => {
    return ['pdf', 'word', 'powerpoint', 'excel', 'text', 'html', 'data', 'image'].includes(type);
  };

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    // 自动检测文件类型
    const detectedType = detectFileType(selectedFile);
    
    // 检查是否支持转换
    if (!isSupportedForConversion(detectedType)) {
      setError(t('documentToMarkdown.errors.unsupportedFileType'));
      return;
    }
    
    // Generate temporary URL for preview
    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setFileUrl(url);
    setFileType(detectedType);
    setError(null);
    setConvertedMarkdown(null);
    setMessage(t('documentToMarkdown.steps.fileSelected', { 
      name: selectedFile.name, 
      type: t(`documentToMarkdown.fileTypes.${detectedType}`) 
    }));
  }, [t]);

  // Handle conversion
  const handleConvert = useCallback(async (options = {}) => {
    if (!file) {
      setError(t('documentToMarkdown.errors.noFile'));
      return;
    }

    console.log('useMarkdown 接收到选项:', options);
    setLoading(true);
    setError(null);
    
    
    try {
      // 确保选项是对象，并包含预期的属性
      const processedOptions = {
        useOcr: Boolean(options.useOcr),
        preserveTables: options.preserveTables !== false
      };
      
      console.log('处理后选项:', processedOptions);
      const result = await convertToMarkdown(file, fileType, processedOptions);
      
      if (result.status === 'success') {
        // 存储从服务器返回的数据
        setConvertedMarkdown(result.markdown);
        setFileId(result.fileId);
        setDownloadFileName(result.fileName);
        setMessage(t('documentToMarkdown.conversionSuccess'));
      } else {
        throw new Error(result.message || 'Unknown error during conversion');
      }
    } catch (err) {
      console.error('Markdown conversion failed:', err);
      setError(t('documentToMarkdown.errors.conversionFailed'));
    } finally {
      setLoading(false);
    }
  }, [file, fileType, t]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!fileId) {
      setError(t('documentToMarkdown.errors.noFileToDownload'));
      return;
    }
    
    setDownloadLoading(true);
    
    try {
      // 调用新函数下载Markdown文件
      const blob = await downloadMarkdownFile(fileId);
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // 使用服务器提供的文件名，如果没有则使用原文件名
      const fileName = downloadFileName || 
                     `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.md`;
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage(t('documentToMarkdown.downloadStarted'));
    } catch (err) {
      console.error('Download failed:', err);
      setError(t('documentToMarkdown.errors.downloadFailed'));
    } finally {
      setDownloadLoading(false);
    }
  }, [fileId, downloadFileName, file, t]);

  // Cleanup resources
  const cleanup = useCallback(() => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
  }, [fileUrl]);

  return {
    file,
    fileUrl,
    fileType,
    loading,
    error,
    message,
    convertedMarkdown,
    handleFileSelect,
    handleConvert,
    handleDownload,
    setError,
    setMessage,
    cleanup,
    isPreviewable
  };
}; 