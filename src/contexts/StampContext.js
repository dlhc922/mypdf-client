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
  // 增加canvas尺寸以提高精度
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');

  // 启用高质量图像处理
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 使用更高质量的缩放算法
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0, width, height);

  // 创建最终canvas
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = height;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(canvas, 0, 0, width, height);

  return finalCanvas;
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
    handleZoomIn,
    handleZoomOut,
    handlePageChange,
    handleAddStamp,
    handleDownload,
    setMessage,
    setLoading,
    stampConfig,
    handleStampConfigChange,
    handleStampImageSelect,
    handleClearStampImage,
    handlePageSelect,
    handleStampPositionChange,
    handleStampRotationChange,
    handleFileSelect,  // 使用 useStamp 中的 handleFileSelect
    handleResetZoom,
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
    try {
      if (!file) {
        setMessage({ type: 'error', content: '请选择PDF文件' });
        return;
      }

      if (!stampConfig.imageUrl) {
        setMessage({ type: 'error', content: '请选择印章图片' });
        return;
      }

      // 检查是否选择了页面
      if (!stampConfig.isStraddle && (!stampConfig.selectedPages || stampConfig.selectedPages.length === 0)) {
        setMessage({ type: 'error', content: '请选择需要盖章的页面' });
        return;
      }

      setLoading(true);
      setMessage(null);

      // 加载PDF文件
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        updateMetadata: false,
        ignoreEncryption: true,
      });

      // 加载印章图片
      let stampPngImage;
      if (typeof stampConfig.imageUrl === 'string') {
        try {
          // 如果是字符串URL，先获取图像，再转为PNG数据
          const img = await loadImage(stampConfig.imageUrl);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
          const arrayBuffer = await blob.arrayBuffer();
          stampPngImage = await pdfDoc.embedPng(arrayBuffer);
        } catch (imgError) {
          console.error('处理印章图片时出错:', imgError);
          setMessage({ type: 'error', content: '处理印章图片时出错，请重试' });
          setLoading(false);
          return;
        }
      } else if (stampConfig.imageUrl instanceof File || stampConfig.imageUrl instanceof Blob) {
        try {
          // 如果是File对象，直接使用arrayBuffer
          const stampImageBytes = await stampConfig.imageUrl.arrayBuffer();
          stampPngImage = await pdfDoc.embedPng(stampImageBytes, {
            quality: 100, // 使用最高质量
          });
        } catch (fileError) {
          console.error('读取印章文件时出错:', fileError);
          setMessage({ type: 'error', content: '读取印章文件时出错，请重试' });
          setLoading(false);
          return;
        }
      } else {
        setMessage({ type: 'error', content: '印章图片格式不正确，请重新选择' });
        setLoading(false);
        return;
      }

      // 获取印章尺寸
      const stampDims = stampPngImage.scale(1);
      const stampWidth = stampDims.width;
      const stampHeight = stampDims.height;

      // 获取页面尺寸
      const pages = pdfDoc.getPages();

     // 确保opacity是有效的数字，如果无效则使用默认值0.8
     const opacity = typeof stampConfig.opacity === 'number' && !isNaN(stampConfig.opacity)
     ? stampConfig.opacity / 100
     : 0.8;

      // 处理骑缝章（如果启用）
      if (stampConfig.isStraddle) {
        console.log('处理骑缝章...');
        const stampSizePt = (stampConfig.size || 40) * MM_TO_PT;
        const pageCount = pages.length;
        const partWidthPt = stampSizePt / pageCount;

        // 用户指定的骑缝章Y坐标（毫米）
        const straddleY = stampConfig.straddleY || 148.5;

        // 判断整个PDF中是否存在纵向页面
        const hasPortrait = Object.values(pageOrientations).some(o => o === 'portrait');

        for (let i = 0; i < pageCount; i++) {
          try {
            const page = pages[i];
            const { width, height } = page.getSize();
            const isLandscape = width > height;

            // 裁剪印章的一部分
            const stampWidthPx = Math.round((stampConfig.size || 40) * MM_TO_INCH * DPI);
            const partWidthPx = Math.floor(stampWidthPx / pageCount);

            // 加载和处理印章图像
            const img = await loadImage(stampConfig.imageUrl);
            const resizedCanvas = resizeImage(img, stampWidthPx, stampWidthPx);

            // 裁剪相应部分
            const cropLeft = i * partWidthPx;
            const croppedDataUrl = cropImage(resizedCanvas, cropLeft, 0, partWidthPx, stampWidthPx);
            const croppedImageEmbed = await pdfDoc.embedPng(croppedDataUrl);

            if (hasPortrait && isLandscape) {
              // 对于横向页面
              page.drawImage(croppedImageEmbed, {
                x: straddleY * MM_TO_PT,
                y: 0,
                width: stampSizePt,
                height: partWidthPt,
                opacity: opacity,
                rotate: degrees(270)
              });
            } else {
              // 对于纵向页面
              page.drawImage(croppedImageEmbed, {
                x: width - partWidthPt,
                y: straddleY * MM_TO_PT,
                width: partWidthPt,
                height: stampSizePt,
                opacity: opacity
              });
            }
          } catch (error) {
            console.error(`处理骑缝章第${i + 1}页时出错:`, error);
            // 继续处理下一页
          }
        }
      }

      // 处理普通印章（针对选定页面）
 

      for (const pageNum of stampConfig.selectedPages) {
        // 检查页码是否有效
        if (pageNum < 1 || pageNum > pages.length) {
          console.warn(`跳过无效页码: ${pageNum}`);
          continue;
        }

        try {
          // 注意：pageNum 为 1 开始
          const page = pages[pageNum - 1];
          // 如果 stampConfig.pageSettings 未提供特定设置，则使用空对象，后续取默认值
          const settings = stampConfig.pageSettings?.[pageNum] || {};
          const { width, height } = page.getSize();
          // 默认位置（单位 mm）：当既没有页面特定设置也未在 config 上设置时使用
          const defaultPosition = { x: 120, y: 190 };
          // 优先使用页面单独设置，其次全局设置，再次默认值
          const position = settings.position || stampConfig.position || defaultPosition;
          // 旋转角度，同理，默认 0°
          const rotation = ((settings.rotation ?? 0) % 360 + 360) % 360;
          // 转换后的印章尺寸（单位 pt）
          const stampSizePt = (stampConfig.size || 40) * MM_TO_PT;

          // 计算印章位置
          const stampX = position.x * MM_TO_PT;
          const stampY = height - (position.y * MM_TO_PT + stampSizePt);

          // 绘制印章
          page.drawImage(stampPngImage, {
            x: stampX,
            y: stampY,
            width: stampSizePt,
            height: stampSizePt,
            opacity: opacity,
            rotateDegrees: rotation,
          });
        } catch (pageError) {
          console.error(`处理第${pageNum}页时出错:`, pageError);
          // 继续处理其他页面
        }
      }

      // 保存PDF，使用高质量设置
      const outputPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        preservePDFFormXObjects: true,
        updateFieldAppearances: true,
      });

      // 创建下载链接
      const blob = new Blob([outputPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setStampedFileUrl(url);
      setMessage({ type: 'success', content: 'PDF 盖章处理完成！' });
    } catch (err) {
      console.error('处理PDF时出错:', err);
      setMessage({ type: 'error', content: '处理PDF时出错，请重试' });
    } finally {
      setLoading(false);
    }
  };


  const handleCleanup = useCallback(() => {
    handleFileSelect({ target: { files: null } });  // 使用 handleFileSelect 清理文件
    setMessage(null);
    setLoading(false);
    handleResetZoom();  // 使用 handleResetZoom 替代 setZoom
    handlePageChange(null);

    console.log("handleCleanup执行");
    // 清理印章相关状态
    handleStampConfigChange({
      imageUrl: null,
      size: 20,
      position: { x: 120, y: 190 },
      rotation: 0,
      isStraddle: false,
      straddleY: 148.5,
      selectedPages: [],
      currentPage: null,
      pageSettings: {}
    });
    // 清理已生成的 PDF URL
    if (stampedFileUrl) {
      URL.revokeObjectURL(stampedFileUrl);
      setStampedFileUrl(null);
    }
    // 清理页面方向相关状态
    setPageOrientations({});
  }, []);

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