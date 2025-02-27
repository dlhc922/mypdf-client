import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

export function useImageToPdf() {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [pdfQuality, setPdfQuality] = useState('medium');

  // 处理图片上传
  const handleImageUpload = useCallback((files) => {
    // 过滤非图片文件
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError(t('imageToPdf.noImagesSelected') || '请选择有效的图片文件');
      return;
    }
    
    setError(null);
    
    // 处理每个图片文件
    const newImages = imageFiles.map(file => {
      // 创建预览URL
      const preview = URL.createObjectURL(file);
      
      return {
        id: uuidv4(),
        file,
        preview,
        name: file.name
      };
    });
    
    setImages(prevImages => [...prevImages, ...newImages]);
    setMessage(t('imageToPdf.imagesAdded', { count: imageFiles.length }) || `已添加 ${imageFiles.length} 张图片`);
    
    // 清除消息
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }, [t]);

  // 移除单个图片
  const handleRemoveImage = useCallback((id) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(image => image.id !== id);
      
      // 释放被移除图片的预览URL
      const removedImage = prevImages.find(image => image.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      
      return updatedImages;
    });
  }, []);

  // 移除所有图片
  const handleRemoveAllImages = useCallback(() => {
    // 释放所有预览URL
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
    
    setImages([]);
  }, [images]);

  // 处理拖拽排序
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    setImages(prevImages => {
      const items = Array.from(prevImages);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      return items;
    });
  }, []);

  // 处理PDF质量变更
  const handlePdfQualityChange = useCallback((quality) => {
    setPdfQuality(quality);
  }, []);

  // 使用Canvas调整图片质量
  const processImageWithCanvas = useCallback((img, quality) => {
    return new Promise((resolve) => {
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 根据质量设置不同的参数
      let scale = 1.0;
      
      switch(quality) {
        case 'low':
          scale = 0.5;  // 低质量，缩小到50%
          break;
        case 'medium':
          scale = 0.75; // 中等质量，缩小到75%
          break;
        case 'high':
          scale = 1.0;  // 高质量，保持原始尺寸
          break;
        default:
          scale = 0.75;
      }
      
      // 设置Canvas尺寸
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // 绘制图片到Canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 转换为base64数据
      let compressionQuality = 0.92;
      if (quality === 'low') {
        compressionQuality = 0.5;
      } else if (quality === 'medium') {
        compressionQuality = 0.75;
      }
      
      // 获取base64数据
      const dataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
      
      // 创建新图片对象
      const processedImg = new Image();
      processedImg.src = dataUrl;
      
      processedImg.onload = () => {
        resolve(processedImg);
      };
    });
  }, []);

  // 生成PDF
  const handleGeneratePdf = useCallback(async () => {
    if (images.length === 0) {
      setError(t('imageToPdf.noImagesSelected') || '请先上传图片');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 创建PDF文档
      const doc = new jsPDF();
      
      // 处理每张图片
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // 如果不是第一张图片，添加新页
        if (i > 0) {
          doc.addPage();
        }
        
        // 创建图片元素以获取尺寸
        const img = new Image();
        img.src = image.preview;
        
        // 等待图片加载完成
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // 使用Canvas处理图片质量
        const processedImg = await processImageWithCanvas(img, pdfQuality);
        
        // 计算PDF页面尺寸（默认为A4，单位为mm）
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // 计算缩放比例，使图片适应页面
        let scale = 1;
        if (processedImg.width > processedImg.height) {
          // 横向图片
          scale = Math.min(pageWidth / processedImg.width, pageHeight / processedImg.height);
        } else {
          // 纵向图片
          scale = Math.min(pageWidth / processedImg.width, pageHeight / processedImg.height);
        }
        
        // 计算缩放后的尺寸
        const scaledWidth = processedImg.width * scale;
        const scaledHeight = processedImg.height * scale;
        
        // 计算居中位置
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        // 将图片添加到PDF
        doc.addImage(
          processedImg.src, 
          'JPEG', 
          x, 
          y, 
          scaledWidth, 
          scaledHeight
        );
      }
      
      // 保存PDF
      const filename = images.length === 1 
        ? images[0].name.replace(/\.[^/.]+$/, "") + ".pdf"
        : "images-to-pdf.pdf";
      
      doc.save(filename);
      
      setMessage(t('imageToPdf.pdfGenerated') || 'PDF已成功生成并下载');
    } catch (err) {
      console.error('PDF生成错误:', err);
      setError(t('imageToPdf.pdfGenerationError') || '生成PDF时出错，请重试');
    } finally {
      setLoading(false);
    }
  }, [images, pdfQuality, processImageWithCanvas, t]);

  // 组件卸载时清理
  const cleanup = useCallback(() => {
    // 释放所有预览URL
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
  }, [images]);

  return {
    images,
    loading,
    error,
    message,
    pdfQuality,
    setPdfQuality,
    handleImageUpload,
    handleRemoveImage,
    handleRemoveAllImages,
    handleDragEnd,
    handleGeneratePdf,
    handlePdfQualityChange,
    cleanup
  };
} 