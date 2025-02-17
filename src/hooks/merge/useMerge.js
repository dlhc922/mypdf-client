import { useState, useCallback, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTranslation } from 'react-i18next';

export const useMerge = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mergedFileUrl, setMergedFileUrl] = useState(null);
  const [hasServerFiles, setHasServerFiles] = useState(false);
  const filesRef = useRef(files);  // 添加 ref 来跟踪最新的文件列表
  const [operationId, setOperationId] = useState(null);
  const [message, setMessage] = useState(null);  // 添加消息状态

  // 更新 ref
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 清理所有预览 URL
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      // 清理合并后的文件 URL
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
    };
  }, [files, mergedFileUrl]);

  // 添加监听 files 变化的 effect
  useEffect(() => {
    console.log('useMerge files changed:', {
      length: files.length,
      files: files.map(f => f.name)
    });
  }, [files]);

  const handleFileSelect = useCallback((event) => {
    console.log('handleFileSelect called');
    const newFiles = Array.from(event.target.files || []);
    
    if (newFiles.length === 0) {
      console.log('No files selected');
      return;
    }

    if (newFiles.some(file => file.type !== 'application/pdf')) {
      console.log('Non-PDF file detected');
      return;
    }

    setFiles(prevFiles => {
      const updatedFiles = [
        ...prevFiles,
        ...newFiles.map((file, index) => {
          const url = URL.createObjectURL(file);
          console.log('Created file preview:', {
            name: file.name,
            url: url,
            type: file.type
          });
          return {
            id: `${Date.now()}-${index}`,
            name: file.name,
            file: file,
            previewUrl: url
          };
        })
      ];
      console.log('Setting files state:', updatedFiles);
      return updatedFiles;
    });

    event.target.value = '';
  }, []);

  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prevFiles.filter(file => file.id !== fileId);
    });
  }, []);

  // 新增独立的更新文件顺序函数，方便外部直接调用
  const updateFilesOrder = useCallback((newFilesOrder) => {
    setFiles(newFilesOrder);
  }, []);

  // 原来的 handleDragEnd 使用 setFiles 重新排序
  const handleDragEnd = useCallback((result) => {
    const { source, destination } = result;
    
    if (!destination || source.index === destination.index) {
      return;
    }

    setFiles(prevFiles => {
      // 使用不可变更新模式重新排列数组
      const newFiles = Array.from(prevFiles);
      const [movedFile] = newFiles.splice(source.index, 1);
      newFiles.splice(destination.index, 0, movedFile);
      
      // 只在文件顺序真正改变时才触发更新
      const hasOrderChanged = newFiles.some((file, index) => file.id !== prevFiles[index].id);
      if (!hasOrderChanged) {
        return prevFiles;
      }
      
      return newFiles;
    });
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError(t('merge.atLeastTwoFiles'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 创建一个空的 PDF 文档
      const mergedPdf = await PDFDocument.create();

      // 依次将每个选中的 PDF 文件加载并复制页面
      for (const fileItem of files) {
        // 读取 File 对象的 ArrayBuffer
        const arrayBuffer = await fileItem.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 保存合并后的 PDF 数据
      const mergedPdfBytes = await mergedPdf.save();

      // 清理之前生成的 URL（如果有）
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
      // 根据合并后的数据创建 Blob URL
      const url = URL.createObjectURL(
        new Blob([mergedPdfBytes], { type: 'application/pdf' })
      );
      setMergedFileUrl(url);
      // 客户端合并的结果不属于"服务器文件"
      setHasServerFiles(false);
      setMessage(t('merge.mergeSuccess'));
      console.log('Merged PDF successfully, URL:', url);
      return url;
    } catch (err) {
      console.error('Merge failed:', err);
      setError(err.message || t('merge.mergeFailed'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback((url = mergedFileUrl) => {
    if (!url) {
      setError(t('merge.noFileToDownload'));
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_${new Date().getTime()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [mergedFileUrl]);

  const handleCleanup = useCallback(() => {
    if (mergedFileUrl) {
      URL.revokeObjectURL(mergedFileUrl);
    }
    setMergedFileUrl(null);
    setMessage(t('merge.cleanupSuccess'));
  }, [mergedFileUrl, t]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (operationId) {
        handleCleanup().catch(console.error);
      }
    };
  }, [operationId, handleCleanup]);

  return {
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
    updateFilesOrder  // 导出更新文件顺序的函数
  };
};