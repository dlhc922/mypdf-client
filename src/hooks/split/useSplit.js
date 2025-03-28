import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTranslation } from 'react-i18next';

export const useSplit = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [splitFiles, setSplitFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // 文件选择处理
  const handleFileSelect = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.[0]) return;
    const pdfFile = selectedFiles[0];
    if (pdfFile.type !== 'application/pdf') {
      setError(t('split.invalidPdfFile'));
      return;
    }
    setFile(pdfFile);
    setSplitFiles([]);
    setError(null);
    setMessage(null);
  }, [t]);

  // 验证页码范围
  const validateRanges = (ranges, totalPages) => {
    for (const range of ranges) {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      
      if (isNaN(start) || isNaN(end)) {
        throw new Error(t('split.enterValidPageRange'));
      }
      
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(t('split.pageRangeMustBeBetween', { totalPages }));
      }
    }
  };

  // 解析自定义选择字符串
  const parseCustomSelection = (selection, totalPages) => {
    try {
      const pages = new Set();
      const parts = selection.split(',').map(part => part.trim());

      for (const part of parts) {
        if (part.includes('-')) {
          // 处理范围，如 "1-5"
          const [start, end] = part.split('-').map(num => parseInt(num));
          if (isNaN(start) || isNaN(end)) {
            throw new Error(t('split.invalidPageRange'));
          }
          if (start < 1 || end > totalPages || start > end) {
            throw new Error(t('split.pageMustBeBetween', { totalPages }));
          }
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        } else {
          // 处理单页，如 "3"
          const pageNum = parseInt(part);
          if (isNaN(pageNum)) {
            throw new Error(t('split.invalidPageNumber'));
          }
          if (pageNum < 1 || pageNum > totalPages) {
            throw new Error(t('split.pageNumberMustBeBetween', { totalPages }));
          }
          pages.add(pageNum);
        }
      }

      return Array.from(pages).sort((a, b) => a - b);
    } catch (err) {
      throw new Error(t('split.pageFormatError', { error: err.message }));
    }
  };

  // 修改 handleSplit 函数支持两种模式
  const handleSplit = async (input) => {
    if (!file) {
      setError(t('split.pleaseSelectFile'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      const newFiles = [];

      if (Array.isArray(input) && input[0].start !== undefined) {
        // 范围选择模式
        validateRanges(input, totalPages);
        for (const range of input) {
          const start = parseInt(range.start) - 1;
          const end = parseInt(range.end) - 1;
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(pdfDoc, Array.from(
            { length: end - start + 1 },
            (_, i) => start + i
          ));
          pages.forEach(page => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          newFiles.push({
            pageNumber: `${range.start}-${range.end}`,
            url: URL.createObjectURL(blob)
          });
        }
      } else {
        // 自定义选择模式
        for (const selection of input) {
          if (!selection.trim()) continue;
          const selectedPages = parseCustomSelection(selection, totalPages);
          if (selectedPages.length === 0) continue;

          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(pdfDoc, selectedPages.map(num => num - 1));
          pages.forEach(page => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          newFiles.push({
            pageNumber: selection,
            url: URL.createObjectURL(blob)
          });
        }
      }

      setSplitFiles(newFiles);
      setMessage(t('split.successfullyCreatedFiles', { count: newFiles.length }));
    } catch (err) {
      console.error('拆分失败:', err);
      setError(err.message || t('split.fileProcessingFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 下载拆分文件
  const handleDownload = useCallback((url, pageRange) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_页${pageRange}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [file]);

  return {
    file,
    splitFiles,
    loading,
    error,
    message,
    handleFileSelect,
    handleSplit,
    handleDownload,
    setFile,
    setSplitFiles,
    setError,
    setMessage
  };
}; 