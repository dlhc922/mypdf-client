import React, { createContext, useContext, useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { getRotatedBounds } from '../utils/geometry';

export const SignContext = createContext();

export function useSignContext() {
  const context = useContext(SignContext);
  if (!context) {
    throw new Error('useSignContext must be used within a SignProvider');
  }
  return context;
}

export function SignProvider({ children }) {
  const [file, setFile] = useState(null);
  const [zoom, setZoom] = useState(0.8);
  const [signConfigs, setSignConfigs] = useState([]);
  const [currentSignIndex, setCurrentSignIndex] = useState(-1);
  const [signatureInstances, setSignatureInstances] = useState([]);
  const [currentEditingElement, setCurrentEditingElement] = useState(null);
  const [signedFileUrl, setSignedFileUrl] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleCurrentSignIndexChange = (index) => {
    setCurrentSignIndex(index);
    if (index !== -1) {
      setCurrentEditingElement({ type: 'config', id: index });
    } else {
      if (!currentEditingElement || currentEditingElement.type === 'config') {
        setCurrentEditingElement(null);
      }
    }
  };

  const handleInstanceSelect = (instanceId) => {
    setCurrentEditingElement({ type: 'instance', id: instanceId });
    setCurrentSignIndex(-1);
  };

  const handlePageSelect = (pageNumber) => {
    if (currentSignIndex !== -1) {
      const newConfigs = [...signConfigs];
      newConfigs[currentSignIndex].currentPage = pageNumber;
      setSignConfigs(newConfigs);
    }
  };

  const addSignature = () => {
    setSignConfigs([
      ...signConfigs,
      {
        id: Date.now(),
        imageUrl: null,
        size: 40,
        position: { x: 120, y: 190 },
        rotation: 0,
        selectedPages: [],
      }
    ]);
    const newIndex = signConfigs.length;
    handleCurrentSignIndexChange(newIndex);
  };

  const removeSignature = (index) => {
    setSignConfigs(signConfigs.filter((_, i) => i !== index));
    if (currentSignIndex === index) {
      handleCurrentSignIndexChange(-1);
    }
  };

  const updateSignature = (index, updates) => {
    const newConfigs = [...signConfigs];
    newConfigs[index] = { ...newConfigs[index], ...updates };
    setSignConfigs(newConfigs);
  };

  const handleCleanup = () => {
    setFile(null);
    setZoom(1);
    setSignConfigs([]);
    handleCurrentSignIndexChange(-1);
    setSignatureInstances([]);
    setCurrentEditingElement(null);
  };

  const addSignatureToPage = (pageNumber, signatureIndex) => {
    const index = signatureIndex !== undefined ? signatureIndex : currentSignIndex;
    if (index === -1) return;
    
    const currentSign = signConfigs[index];
    if (!currentSign) return;
    
    const baseWidth = currentSign.size * (72 / 25.4);
    const baseHeight = baseWidth * 0.6;
    // 计算旋转后的容器尺寸
    const initialBounds = getRotatedBounds(baseWidth, baseHeight, currentSign.rotation || 0);
    
    // 确保位置是指容器的左上角
    const newInstance = {
      id: Date.now(),
      signatureId: currentSign.id,
      pageNumber,
      settings: {
        size: currentSign.size,
        position: { ...currentSign.position },
        rotation: currentSign.rotation || 0,
        containerWidth: initialBounds.width,
        containerHeight: initialBounds.height,
        // 记录基础签名尺寸，确保预览和生成时使用相同的参数
        baseWidth: baseWidth,
        baseHeight: baseHeight,
      }
    };

    setSignatureInstances(prev => [...prev, newInstance]);
    handleInstanceSelect(newInstance.id);
  };

  const updateSignatureInstance = (instanceId, updates) => {
    setSignatureInstances(prev =>
      prev.map(instance => {
        if (instance.id !== instanceId) return instance;
        
        // 如果更新包含位置变更，确保使用一致的参照点
        if (updates.position) {
          console.log(`Updated position for instance ${instanceId}:`, updates.position);
        }
        
        return {
          ...instance,
          settings: { ...instance.settings, ...updates }
        };
      })
    );
  };

  const removeSignatureInstance = (instanceId) => {
    setSignatureInstances(prev =>
      prev.filter(instance => instance.id !== instanceId)
    );
    if (currentEditingElement?.type === 'instance' && currentEditingElement.id === instanceId) {
      setCurrentEditingElement(null);
      setCurrentSignIndex(-1);
    }
  };

  const getPageInstances = (pageNumber) => {
    return signatureInstances.filter(
      instance => instance.pageNumber === pageNumber
    );
  };

  /**
   * 生成 PDF 的函数中，修复签名位置参照点不一致的问题
   */
  const generateSignedPdf = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // 将毫米转换为 PDF 点(pt)
      const mmToPt = (mm) => mm * (72 / 25.4);

      if (signatureInstances?.length > 0) {
        for (const instance of signatureInstances) {
          const config = signConfigs.find(cfg => cfg.id === instance.signatureId);
          if (!config?.imageUrl) continue;

          const pageIndex = instance.pageNumber - 1;
          const page = pdfDoc.getPage(pageIndex);
          const pageHeight = page.getHeight();

          // 原始签名尺寸（单位: pt）
          const baseWidthPt = mmToPt(instance.settings.size);
          const baseHeightPt = baseWidthPt * 0.6; // 保持签名比例

          // 使用实例中保存的容器尺寸
          const containerWidthPt = instance.settings.containerWidth || baseWidthPt;
          const containerHeightPt = instance.settings.containerHeight || baseHeightPt;

          // 创建 canvas 并绘制旋转后的签名
          const canvas = document.createElement('canvas');
          const scale = 2; // 提高分辨率
          canvas.width = containerWidthPt * scale;
          canvas.height = containerHeightPt * scale;
          const ctx = canvas.getContext('2d');
          ctx.scale(scale, scale);

          // 加载图片
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = config.imageUrl;
          });

          // 清晰地绘制旋转签名
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.translate(containerWidthPt / 2, containerHeightPt / 2);
          ctx.rotate((instance.settings.rotation * Math.PI) / 180);
          ctx.drawImage(
            img,
            -baseWidthPt / 2,
            -baseHeightPt / 2,
            baseWidthPt,
            baseHeightPt
          );
          ctx.restore();

          // 将 canvas 转换成图片数据，并嵌入 PDF
          const rotatedImageData = canvas.toDataURL('image/png');
          const rotatedImage = await pdfDoc.embedPng(rotatedImageData);

          // 修正: 确保使用与预览组件相同的参照点
          // 假设预览中使用的是容器左上角坐标
          const pdfX = instance.settings.position.x;
          
          // 修正: 如果预览中的 Y 坐标是指容器的垂直中心点，则需要调整
          // 将左上角坐标转换为 PDF 坐标系（原点在左下角）
          const pdfY = pageHeight - instance.settings.position.y - containerHeightPt;

          // 在 PDF 中绘制签名
          page.drawImage(rotatedImage, {
            x: pdfX,
            y: pdfY,
            width: containerWidthPt,
            height: containerHeightPt,
          });
        }
      }

      // 生成 PDF 数据
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setSignedFileUrl(blobUrl);
      setDownloadOpen(true);
    } catch (err) {
      console.error("生成签名 PDF 出错:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 修复更新签名旋转函数中的坐标转换
   */
  const updateSignatureRotation = (instanceId, newRotation) => {
    setSignatureInstances(prev =>
      prev.map(instance => {
        if (instance.id !== instanceId) return instance;

        // 计算原始签名尺寸（转换为 pt）
        const baseWidth = instance.settings.size * (72 / 25.4);
        const baseHeight = baseWidth * 0.6;

        const oldRotation = instance.settings.rotation;
        // 旧角度下容器边界框
        const oldBounds = getRotatedBounds(baseWidth, baseHeight, oldRotation);
        // 新角度下容器边界框
        const newBounds = getRotatedBounds(baseWidth, baseHeight, newRotation);

        // 计算当前容器中心点
        const centerX = instance.settings.position.x + oldBounds.width / 2;
        const centerY = instance.settings.position.y + oldBounds.height / 2;

        // 根据新边界尺寸计算新的左上角，使中心点保持不变
        const newPosX = centerX - newBounds.width / 2;
        const newPosY = centerY - newBounds.height / 2;

        return {
          ...instance,
          settings: {
            ...instance.settings,
            rotation: newRotation,
            position: { x: newPosX, y: newPosY },
            containerWidth: newBounds.width,
            containerHeight: newBounds.height,
          },
        };
      })
    );
  };

  // 关闭下载对话框时，需要清理 Blob URL
  const handleDownloadClose = useCallback(() => {
    setDownloadOpen(false);
    if (signedFileUrl) {
      URL.revokeObjectURL(signedFileUrl);
      setSignedFileUrl(null);
    }
  }, [signedFileUrl]);

  const value = {
    file,
    setFile,
    zoom,
    signConfigs,
    currentSignIndex,
    setCurrentSignIndex: handleCurrentSignIndexChange,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handlePageSelect,
    updateSignature,
    handleCleanup,
    addSignature,
    removeSignature,
    setSignConfigs,
    signatureInstances,
    addSignatureToPage,
    updateSignatureInstance,
    removeSignatureInstance,
    getPageInstances,
    generateSignedPdf,
    currentEditingElement,
    setCurrentEditingElement,
    handleInstanceSelect,
    updateSignatureRotation,
    signedFileUrl,
    downloadOpen,
    handleDownloadClose,
    loading,
    error,
  };

  return (
    <SignContext.Provider value={value}>
      {children}
    </SignContext.Provider>
  );
} 