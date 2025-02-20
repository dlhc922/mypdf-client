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
    // 旋转角度默认为 0°，计算初始容器尺寸
    const initialBounds = getRotatedBounds(baseWidth, baseHeight, 0);
    const newInstance = {
      id: Date.now(),
      signatureId: currentSign.id,
      pageNumber,
      settings: {
        size: currentSign.size,
        position: { ...currentSign.position },
        rotation: currentSign.rotation,
        containerWidth: initialBounds.width,
        containerHeight: initialBounds.height,
      }
    };

    setSignatureInstances(prev => [...prev, newInstance]);
    handleInstanceSelect(newInstance.id);
  };

  const updateSignatureInstance = (instanceId, updates) => {
    setSignatureInstances(prev =>
      prev.map(instance =>
        instance.id === instanceId
          ? { ...instance, settings: { ...instance.settings, ...updates } }
          : instance
      )
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
   * 更新签名旋转，同时更新容器尺寸（旋转后外接矩形尺寸）和位置，
   * 保证旋转前后的中心位置保持一致。
   */
  const updateSignatureRotation = (instanceId, newRotation) => {
    setSignatureInstances(prev =>
      prev.map(instance => {
        if (instance.id !== instanceId) return instance;

        // 用 instance.settings.size（单位：mm）计算原始签名尺寸（转换为 pt，1 inch = 25.4 mm, 1 inch = 72 pt）
        const baseWidth = instance.settings.size * (72 / 25.4);
        const baseHeight = baseWidth * 0.6; // 假定签名比例固定为 1 : 0.6

        const oldRotation = instance.settings.rotation;
        // 旧角度下容器边界框
        const oldBounds = getRotatedBounds(baseWidth, baseHeight, oldRotation);
        // 新角度下容器边界框
        const newBounds = getRotatedBounds(baseWidth, baseHeight, newRotation);

        // 假设 instance.settings.position 保存的是容器的左上角
        // 那么原来的容器中心点为：
        const centerX = instance.settings.position.x + oldBounds.width / 2;
        const centerY = instance.settings.position.y + oldBounds.height / 2;

        // 根据新边界尺寸计算新的左上角，使中心点保持不变
        const newPosX = centerX - newBounds.width / 2;
        const newPosY = centerY - newBounds.height / 2;

        // 添加 log 输出旋转前后的信息
        console.log(`Rotating instance ${instance.id}:`);
        console.log(`  Old rotation: ${oldRotation}°, old bounds:`, oldBounds);
        console.log(`  New rotation: ${newRotation}°, new bounds:`, newBounds);
        console.log(`  Old position:`, instance.settings.position);
        console.log(`  New position: { x: ${newPosX}, y: ${newPosY} }`);
        console.log(`  baseWidth: ${baseWidth}, baseHeight: ${baseHeight}`);

        return {
          ...instance,
          settings: {
            ...instance.settings,
            rotation: newRotation,
            position: { x: newPosX, y: newPosY },
            // 保存旋转后容器的尺寸供 SignPreview 使用
            containerWidth: newBounds.width,
            containerHeight: newBounds.height,
          },
        };
      })
    );
  };

  /**
   * 生成 PDF 的函数中，添加 log 输出用于排查 PDF 中签名的尺寸。
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

          // 如果存在旋转后的容器尺寸，则使用，否则使用原始尺寸
          const containerWidthPt = instance.settings.containerWidth || baseWidthPt;
          const containerHeightPt = instance.settings.containerHeight || baseHeightPt;

          console.log(`PDF Generation for instance ${instance.id}:`);
          console.log(`  Rotation: ${instance.settings.rotation}°`);
          console.log(`  Base size: ${baseWidthPt} x ${baseHeightPt} pt`);
          console.log(`  Container size: ${containerWidthPt} x ${containerHeightPt} pt`);
          console.log(`  Instance position: `, instance.settings.position);

          // 创建 canvas，使用旋转后的容器尺寸
          const canvas = document.createElement('canvas');
          canvas.width = containerWidthPt;
          canvas.height = containerHeightPt;
          const ctx = canvas.getContext('2d');

          // 加载图片
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = config.imageUrl;
          });

          // 绘制方式：把 canvas 原点移到中心点，旋转签名后以原始尺寸绘制使得签名整体居中
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
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

          // PDF 坐标系原点在底部，instance.settings.position 假设保存的是旋转后容器的左上角（单位: pt）
          const pdfX = instance.settings.position.x;
          const pdfY = pageHeight - instance.settings.position.y - containerHeightPt;
          console.log('Drawing rotated PDF signature for instance', instance.id, {
            pdfX,
            pdfY,
            width: containerWidthPt,
            height: containerHeightPt,
          });

          page.drawImage(rotatedImage, {
            x: pdfX,
            y: pdfY,
            width: containerWidthPt,
            height: containerHeightPt,
          });
        }
      }

      // PDF 绘制完成后，生成 PDF 数据
      const pdfBytes = await pdfDoc.save();
      
      // 通过 Blob 创建下载 URL，与 StampContext.js 中相同
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setSignedFileUrl(blobUrl);
      setDownloadOpen(true);
      console.log("生成签名 PDF 完成，Blob URL:", blobUrl);
    } catch (err) {
      console.error("生成签名 PDF 出错:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
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