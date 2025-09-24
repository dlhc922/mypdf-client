import { useState, useCallback, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { useTranslation } from 'react-i18next';

export const useEditPages = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [editedFile, setEditedFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  // 处理文件选择
  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError(t('editPages.error'));
      return;
    }

    setFile(selectedFile);
    setError(null);
    setMessage(null);
    setEditedFile(null);
    setHasChanges(false);
    setSelectedPages(new Set());
    
    // 重置文件输入
    if (event.target) {
      event.target.value = '';
    }
  }, [t]);

  // 处理文档加载成功
  const handleDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    // 初始化页面数组
    const initialPages = Array.from({ length: numPages }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      originalIndex: index,
      selected: false,
    }));
    setPages(initialPages);
    setLoading(false);
  }, []);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleFitWidth = useCallback(() => {
    setZoom(1.2);
  }, []);

  // 页面选择
  const handlePageSelect = useCallback((pageId, isSelected) => {
    setSelectedPages(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(pageId);
      } else {
        newSelected.delete(pageId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPages(new Set(pages.map(page => page.id)));
  }, [pages]);

  const handleClearSelection = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  // 计算当前视口下每行可容纳多少个页面
  const getItemsPerRow = () => {
    const w = window.innerWidth;
    // 与编辑页中的 MUI 断点保持一致
    if (w >= 1920) return 5; // xl
    if (w >= 1280) return 4; // lg
    if (w >= 900)  return 3; // md
    if (w >= 600)  return 2; // sm
    return 1; // xs
  };

  // 页面重新排序 (使用 dnd-kit)
  const handlePageReorder = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // 使用 dnd-kit 推荐的 arrayMove 函数会更可靠，但这里为清晰起见，使用 splice
        const newItems = Array.from(items);
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);

        return newItems.map((page, index) => ({
          ...page,
          pageNumber: index + 1,
        }));
      });

      setHasChanges(true);
      // 清空之前生成的文件，强制重新生成
      if (editedFile) {
        URL.revokeObjectURL(editedFile);
        setEditedFile(null);
      }
    }
  }, [editedFile]);

  // 删除选中页面
  const handleDeletePages = useCallback(() => {
    if (selectedPages.size === 0) return;

    const remainingPages = pages.filter(page => !selectedPages.has(page.id));
    
    // 重新编号
    const updatedPages = remainingPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));

    setPages(updatedPages);
    setSelectedPages(new Set());
    setNumPages(updatedPages.length);
    setHasChanges(true);
    
    // 清空之前生成的文件，强制重新生成
    if (editedFile) {
      URL.revokeObjectURL(editedFile);
      setEditedFile(null);
    }
    
    setMessage(t('editPages.success'));
  }, [pages, selectedPages, editedFile, t]);

  // 页面替换
  const handlePageReplace = useCallback(async (pageId, replacementFile) => {
    if (!replacementFile) return;

    setLoading(true);
    setError(null);

    try {
      let replacementData;
      
      if (replacementFile.type === 'application/pdf') {
        // PDF文件替换 - 保存原始数据
        const arrayBuffer = await replacementFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        if (pdfDoc.getPageCount() === 0) {
          throw new Error('PDF file has no pages');
        }
        replacementData = { type: 'pdf', data: arrayBuffer };
      } else if (replacementFile.type.startsWith('image/')) {
        // 图片文件替换
        const arrayBuffer = await replacementFile.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          throw new Error('Image file is empty');
        }
        replacementData = { type: 'image', data: arrayBuffer, mimeType: replacementFile.type };
      } else {
        throw new Error('Unsupported file type. Please select a PDF or image file.');
      }

      // 更新页面信息
      const updatedPages = pages.map(page => 
        page.id === pageId 
          ? { ...page, replacementData, isReplaced: true }
          : page
      );

      setPages(updatedPages);
      setHasChanges(true);
      
      // 清空之前生成的文件，强制重新生成
      if (editedFile) {
        URL.revokeObjectURL(editedFile);
        setEditedFile(null);
      }
      
      setMessage(t('editPages.replaceSuccess'));
    } catch (err) {
      console.error('Page replacement failed:', err);
      setError(t('editPages.error') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [pages, editedFile, t]);

  // 生成编辑后的PDF
  const handleGenerateEditedPDF = useCallback(async () => {
    if (!file || !hasChanges) return;

    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      // 按当前页面顺序添加页面
      for (const page of pages) {
        if (page.isReplaced && page.replacementData) {
                  // 添加替换的页面
        if (page.replacementData.type === 'pdf') {
          // 对于PDF替换，从原始数据加载并复制第一页
          const replacementDoc = await PDFDocument.load(page.replacementData.data);
          const [firstPage] = await newDoc.copyPages(replacementDoc, [0]);
          newDoc.addPage(firstPage);
        } else if (page.replacementData.type === 'image') {
            const image = page.replacementData.mimeType === 'image/png' 
              ? await newDoc.embedPng(page.replacementData.data)
              : await newDoc.embedJpg(page.replacementData.data);
            
            const newPage = newDoc.addPage();
            const { width, height } = newPage.getSize();
            const imageAspectRatio = image.width / image.height;
            const pageAspectRatio = width / height;
            
            let drawWidth, drawHeight;
            if (imageAspectRatio > pageAspectRatio) {
              drawWidth = width;
              drawHeight = width / imageAspectRatio;
            } else {
              drawHeight = height;
              drawWidth = height * imageAspectRatio;
            }
            
            newPage.drawImage(image, {
              x: (width - drawWidth) / 2,
              y: (height - drawHeight) / 2,
              width: drawWidth,
              height: drawHeight,
            });
          }
        } else {
          // 添加原始页面
          const [copiedPage] = await newDoc.copyPages(originalDoc, [page.originalIndex]);
          newDoc.addPage(copiedPage);
        }
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setEditedFile(url);
      setMessage(t('editPages.success'));
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(t('editPages.error') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [file, pages, hasChanges, t]);

  // 重置所有状态
  const handleReset = useCallback(() => {
    // 清理之前的URL对象
    if (editedFile && typeof editedFile === 'string') {
      URL.revokeObjectURL(editedFile);
    }
    
    setFile(null);
    setPages([]);
    setSelectedPages(new Set());
    setEditedFile(null);
    setHasChanges(false);
    setNumPages(0);
    setError(null);
    setMessage(null);
    setZoom(1);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  }, [editedFile]);

  return {
    // 状态
    file,
    pages,
    selectedPages,
    loading,
    error,
    message,
    zoom,
    numPages,
    editedFile,
    hasChanges,
    
    // 引用
    fileInputRef,
    replaceInputRef,
    
    // 方法
    handleFileSelect,
    handleDocumentLoadSuccess,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitWidth,
    handlePageSelect,
    handleSelectAll,
    handleClearSelection,
    handlePageReorder,
    handleDeletePages,
    handlePageReplace,
    handleGenerateEditedPDF,
    handleReset,
  };
}; 