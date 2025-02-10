import React, { createContext, useContext, useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
// 注意：pdf-lib 里 degrees 用于 PDF 文档绘制时的旋转，如果你需要自定义 Canvas 旋转，则另外计算（本例中不直接使用 degrees）。
import { useStamp } from '../hooks/stamp/useStamp';

const StampContext = createContext();
export const useStampContext = () => useContext(StampContext);

const MM_TO_PT = 2.83465;
const MM_TO_INCH = 0.0393701;
const DPI = 144;

// 辅助函数 1：加载图片（返回 HTMLImageElement）
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 如有跨域问题，可设置
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// 辅助函数 2：将图片绘制到 Canvas 中并缩放到指定宽高
const resizeImage = (img, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // 启用高质量平滑算法
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

// 辅助函数 3：旋转并从旋转后图像中裁剪中心区域（输出 PNG DataURL）
function rotateAndCropImage(sourceCanvas, angle, targetSize) {
  const radians = angle * Math.PI / 180;
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  // 计算旋转后的画布尺寸
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const newWidth = Math.ceil(w * cos + h * sin);
  const newHeight = Math.ceil(w * sin + h * cos);

  const offCanvas = document.createElement('canvas');
  offCanvas.width = newWidth;
  offCanvas.height = newHeight;
  const offCtx = offCanvas.getContext('2d');

  // 将上下文移动到新画布中心，然后旋转后绘制原图
  offCtx.translate(newWidth / 2, newHeight / 2);
  offCtx.rotate(radians);
  offCtx.drawImage(sourceCanvas, -w / 2, -h / 2);

  // 裁剪中心区域
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = targetSize;
  cropCanvas.height = targetSize;
  const cropCtx = cropCanvas.getContext('2d');
  const sx = (newWidth - targetSize) / 2;
  const sy = (newHeight - targetSize) / 2;
  cropCtx.drawImage(offCanvas, sx, sy, targetSize, targetSize, 0, 0, targetSize, targetSize);

  return cropCanvas.toDataURL('image/png');
}

// 辅助函数 4：从原图裁剪指定区域（输出 PNG DataURL）
// cropLeft, cropTop, cropWidth, cropHeight 均为像素
function cropImage(sourceCanvas, cropLeft, cropTop, cropWidth, cropHeight) {
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const ctx = cropCanvas.getContext('2d');
  ctx.drawImage(sourceCanvas, cropLeft, cropTop, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return cropCanvas.toDataURL('image/png');
}

export const StampProvider = ({ children }) => {
  const {
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
  } = useStamp();

  const [stampedFileUrl, setStampedFileUrl] = useState(null);
  // 从环境变量读取 API_URL （仅用于调试或后续其他用途）
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // 新增状态
  const [pageOrientations, setPageOrientations] = useState({});

  // 修改页面加载处理
  const handlePageLoadSuccess = useCallback((page, pageNumber) => {
    const { width, height } = page.getSize();
    const orientation = width > height ? 'landscape' : 'portrait';
    setPageOrientations(prev => ({ ...prev, [pageNumber]: orientation }));
  }, []);

  // 完全在客户端使用 pdf-lib 盖章，不再发送到后端
  const handleSubmit = async () => {
    if (!file || !stampConfig.imageUrl) {
      setMessage({ type: 'error', content: '请选择PDF文件和印章图片' });
      return;
    }
    try {
      setLoading(true);
      console.log("开始处理 PDF 文件...");

      // 读取 PDF 文件（文件对象转换成 ArrayBuffer）
      const pdfArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      console.log("PDF 文档加载完成，页面总数:", pages.length);

      // 获取 stampConfig 配置
      const config = stampConfig;
      console.log("当前印章配置:", config);

      // 计算印章在图片中的尺寸 (像素)
      const stampWidthPx = Math.round(config.size * MM_TO_INCH * DPI);
      console.log("计算印章宽度(像素):", stampWidthPx);

      // 加载印章图片
      const stampImg = await loadImage(config.imageUrl);
      // 统一调整为正方形 (stampWidthPx x stampWidthPx)
      const resizedCanvas = resizeImage(stampImg, stampWidthPx, stampWidthPx);
      console.log("印章图片加载并调整为正方形");

      // 【A】处理骑缝章
      if (config.isStraddle) {
        console.log("开始处理骑缝章...");
        const stampWidthPt = config.size * MM_TO_PT;
        const stampHeightPt = stampWidthPt;
        const pageCount = pages.length;
        const partWidthPt = stampWidthPt / pageCount;
        const partWidthPx = Math.floor(stampWidthPx / pageCount);
        const convertedStampY = config.straddleY * MM_TO_PT;
        console.log(`骑缝章：stampWidthPt=${stampWidthPt}, 每页宽度(点)=${partWidthPt}, convertedStampY=${convertedStampY}`);

        for (let i = 0; i < pageCount; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const stampY = height - (convertedStampY + stampHeightPt);
          console.log(`处理骑缝章-页面${i + 1}: 页面尺寸=${width}x${height}, stampY=${stampY}`);

          // 裁剪对应部分
          const cropLeft = i * partWidthPx;
          const croppedDataUrl = cropImage(resizedCanvas, cropLeft, 0, partWidthPx, stampWidthPx);
          const croppedImageEmbed = await pdfDoc.embedPng(croppedDataUrl);
          console.log(`骑缝章-页面${i + 1}: 裁剪区域左侧偏移=${cropLeft}, 裁剪区域宽度(px)=${partWidthPx}`);

          page.drawImage(croppedImageEmbed, {
            x: width - partWidthPt,
            y: stampY,
            width: partWidthPt,
            height: stampHeightPt,
            opacity: 0.8,
          });
          console.log(`骑缝章-页面${i + 1}: 印章绘制完成`);
        }
      }

      // 【B】处理普通印章（针对选定页面）
      if (config.selectedPages && config.selectedPages.length > 0) {
        console.log("开始处理普通印章...");

        // 先判断整个 PDF 文档中是否存在纵向页面
        const hasPortrait = pages.some((page) => {
          const { width, height } = page.getSize();
          return width < height;
        });

        for (const pageNum of config.selectedPages) {
          // 注意：pageNum 为 1 开始
          const page = pages[pageNum - 1];
          // 如果 config.pageSettings 未提供特定设置，则使用空对象，后续取默认值
          const settings = config.pageSettings?.[pageNum] || {};
          const { width, height } = page.getSize();
          // 默认位置（单位 mm）：当既没有页面特定设置也未在 config 上设置时使用
          const defaultPosition = { x: 120, y: 190 };
          // 优先使用页面单独设置，其次全局设置，再次默认值
          const position = settings.position || config.position || defaultPosition;
          // 旋转角度，同理，默认 0°
          const rotation = ((settings.rotation || 0) % 360 + 360) % 360;
          // 转换后的印章尺寸（单位 pt）
          const stampSizePt = config.size * MM_TO_PT;

          console.log(`普通印章-页面${pageNum}: 页面尺寸=${width}x${height}`);
          console.log(
            `普通印章-页面${pageNum}: 使用参数 position=${JSON.stringify(
              position
            )}, rotation=${rotation}, stampSizePt=${stampSizePt}`
          );

          // 对印章图片进行旋转并裁剪，返回 PNG DataURL（参考之前的辅助函数 rotateAndCropImage）
          const rotatedDataUrl = rotateAndCropImage(resizedCanvas, rotation, stampWidthPx);
          const rotatedImageEmbed = await pdfDoc.embedPng(rotatedDataUrl);

          // 检查页面旋转角度，判断当前页面是否为横向
          const pageRotation = page.getRotation().angle || 0;
          let isLandscape = false;
          if (pageRotation === 90 || pageRotation === 270) {
            isLandscape = true;
          } else if (pageRotation === 0 || pageRotation === 180) {
            // 如果宽度大于高度，也认为页面为横向
            if (width > height) {
              isLandscape = true;
            }
          }

          let stampX, stampY;
          if (isLandscape && hasPortrait) {
            // 混合模式下：当前页为横向且存在纵向页面时，转换坐标
            // 新 x = position.y
            // 新 y = 210 - position.x - config.size
            stampX = position.y * MM_TO_PT;
            stampY = (210 - position.x - config.size) * MM_TO_PT;
            console.log(
              `普通印章-页面${pageNum}: 混合模式横向处理，转换后 stampX=${stampX}, stampY=${stampY}`
            );
          } else {
            // 统一模式（全横向或全纵向页）：印章位置直接按实际录入值计算，
            // 保存转换为 pt：stampX = position.x * MM_TO_PT, stampY 根据纸张高度做 Y 坐标翻转
            stampX = position.x * MM_TO_PT;
            stampY = height - (position.y * MM_TO_PT + stampSizePt);
            console.log(
              `普通印章-页面${pageNum}: 统一模式处理，stampX=${stampX}, stampY=${stampY}`
            );
          }

          // 绘制印章到该页面中
          page.drawImage(rotatedImageEmbed, {
            x: stampX,
            y: stampY,
            width: stampSizePt,
            height: stampSizePt,
            opacity: 0.8,
          });
          console.log(`普通印章-页面${pageNum}: 印章绘制完成`);
        }
      }

      // 保存修改后的 PDF 并生成 Blob URL
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setStampedFileUrl(url);
      console.log("PDF 文件保存完成，生成 Blob URL:", url);
      setMessage({ type: 'success', content: 'PDF 盖章处理完成！' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StampContext.Provider
      value={{
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
        stampConfig,
        handleStampConfigChange,
        handleStampImageSelect,
        handleClearStampImage,
        handlePageSelect,
        handleStampPositionChange,
        handleStampRotationChange,
        handleSubmit,
        stampedFileUrl,
        pageOrientations,
        setPageOrientations,
        handlePageLoadSuccess,
      }}
    >
      {children}
    </StampContext.Provider>
  );
};