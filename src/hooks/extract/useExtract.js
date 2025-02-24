import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { getDocument, GlobalWorkerOptions, OPS } from 'pdfjs-dist';

export const useExtract = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [extractedImages, setExtractedImages] = useState([]);
  const { t } = useTranslation();
  const extractedUrlsRef = useRef(new Set());

  // 处理文件选择
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // 生成临时URL
    const url = URL.createObjectURL(selectedFile); 
    setFile(selectedFile);
    setFileUrl(url);
    setError(null);
    setExtractedImages([]);
  }, [t]);

// 指定 Worker 的路径
GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';



const extractImagesFromPdf = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('文件加载失败');
    
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 4) throw new Error('空文件');

    const header = new Uint8Array(arrayBuffer.slice(0, 4));
    if (String.fromCharCode(...header) !== '%PDF') {
      throw new Error('无效的PDF文件');
    }

    // 获取PDF文档
    const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const totalPages = pdf.numPages;
    const images = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      console.log(`Page ${pageNum} 操作符数量: ${ops.fnArray.length}`, ops.fnArray);
      console.log(`Page ${pageNum} 参数数组:`, ops.argsArray);

      // 检查不同的操作符类型
      for (const [index, op] of ops.fnArray.entries()) {
        if ([OPS.paintJpegXObject, OPS.paintImageXObject, OPS.paintInlineImageXObject].includes(op)) {
          const imgKey = ops.argsArray[index]?.[0];
          if (!imgKey) {
            console.warn(`Page ${pageNum} 无有效imgKey`);
            continue;
          }

          const maxRetries = 5;
          const retryDelay = 100; // 毫秒
          let img = null;
          let retries = 0;
          while (retries < maxRetries) {
            try {
              img = await page.objs.get(imgKey);
              break; // 若成功则跳出循环
            } catch (error) {
              if (error.message.includes("isn't resolved yet")) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retries++;
              } else {
                console.error(`获取图像对象 ${imgKey} 时发生错误: ${error.message}`);
                break;
              }
            }
          }
          if (!img) {
            console.warn(`图片 ${imgKey} 在重试后仍未解析，跳过`);
            continue;
          }

          console.log('img object:', img);
          if (img && img.data) {
            const blob = new Blob([img.data], { type: img.mimeType || 'image/jpeg' });
            images.push({
              blob,
              mimeType: img.mimeType || 'image/jpeg',
              width: img.width,
              height: img.height,
            });
          } else if (img.src) {
            console.log(`使用 img.src: ${img.src}`);
            images.push({
              blob: null,
              mimeType: 'image/jpeg',
              width: img.width,
              height: img.height,
              src: img.src,
            });
          } else if (img.bitmap) {
            const canvas = document.createElement("canvas");
            canvas.width = img.bitmap.width;
            canvas.height = img.bitmap.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img.bitmap, 0, 0);
            
            const blob = await new Promise((resolve) => {
              canvas.toBlob(resolve, "image/png");
            });
            
            images.push({
              blob,
              mimeType: "image/png",
              width: img.bitmap.width,
              height: img.bitmap.height,
            });
          } else {
            console.warn(`Page ${pageNum} imgKey ${imgKey} 无图像数据`);
          }
        }
      }
    }

    return images;
  } catch (error) {
    console.error('PDF处理失败:', error);
    throw new Error(`文件处理失败: ${error.message}`);
  }
};




  // 提取图片
  const handleExtract = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    try {
      const images = await extractImagesFromPdf(fileUrl);
      const processedImages = images.map((img, index) => {
        const url = URL.createObjectURL(img.blob);
        extractedUrlsRef.current.add(url);
        
        return {
          id: uuidv4(),
          url,
          size: img.blob.size,
          dimensions: `${img.width}x${img.height}`,
          page: Math.floor(index / 2) + 1 // 假设每页约2张图片
        };
      });

      setExtractedImages(processedImages);
      setMessage(t('extract.success', { count: processedImages.length }));
    } catch (err) {
      setError(t('extract.errors.extractFailed'));
    } finally {
      setLoading(false);
    }
  }, [file, fileUrl, t]);

  // 下载单个图片
  const handleDownload = useCallback((image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 下载选中的图片（打包为zip）
  const handleDownloadAll = useCallback(async (selectedIds) => {
    const zip = new JSZip();
    const selectedImages = extractedImages.filter(img => selectedIds.includes(img.id));
    
    selectedImages.forEach((image, index) => {
      zip.file(`image-${index + 1}.png`, image.url.split(',')[1], { base64: true });
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [extractedImages]);

  const cleanup = useCallback(() => {
    if (file) URL.revokeObjectURL(fileUrl);
    extractedUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    extractedUrlsRef.current.clear();
  }, [fileUrl]);

  return {
    file,
    fileUrl,
    loading,
    error,
    message,
    extractedImages,
    handleFileSelect,
    handleExtract,
    handleDownload,
    handleDownloadAll,
    setError,
    setMessage
  };
};
