import { useState, useCallback, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function useImageToPdf() {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [pdfQuality, setPdfQuality] = useState('medium');

  // 页面设置状态
  const [pageFormat, setPageFormat] = useState('a4');         // 页面大小
  const [pageOrientation, setPageOrientation] = useState('portrait'); // 页面方向
  const [pageMargin, setPageMargin] = useState(10);           // 页边距 (mm)
  const [imagesPerPage, setImagesPerPage] = useState(1);      // 每页图片数
  const [fitMethod, setFitMethod] = useState('contain');      // 图片适应方式(contain/cover/stretch)
  const [addPageNumbers, setAddPageNumbers] = useState(false); // 添加页码
  const [customFilename, setCustomFilename] = useState('');   // 自定义文件名
  const [watermarkText, setWatermarkText] = useState('');     // 水印文本
  const [previewMode, setPreviewMode] = useState(false);      // 预览模式
  const [previewUrl, setPreviewUrl] = useState(null);         // PDF预览URL

  // 清理资源函数
  const cleanupResources = useCallback(() => {
    // 由于我们使用DataURL而不是Blob URL，不需要revoke

    // 释放PDF预览URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // 处理图片上传
  const handleImageUpload = useCallback((files) => {
    if (!files || files.length === 0) {
      setError(t('imageToPdf.noImagesSelected') || '请选择有效的图片文件');
      return;
    }

    // 过滤非图片文件
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError(t('imageToPdf.noImagesSelected') || '请选择有效的图片文件');
      return;
    }

    setError(null);
    setLoading(true);

    // 处理每个图片文件
    const promises = imageFiles.map(file => {
      return new Promise((resolve) => {
        // 为每个图片生成唯一ID，确保稳定性
        const id = uuidv4();

        // 读取文件内容为DataURL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;

          // 加载图片以获取尺寸
          const img = new Image();
          img.onload = () => {
            resolve({
              id,
              file,
              preview: dataUrl, // 使用DataURL而不是Blob URL
              name: file.name,
              width: img.width,
              height: img.height,
              type: file.type
            });
          };
          img.onerror = () => {
            console.error(`无法加载图片: ${file.name}`);
            resolve(null);
          };
          img.src = dataUrl;
        };

        reader.onerror = () => {
          console.error(`读取文件失败: ${file.name}`);
          resolve(null);
        };

        // 读取文件为DataURL
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(newImages => {
        // 过滤掉加载失败的图片
        const validImages = newImages.filter(img => img !== null);

        if (validImages.length === 0) {
          setError(t('imageToPdf.imageLoadError') || '无法加载所选图片');
          return;
        }

        setImages(prevImages => [...prevImages, ...validImages]);
        setMessage(t('imageToPdf.imagesAdded', { count: validImages.length }) || `已添加 ${validImages.length} 张图片`);

        // 清除消息
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      })
      .catch(err => {
        console.error('处理图片时出错:', err);
        setError(t('imageToPdf.imageProcessingError') || '处理图片时出错');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t]);

  // 移除单个图片
  const handleRemoveImage = useCallback((id) => {
    setImages(prevImages => {
      // 由于现在使用DataURL，不需要revoke
      return prevImages.filter(image => image.id !== id);
    });
  }, []);

  // 移除所有图片
  const handleRemoveAllImages = useCallback(() => {
    // 由于现在使用DataURL，不需要revoke
    setImages([]);
  }, []);

  // 处理拖拽结束事件
  const handleDragEnd = useCallback((result) => {
    console.log('Drag end result:', result);

    // 如果没有目标位置，则不执行任何操作
    if (!result.destination) return;

    // 源位置索引和目标位置索引
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // 如果源位置和目标位置相同，则不执行任何操作
    if (sourceIndex === destinationIndex) return;

    console.log(`Reordering image from index ${sourceIndex} to index ${destinationIndex}`);

    // 使用函数式更新，创建一个新的数组，而不是修改现有数组
    setImages(prevImages => {
      const newImages = Array.from(prevImages);
      // 移除拖动的项
      const [movedItem] = newImages.splice(sourceIndex, 1);
      // 在新位置插入
      newImages.splice(destinationIndex, 0, movedItem);

      console.log('Images reordered successfully');
      return newImages;
    });
  }, []);

  // 处理PDF质量变更
  const handlePdfQualityChange = useCallback((quality) => {
    setPdfQuality(quality);
  }, []);

  // 获取页面尺寸（单位：mm）
  const getPageDimensions = useCallback(() => {
    let width, height;

    // 设置页面尺寸
    switch (pageFormat) {
      case 'a4':
        width = 210;
        height = 297;
        break;
      case 'a3':
        width = 297;
        height = 420;
        break;
      case 'letter':
        width = 215.9;
        height = 279.4;
        break;
      case 'custom':
        // 这里可以添加自定义尺寸的逻辑
        width = 210;
        height = 297;
        break;
      default:
        width = 210;
        height = 297;
    }

    // 如果是横向，交换宽高
    if (pageOrientation === 'landscape') {
      [width, height] = [height, width];
    }

    return { width, height };
  }, [pageFormat, pageOrientation]);

  // 使用Canvas处理图片质量
  const processImageWithCanvas = useCallback((img, quality) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('Processing image with quality:', quality, 'Image dimensions:', img.width, 'x', img.height);

        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('无法获取Canvas上下文');
        }

        // 根据质量设置不同的参数
        let scale = 1.0;
        let compressionQuality = 0.92;

        switch (quality) {
          case 'low':
            scale = 0.5;  // 低质量，缩小到50%
            compressionQuality = 0.5;
            break;
          case 'medium':
            scale = 0.75; // 中等质量，缩小到75%
            compressionQuality = 0.75;
            break;
          case 'high':
            scale = 1.0;  // 高质量，保持原始尺寸
            compressionQuality = 0.92;
            break;
          default:
            scale = 0.75;
            compressionQuality = 0.75;
        }

        // 确保图片尺寸合理 (防止Canvas过大导致内存问题)
        const maxDimension = 2000; // 最大尺寸
        let targetWidth = Math.round(img.width * scale);
        let targetHeight = Math.round(img.height * scale);

        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          const ratio = img.width / img.height;
          if (targetWidth > targetHeight) {
            targetWidth = maxDimension;
            targetHeight = Math.round(targetWidth / ratio);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round(targetHeight * ratio);
          }
        }

        console.log('Target dimensions:', targetWidth, 'x', targetHeight);

        // 确保targetWidth和targetHeight不为0或NaN
        if (!targetWidth || !targetHeight || isNaN(targetWidth) || isNaN(targetHeight)) {
          console.error('Invalid target dimensions, using default');
          targetWidth = img.width > 0 ? img.width : 300;
          targetHeight = img.height > 0 ? img.height : 300;
        }

        // 设置Canvas尺寸
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 清空Canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制图片到Canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 获取处理后的图片数据
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
          console.log('Image converted to JPEG');
        } catch (err) {
          console.error('转换图片格式失败，尝试使用PNG格式:', err);
          dataUrl = canvas.toDataURL('image/png');
          console.log('Fallback to PNG format');
        }

        // 检查dataUrl是否有效
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('无法生成有效的图片数据');
        }

        // 创建新图片对象验证处理结果
        const processedImg = new Image();
        processedImg.onload = () => {
          // 检查处理后的图片是否有效
          if (processedImg.width <= 0 || processedImg.height <= 0) {
            console.error('处理后的图片尺寸无效');
            reject(new Error('处理后的图片尺寸无效'));
            return;
          }

          console.log('Processed image successfully:', processedImg.width, 'x', processedImg.height);

          // 清理Canvas资源
          canvas.width = 1;
          canvas.height = 1;
          ctx.clearRect(0, 0, 1, 1);

          resolve({
            src: dataUrl,
            width: processedImg.width,
            height: processedImg.height
          });
        };

        processedImg.onerror = (err) => {
          console.error('处理后的图片加载失败:', err);
          reject(new Error('处理后的图片加载失败'));
        };

        processedImg.src = dataUrl;
      } catch (err) {
        console.error('图片处理错误:', err);
        // 出错时尝试直接使用原图
        resolve({
          src: img.src,
          width: img.width,
          height: img.height
        });
      }
    });
  }, []);

  // 创建水印Canvas，用于添加水印(jsPdf不支持中文)
  const createWatermarkCanvas = (text) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 500;
    canvas.height = 200;

    ctx.fillStyle = "rgba(150, 150, 150, 0.3)"; // 半透明灰色
    ctx.font = "40px Microsoft YaHei, KaiTi, SimSun, Arial"; // 选用更直的字体
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(text).width;

    ctx.translate(canvas.width / 2, canvas.height / 2); // 确保文字起点在画布正中心
    ctx.rotate(-Math.PI / 4); // -45 度旋转
    ctx.fillText(text, 0, 0); // 确保居中绘制

    return canvas.toDataURL("image/png");
  };
  // 添加水印到PDF
  const addWatermark = useCallback((doc, text) => {
    if (!text) return;

    try {
      const watermarkImg = createWatermarkCanvas(text);
      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const watermarkWidth = 250; // 调整水印大小
        const watermarkHeight = 100;

        doc.addImage(
          watermarkImg,
          "PNG",
          (pageWidth - watermarkWidth) / 2, // 居中对齐
          (pageHeight - watermarkHeight) / 2, // 居中对齐
          watermarkWidth,
          watermarkHeight
        );
      }
    } catch (err) {
      console.error("添加水印错误:", err);
    }
  }, []);


  // 添加页码到PDF
  const addPageNumbersToPdf = useCallback((doc) => {
    try {
      const pageCount = doc.internal.getNumberOfPages();

      // 遍历所有页面添加页码
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 设置页码格式和位置
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `${i} / ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    } catch (err) {
      console.error('添加页码错误:', err);
    }
  }, []);

  // 生成多张图片的网格布局
  const generateGridLayout = useCallback((doc, processedImages, startIndex, count) => {
    try {
      console.log('生成布局: 起始索引=', startIndex, '数量=', count);
      const { width: pageWidth, height: pageHeight } = getPageDimensions();
      console.log('页面尺寸:', pageWidth, 'x', pageHeight, 'mm');

      const margin = pageMargin;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      console.log('内容区域尺寸:', contentWidth, 'x', contentHeight, 'mm');

      let columns, rows;

      // 根据每页图片数量确定网格布局
      switch (imagesPerPage) {
        case 2:
          columns = 1;
          rows = 2;
          break;
        case 4:
          columns = 2;
          rows = 2;
          break;
        case 6:
          columns = 2;
          rows = 3;
          break;
        default:
          // 默认一页一张图片
          columns = 1;
          rows = 1;
      }

      console.log('网格布局: 列数=', columns, '行数=', rows);

      // 计算每个单元格的尺寸
      const cellWidth = contentWidth / columns;
      const cellHeight = contentHeight / rows;
      console.log('单元格尺寸:', cellWidth, 'x', cellHeight, 'mm');

      // 添加图片到网格
      for (let i = 0; i < Math.min(count, imagesPerPage); i++) {
        if (startIndex + i >= processedImages.length) break;

        const processedImg = processedImages[startIndex + i];
        const row = Math.floor(i / columns);
        const col = i % columns;

        console.log(`放置图片 ${startIndex + i} 在网格 [${row},${col}], 尺寸:`, processedImg.width, 'x', processedImg.height);

        // 计算当前单元格在页面上的位置
        const cellX = margin + (col * cellWidth);
        const cellY = margin + (row * cellHeight);

        // 计算图片在单元格中的缩放和位置
        const imgRatio = processedImg.width / processedImg.height;
        const cellRatio = cellWidth / cellHeight;

        console.log(`图片比例: ${imgRatio.toFixed(2)}, 单元格比例: ${cellRatio.toFixed(2)}`);

        let imgWidth, imgHeight, imgX, imgY;

        // 根据适应方式计算图片尺寸
        if (fitMethod === 'stretch') {
          // 拉伸填满单元格
          imgWidth = cellWidth;
          imgHeight = cellHeight;
          imgX = cellX;
          imgY = cellY;
        } else if (fitMethod === 'cover' || (fitMethod === 'contain' && imgRatio > cellRatio)) {
          // 宽度适应，高度可能超出或不足
          imgWidth = cellWidth;
          imgHeight = cellWidth / imgRatio;
          imgX = cellX;
          imgY = cellY + (cellHeight - imgHeight) / 2;
        } else {
          // 高度适应，宽度可能超出或不足
          imgHeight = cellHeight;
          imgWidth = cellHeight * imgRatio;
          imgX = cellX + (cellWidth - imgWidth) / 2;
          imgY = cellY;
        }

        console.log(`计算后的图片位置: x=${imgX.toFixed(2)}, y=${imgY.toFixed(2)}, 宽=${imgWidth.toFixed(2)}, 高=${imgHeight.toFixed(2)}`);

        try {
          // 验证数据有效性
          if (isNaN(imgX) || isNaN(imgY) || isNaN(imgWidth) || isNaN(imgHeight) ||
            !processedImg.src || imgWidth <= 0 || imgHeight <= 0) {
            console.error(`图片 ${startIndex + i} 放置参数无效，跳过`, { imgX, imgY, imgWidth, imgHeight });
            continue;
          }

          // 添加图片到PDF
          doc.addImage(
            processedImg.src,
            'JPEG',
            imgX,
            imgY,
            imgWidth,
            imgHeight
          );
          console.log(`图片 ${startIndex + i} 已添加到PDF`);
        } catch (err) {
          console.error(`添加图片 ${startIndex + i} 到PDF失败:`, err);
        }
      }

      // 返回处理完的图片索引
      return startIndex + Math.min(count, imagesPerPage);
    } catch (err) {
      console.error('生成网格布局错误:', err);
      throw err;
    }
  }, [imagesPerPage, pageMargin, getPageDimensions, fitMethod]);

  // 生成PDF
  const handleGeneratePdf = useCallback(async (isPreview = false) => {
    if (images.length === 0) {
      setError(t('imageToPdf.noImagesSelected') || '请先上传图片');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('开始生成PDF, 图片数量:', images.length);
      // 获取页面尺寸
      const { width, height } = getPageDimensions();
      console.log('页面尺寸:', width, 'x', height, '方向:', pageOrientation);

      // 创建PDF文档
      const doc = new jsPDF({
        orientation: pageOrientation,
        unit: 'mm',
        format: pageFormat === 'custom' ? [width, height] : pageFormat
      });

      // 预处理所有图片
      const processedImages = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`处理第 ${i + 1}/${images.length} 张图片:`, image.name);

        try {
          // 创建图片元素以获取尺寸
          const img = new Image();

          // 等待图片加载完成
          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log(`图片 ${i + 1} 加载成功, 尺寸:`, img.width, 'x', img.height);
              resolve();
            };
            img.onerror = (e) => {
              console.error(`图片 ${i + 1} 加载失败:`, e);
              reject(new Error(`加载图片 ${image.name} 失败`));
            };
            img.src = image.preview;

            // 如果图片已经加载完成（可能来自缓存），直接解析
            if (img.complete) {
              console.log(`图片 ${i + 1} 已经加载完成(缓存)`);
              resolve();
              return;
            }

            // 设置超时处理
            setTimeout(() => {
              if (!img.complete) {
                console.warn(`图片 ${i + 1} 加载超时`);
                reject(new Error(`加载图片 ${image.name} 超时`));
              }
            }, 10000); // 10秒超时
          });

          // 使用Canvas处理图片质量
          const processedImg = await processImageWithCanvas(img, pdfQuality);
          console.log(`图片 ${i + 1} 处理完成`);
          processedImages.push(processedImg);
        } catch (err) {
          console.error(`处理图片 ${image.name} 时出错:`, err);
          setError(prev => prev ? `${prev}; 处理图片 ${image.name} 失败` : `处理图片 ${image.name} 失败`);
          // 继续处理下一张图片
          continue;
        }
      }

      if (processedImages.length === 0) {
        throw new Error('没有可用的图片可以添加到PDF');
      }

      console.log('所有图片处理完成, 开始生成PDF布局');

      // 根据每页图片数量计算需要的页数
      const totalPages = Math.ceil(processedImages.length / imagesPerPage);
      console.log(`总页数: ${totalPages}, 每页图片数: ${imagesPerPage}`);

      // 处理每一页
      let currentImageIndex = 0;
      for (let page = 0; page < totalPages; page++) {
        console.log(`生成第 ${page + 1}/${totalPages} 页`);

        // 如果不是第一页，添加新页
        if (page > 0) {
          doc.addPage(pageFormat, pageOrientation);
          console.log('添加新页面');
        }

        try {
          // 生成当前页的图片布局
          currentImageIndex = generateGridLayout(
            doc,
            processedImages,
            currentImageIndex,
            imagesPerPage
          );
          console.log(`页面 ${page + 1} 完成, 当前处理到第 ${currentImageIndex} 张图片`);
        } catch (err) {
          console.error(`生成页面 ${page + 1} 布局时出错:`, err);
          setError(prev => prev ? `${prev}; 生成页面 ${page + 1} 失败` : `生成页面 ${page + 1} 失败`);
          // 尝试继续生成下一页
          continue;
        }
      }

      // 添加水印
      if (watermarkText) {
        console.log('添加水印:', watermarkText);
        addWatermark(doc, watermarkText);
      }

      // 添加页码
      if (addPageNumbers) {
        console.log('添加页码');
        addPageNumbersToPdf(doc);
      }

      // 确定文件名
      let filename = "images-to-pdf.pdf";
      if (customFilename.trim()) {
        filename = customFilename.trim().endsWith('.pdf')
          ? customFilename.trim()
          : `${customFilename.trim()}.pdf`;
      } else if (images.length === 1) {
        filename = images[0].name.replace(/\.[^/.]+$/, "") + ".pdf";
      }

      if (isPreview) {
        // 如果是预览模式，先清理之前的预览URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        // 生成PDF blob并创建预览URL
        const pdfBlob = doc.output('blob');
        const newPreviewUrl = URL.createObjectURL(pdfBlob);
        setPreviewUrl(newPreviewUrl);
        setPreviewMode(true);
      } else {
        // 保存PDF
        doc.save(filename);
        setMessage(t('imageToPdf.pdfGenerated') || 'PDF已成功生成并下载');
      }
    } catch (err) {
      console.error('PDF生成错误:', err);
      setError(t('imageToPdf.pdfGenerationError') || '生成PDF时出错，请重试');
    } finally {
      setLoading(false);
    }
  }, [
    images,
    pdfQuality,
    processImageWithCanvas,
    t,
    pageFormat,
    pageOrientation,
    pageMargin,
    imagesPerPage,
    fitMethod,
    addPageNumbers,
    customFilename,
    watermarkText,
    getPageDimensions,
    generateGridLayout,
    addWatermark,
    addPageNumbersToPdf,
    previewUrl
  ]);

  // 预览PDF
  const handlePreviewPdf = useCallback(async () => {
    await handleGeneratePdf(true);
  }, [handleGeneratePdf]);

  // 清除预览
  const handleClosePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewMode(false);
  }, [previewUrl]);

  // 组件卸载时清理资源
  const cleanup = useCallback(() => {
    cleanupResources();
  }, [cleanupResources]);

  return {
    images,
    loading,
    error,
    message,
    pdfQuality,
    setPdfQuality,
    pageFormat,
    setPageFormat,
    pageOrientation,
    setPageOrientation,
    pageMargin,
    setPageMargin,
    imagesPerPage,
    setImagesPerPage,
    fitMethod,
    setFitMethod,
    addPageNumbers,
    setAddPageNumbers,
    customFilename,
    setCustomFilename,
    watermarkText,
    setWatermarkText,
    previewMode,
    setPreviewMode,
    previewUrl,
    handleImageUpload,
    handleRemoveImage,
    handleRemoveAllImages,
    handleDragEnd,
    handleGeneratePdf,
    handlePdfQualityChange,
    handlePreviewPdf,
    handleClosePreview,
    cleanup
  };
}