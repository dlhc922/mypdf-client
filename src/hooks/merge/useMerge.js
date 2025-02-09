import { useState, useCallback, useEffect, useRef } from 'react';

export const useMerge = () => {
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
      setError('至少需要两个 PDF 文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file.file);
      });

      console.log('Sending request to server...');
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/merge', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || errorData.details || 'PDF 合并失败');
        } catch (e) {
          throw new Error(`服务器错误: ${text.slice(0, 100)}...`);
        }
      }

      // 获取操作 ID
      const newOperationId = response.headers.get('x-operation-id');
      console.log('Received operation ID:', newOperationId);

      const blob = await response.blob();
      console.log('Received blob:', {
        size: blob.size,
        type: blob.type
      });
      
      // 清理之前的 URL
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
      
      // 创建新的 URL 并更新状态
      const url = URL.createObjectURL(blob);
      
      // 批量更新状态
      setMergedFileUrl(url);
      setHasServerFiles(true);
      setOperationId(newOperationId);

      console.log('Updated state:', {
        url,
        hasServerFiles: true,
        operationId: newOperationId
      });

      return url;
    } catch (err) {
      console.error('Merge failed:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback((url = mergedFileUrl) => {
    if (!url) {
      setError('没有可下载的文件');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_${new Date().getTime()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [mergedFileUrl]);

  const handleCleanup = useCallback(async () => {
    if (!operationId) {
      console.log('No operationId available for cleanup');
      return;
    }

    try {
      console.log('Cleaning up files for operation:', operationId);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/merge/cleanup/${operationId}`,
        {
          method: 'DELETE',
          mode: 'cors'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '清理文件失败');
      }

      // 清理状态
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
      setMergedFileUrl(null);
      setHasServerFiles(false);
      setOperationId(null);
      setError(null);
      setMessage('文件已成功删除');  // 设置成功消息

      console.log('Cleanup successful, state reset');
    } catch (err) {
      console.error('Cleanup failed:', err);
      setError(err.message);
    }
  }, [operationId, mergedFileUrl]);

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