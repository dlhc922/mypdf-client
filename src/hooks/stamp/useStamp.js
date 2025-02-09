import { useState, useCallback } from 'react';

export const useStamp = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);

  // 印章配置状态
  const [stampConfig, setStampConfig] = useState({
    imageUrl: null,
    size: 40,
    position: { x: 120, y: 190 },  // 默认位置
    pageSettings: {},
    isStraddle: false,
    straddleY: 140,  // 默认骑缝章位置
    selectedPages: [],
    currentPage: null,
    randomAngle: true,
  });

  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('请选择 PDF 文件');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setCurrentPage(1);
    setNumPages(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handlePageChange = useCallback((page, totalPages = null) => {
    if (totalPages !== null) {
      setNumPages(totalPages);
    }
    setCurrentPage(Math.min(Math.max(1, page), numPages || Infinity));
  }, [numPages]);

  const handleAddStamp = useCallback(async () => {
    // 稍后实现
  }, []);

  const handleDownload = useCallback(() => {
    // 稍后实现
  }, []);

  const handleCleanup = useCallback(async () => {
    // 稍后实现
  }, []);

  // 处理印章图片选择
  const handleStampImageSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png')) {
      setError('请选择PNG格式的图片');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStampConfig(prev => ({
        ...prev,
        imageUrl: reader.result
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // 添加清除印章图片的方法
  const handleClearStampImage = useCallback(() => {
    setStampConfig(prev => ({
      ...prev,
      imageUrl: null
    }));
  }, []);

  // 处理印章配置变更
  const handleStampConfigChange = useCallback((key, value) => {
    if (typeof key === 'string') {
      setStampConfig(prev => {
        const newConfig = {
          ...prev,
          [key]: value
        };

        // 确保必要的默认值始终存在
        if (newConfig.isStraddle && newConfig.straddleY === undefined) {
          newConfig.straddleY = 140;
        }
        if (newConfig.position === undefined) {
          newConfig.position = { x: 120, y: 190 };
        }

        return newConfig;
      });
    } else if (typeof key === 'object') {
      // 处理整个对象的更新
      setStampConfig(prev => {
        const newConfig = {
          ...prev,
          ...key
        };

        // 确保必要的默认值始终存在
        if (newConfig.isStraddle && newConfig.straddleY === undefined) {
          newConfig.straddleY = 140;
        }
        if (newConfig.position === undefined) {
          newConfig.position = { x: 120, y: 190 };
        }

        return newConfig;
      });
    }
  }, []);

  // 添加获取当前页面设置的辅助函数
  const getCurrentPageSettings = useCallback(() => {
    if (!stampConfig.currentPage) return null;
    return stampConfig.pageSettings[stampConfig.currentPage] || {
      position: { x: 50, y: 50 },
      rotation: 0
    };
  }, [stampConfig.currentPage, stampConfig.pageSettings]);

  // 修改页面选择处理函数
  const handlePageSelect = useCallback((pageNumber) => {
    setStampConfig(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  }, []);

  // 修改印章位置和角度的处理函数
  const handleStampPositionChange = useCallback((x, y) => {
    if (!stampConfig.currentPage) return;
    
    setStampConfig(prev => ({
      ...prev,
      pageSettings: {
        ...prev.pageSettings,
        [prev.currentPage]: {
          ...(prev.pageSettings?.[prev.currentPage] || { rotation: 0 }),
          position: { x, y }
        }
      }
    }));
  }, [stampConfig.currentPage]);

  const handleStampRotationChange = useCallback((rotation) => {
    if (!stampConfig.currentPage) return;

    setStampConfig(prev => ({
      ...prev,
      pageSettings: {
        ...prev.pageSettings,
        [prev.currentPage]: {
          ...(prev.pageSettings?.[prev.currentPage] || { position: { x: 50, y: 50 } }),
          rotation
        }
      }
    }));
  }, [stampConfig.currentPage]);

  return {
    file,
    loading,
    error,
    message,
    zoom,
    currentPage,
    numPages,
    handleFileSelect,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handlePageChange,
    handleAddStamp,
    handleDownload,
    handleCleanup,
    setMessage,
    setLoading,
    stampConfig,
    handleStampConfigChange,
    handleStampImageSelect,
    handleClearStampImage,
    handlePageSelect,
    handleStampPositionChange,
    handleStampRotationChange
  };
}; 