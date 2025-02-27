import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { pdfjs } from 'react-pdf';
import { jsPDF } from 'jspdf';
import { diff_match_patch } from 'diff-match-patch';

// 确保只设置一次worker
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  // 使用相对路径，确保与index.js中的设置一致
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

export function usePdfCompare() {
  const { t } = useTranslation();
  const [originalPdf, setOriginalPdf] = useState(null);
  const [modifiedPdf, setModifiedPdf] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [zoom, setZoom] = useState(1.0);

  // 处理原始PDF上传
  const handleOriginalPdfUpload = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        setError(t('pdfCompare.errors.notPdf') || '请上传PDF文件');
        return;
      }
      
      setOriginalPdf(file);
      setError(null);
      
      // 如果已有比较结果，重置它
      if (comparisonResult) {
        setComparisonResult(null);
      }
    }
  }, [comparisonResult, t]);

  // 处理修改后PDF上传
  const handleModifiedPdfUpload = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        setError(t('pdfCompare.errors.notPdf') || '请上传PDF文件');
        return;
      }
      
      setModifiedPdf(file);
      setError(null);
      
      // 如果已有比较结果，重置它
      if (comparisonResult) {
        setComparisonResult(null);
      }
    }
  }, [comparisonResult, t]);

  // 移除原始PDF
  const handleRemoveOriginalPdf = useCallback(() => {
    setOriginalPdf(null);
    
    // 如果已有比较结果，重置它
    if (comparisonResult) {
      setComparisonResult(null);
    }
  }, [comparisonResult]);

  // 移除修改后PDF
  const handleRemoveModifiedPdf = useCallback(() => {
    setModifiedPdf(null);
    
    // 如果已有比较结果，重置它
    if (comparisonResult) {
      setComparisonResult(null);
    }
  }, [comparisonResult]);

  // 从PDF文件中提取文本
  const extractTextFromPdf = useCallback(async (file) => {
    try {
      // 使用更直接的方式加载PDF
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const pageTexts = [];
      const pageImages = [];
      
      // 遍历所有页面
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // 提取文本
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
        pageTexts.push(pageText);
        
        // 检查页面是否包含图像
        const operatorList = await page.getOperatorList();
        const hasImages = operatorList.fnArray.some(fn => fn === pdfjs.OPS.paintImageXObject);
        pageImages.push(hasImages);
      }
      
      return {
        fullText,
        pageTexts,
        pageImages,
        numPages: pdf.numPages
      };
    } catch (error) {
      console.error('PDF文本提取错误:', error);
      throw new Error('无法从PDF中提取文本');
    }
  }, []);

  // 比较两个PDF文件
  const handleComparePdfs = useCallback(async () => {
    if (!originalPdf || !modifiedPdf) {
      setError(t('pdfCompare.errors.missingFiles') || '请上传两个PDF文件进行比较');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // 提取两个PDF的文本
      const originalData = await extractTextFromPdf(originalPdf);
      const modifiedData = await extractTextFromPdf(modifiedPdf);
      
      // 创建差异匹配对象
      const dmp = new diff_match_patch();
      
      // 比较全文
      const fullTextDiff = dmp.diff_main(originalData.fullText, modifiedData.fullText);
      dmp.diff_cleanupSemantic(fullTextDiff);
      
      // 计算统计信息
      let addedCount = 0;
      let removedCount = 0;
      let changedCount = 0;
      
      fullTextDiff.forEach(([type, text]) => {
        if (type === 1) { // 添加
          addedCount += text.length;
        } else if (type === -1) { // 删除
          removedCount += text.length;
        }
      });
      
      changedCount = Math.min(addedCount, removedCount);
      
      // 比较每一页
      const pageDiffs = [];
      const maxPages = Math.max(originalData.numPages, modifiedData.numPages);
      
      for (let i = 0; i < maxPages; i++) {
        const originalPageText = i < originalData.pageTexts.length ? originalData.pageTexts[i] : '';
        const modifiedPageText = i < modifiedData.pageTexts.length ? modifiedData.pageTexts[i] : '';
        
        // 比较页面文本
        const pageDiff = dmp.diff_main(originalPageText, modifiedPageText);
        dmp.diff_cleanupSemantic(pageDiff);
        
        // 检查图像变化
        const originalHasImage = i < originalData.pageImages.length ? originalData.pageImages[i] : false;
        const modifiedHasImage = i < modifiedData.pageImages.length ? modifiedData.pageImages[i] : false;
        const imageChanged = originalHasImage !== modifiedHasImage;
        
        pageDiffs.push({
          pageNumber: i + 1,
          diff: pageDiff,
          imageChanged
        });
      }
      
      // 创建比较结果
      const result = {
        originalName: originalPdf.name,
        modifiedName: modifiedPdf.name,
        stats: {
          addedCount,
          removedCount,
          changedCount,
          totalDifferences: addedCount + removedCount
        },
        pageDiffs
      };
      
      setComparisonResult(result);
      setMessage(t('pdfCompare.comparisonComplete') || '比较完成，请查看结果');
    } catch (err) {
      console.error('PDF比较错误:', err);
      setError(t('pdfCompare.errors.comparisonFailed') || '比较失败，请检查PDF文件是否有效');
    } finally {
      setLoading(false);
    }
  }, [originalPdf, modifiedPdf, extractTextFromPdf, t]);

  // 重置比较结果
  const resetComparisonResult = useCallback(() => {
    setComparisonResult(null);
  }, []);

  // 放大
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 3.0));
  }, []);

  // 缩小
  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  }, []);

  // 下载比较结果PDF
  const handleDownloadComparisonPdf = useCallback(() => {
    if (!comparisonResult) return;
    
    try {
      // 创建新的PDF文档
      const doc = new jsPDF();
      
      // 添加标题
      doc.setFontSize(16);
      doc.text('PDF比较结果', 105, 15, { align: 'center' });
      
      // 添加文件信息
      doc.setFontSize(12);
      doc.text(`原始文件: ${comparisonResult.originalName}`, 20, 30);
      doc.text(`修改后文件: ${comparisonResult.modifiedName}`, 20, 40);
      
      // 添加统计信息
      doc.text('比较统计:', 20, 55);
      doc.text(`添加内容: ${comparisonResult.stats.addedCount} 字符`, 30, 65);
      doc.text(`删除内容: ${comparisonResult.stats.removedCount} 字符`, 30, 75);
      doc.text(`修改内容: ${comparisonResult.stats.changedCount} 字符`, 30, 85);
      
      // 添加页面差异信息
      doc.text('页面差异详情:', 20, 100);
      
      let y = 110;
      comparisonResult.pageDiffs.forEach(pageDiff => {
        // 检查是否需要新页面
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const hasDifferences = pageDiff.diff.some(([type]) => type !== 0);
        
        doc.text(`第 ${pageDiff.pageNumber} 页: ${hasDifferences ? '有差异' : '无差异'}`, 30, y);
        y += 10;
        
        if (pageDiff.imageChanged) {
          doc.text('  - 图像有变化', 30, y);
          y += 10;
        }
      });
      
      // 保存PDF
      doc.save('pdf-comparison-result.pdf');
      
      setMessage(t('pdfCompare.downloadComplete') || '比较结果已下载');
    } catch (err) {
      console.error('下载比较结果错误:', err);
      setError(t('pdfCompare.errors.downloadFailed') || '下载比较结果失败');
    }
  }, [comparisonResult, t]);

  return {
    originalPdf,
    modifiedPdf,
    comparisonResult,
    loading,
    error,
    message,
    zoom,
    handleOriginalPdfUpload,
    handleModifiedPdfUpload,
    handleRemoveOriginalPdf,
    handleRemoveModifiedPdf,
    handleComparePdfs,
    handleZoomIn,
    handleZoomOut,
    handleDownloadComparisonPdf,
    resetComparisonResult
  };
} 