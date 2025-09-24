import { useState, useCallback, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTranslation } from 'react-i18next';

export const useMerge = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mergedFileUrl, setMergedFileUrl] = useState(null);
  const [hasServerFiles, setHasServerFiles] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
    };
  }, [files, mergedFileUrl]);

  const handleFileSelect = useCallback((event) => {
    const newFiles = Array.from(event.target.files || []);
    
    if (newFiles.length === 0 || newFiles.some(file => file.type !== 'application/pdf')) {
      return;
    }

    setFiles(prevFiles => {
      const updatedFiles = [
        ...prevFiles,
        ...newFiles.map((file, index) => ({
            id: `${Date.now()}-${index}`,
            name: file.name,
            file: file,
          previewUrl: URL.createObjectURL(file)
        }))
      ];
      return updatedFiles;
    });

    event.target.value = '';
  }, []);

  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prevFiles.filter(file => file.id !== fileId);
    });
  }, []);

  const handlePageReorder = useCallback((event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        const newItems = Array.from(items);
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return newItems;
    });
    }
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError(t('merge.atLeastTwoFiles'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const fileItem of files) {
        const arrayBuffer = await fileItem.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      if (mergedFileUrl) {
        URL.revokeObjectURL(mergedFileUrl);
      }
      const url = URL.createObjectURL(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
      setMergedFileUrl(url);
      setHasServerFiles(false);
      setMessage(t('merge.mergeSuccess'));
      return url;
    } catch (err) {
      setError(err.message || t('merge.mergeFailed'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [files, mergedFileUrl, t]);

  const handleDownload = useCallback((url = mergedFileUrl) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_${new Date().getTime()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [mergedFileUrl]);

  const handleCleanup = useCallback(() => {
    if (mergedFileUrl) {
      URL.revokeObjectURL(mergedFileUrl);
    }
    setMergedFileUrl(null);
    setMessage(t('merge.cleanupSuccess'));
  }, [mergedFileUrl, t]);

  return {
    files,
    loading,
    error,
    mergedFileUrl,
    hasServerFiles,
    handleFileSelect,
    handleMerge,
    handleDownload,
    handleRemoveFile,
    handlePageReorder,
    handleCleanup,
    message,
    setMessage,
  };
};