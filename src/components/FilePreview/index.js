import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  IconButton,
  Stack 
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut,
  RestartAlt,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Article as ArticleIcon,
  TableChart as TableIcon,
  Slideshow as SlideshowIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import * as XLSX from 'xlsx';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import mammoth from 'mammoth';

// 文本预览的样式组件
const TextPreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '14px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  overflowX: 'auto',
  maxHeight: '500px',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  border: `1px solid ${theme.palette.divider}`
}));

// Excel预览的样式组件
const ExcelPreview = styled(Box)(({ theme }) => ({
  width: '100%',
  maxHeight: '500px',
  overflowY: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '0.875rem'
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: '6px 8px',
    textAlign: 'left'
  },
  '& th': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold'
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50]
  }
}));

// Word预览容器
const WordPreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '500px',
  overflow: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  padding: theme.spacing(2),
  '& .docx-wrapper': {
    padding: '0 !important'
  }
}));

// 通用文件预览组件
const FilePreview = ({ file, fileUrl, fileType }) => {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [textContent, setTextContent] = useState('');
  const [excelData, setExcelData] = useState(null);
  // 添加Word文档HTML内容状态
  const [wordHtml, setWordHtml] = useState('');
  
  // 添加一个 ref 用于 Word 容器
  const wordContainerRef = useRef(null);
  
  // 重置缩放
  const resetZoom = () => setScale(1);
  
  // 缩放控制
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // PDF文档加载成功回调
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  // 页面导航
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages || 1));

  // 加载文本文件内容
  useEffect(() => {
    if (file && ['text', 'html', 'data'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target.result);
      };
      reader.readAsText(file);
    } else {
      setTextContent('');
    }
  }, [file, fileType]);

  // 加载Excel文件内容
  useEffect(() => {
    if (file && fileType === 'excel') {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setExcelData(jsonData);
        } catch (error) {
          console.error('Excel解析错误:', error);
          setErrorMessage(t('filePreview.errors.excelParseError'));
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setExcelData(null);
    }
  }, [file, fileType, t]);

  // 加载Word文档内容，使用 Mammoth.js 转换为 HTML
  useEffect(() => {
    if ((file || fileUrl) && fileType === 'word') {
      setIsLoading(true);
      setWordHtml(''); // 清空之前的HTML
      
      const convertDocxToHtml = async (content) => {
        try {
          console.log('开始转换Word文档，大小:', content?.byteLength || 'unknown');
          const result = await mammoth.convertToHtml({ arrayBuffer: content });
          console.log('Word转换成功');
          setWordHtml(result.value);
          setIsLoading(false);
        } catch (error) {
          console.error('Mammoth conversion error:', error);
          setErrorMessage(t('filePreview.errors.wordRenderError'));
          setIsLoading(false);
        }
      };
      
      if (file) {
        console.log('Word预览：从file对象读取');
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('文件读取完成');
          convertDocxToHtml(e.target.result);
        };
        reader.onerror = (e) => {
          console.error('File reading error:', e);
          setErrorMessage(t('filePreview.errors.loadError'));
          setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (fileUrl) {
        console.log('Word预览：从URL获取', fileUrl);
        fetch(fileUrl)
          .then(response => response.arrayBuffer())
          .then(buffer => {
            console.log('获取URL内容完成，准备转换');
            convertDocxToHtml(buffer);
          })
          .catch(error => {
            console.error('Error fetching Word document:', error);
            setErrorMessage(t('filePreview.errors.wordFetchError'));
            setIsLoading(false);
          });
      }
    }
  }, [file, fileUrl, fileType, t]);

  // 获取文件类型图标
  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'pdf': return <PdfIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'word': return <ArticleIcon sx={{ fontSize: 60, color: '#2b579a', opacity: 0.7 }} />;
      case 'excel': return <TableIcon sx={{ fontSize: 60, color: '#217346', opacity: 0.7 }} />;
      case 'powerpoint': return <SlideshowIcon sx={{ fontSize: 60, color: '#d24726', opacity: 0.7 }} />;
      case 'image': return <ImageIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'audio': return <AudioIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'video': return <VideoIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      default: return <FileIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.7 }} />;
    }
  };

  // 如果没有文件
  if (!file && !fileUrl) {
    return (
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 4,
          minHeight: 300,
          backgroundColor: 'rgba(0,0,0,0.02)'
        }}
      >
        <FileIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {t('filePreview.noFile')}
        </Typography>
      </Box>
    );
  }

  // 加载中显示
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 4,
          minHeight: 300
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {t('filePreview.loading')}
        </Typography>
      </Box>
    );
  }

  // 错误显示
  if (errorMessage) {
    return (
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 4,
          minHeight: 300,
          backgroundColor: 'rgba(255,0,0,0.03)'
        }}
      >
        <FileIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="body1" color="error">
          {errorMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {file.name}
        </Typography>
      </Box>
    );
  }

  // 根据文件类型渲染不同的预览
  switch (fileType) {
    // PDF预览
    case 'pdf':
      return (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
            <IconButton onClick={resetZoom} size="small">
              <RestartAlt />
            </IconButton>
          </Stack>
          
          <Box 
            sx={{ 
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 500,
              position: 'relative',
              height: 'auto'
            }}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              }
              error={
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="error">{t('filePreview.errors.pdfLoadError')}</Typography>
                </Box>
              }
            >
              <Page 
                pageNumber={currentPage} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            
            {numPages && numPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                <IconButton onClick={handlePreviousPage} disabled={currentPage <= 1} size="small">
                  {t('filePreview.previous')}
                </IconButton>
                <Typography variant="body2" sx={{ lineHeight: '32px' }}>
                  {currentPage} / {numPages}
                </Typography>
                <IconButton onClick={handleNextPage} disabled={currentPage >= numPages} size="small">
                  {t('filePreview.next')}
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      );
    
    // 图片预览
    case 'image':
      return (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
            <IconButton onClick={resetZoom} size="small">
              <RestartAlt />
            </IconButton>
          </Stack>
          
          <Box 
            sx={{ 
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              overflow: 'auto',
              maxHeight: 500
            }}
          >
            <img 
              src={fileUrl} 
              alt={file.name} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '400px', 
                objectFit: 'contain',
                transform: `scale(${scale})`
              }}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                {file.name}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    
    // 音频预览
    case 'audio':
      return (
        <Box 
          sx={{ 
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <AudioIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            {file.name}
          </Typography>
          <audio controls src={fileUrl} style={{ width: '100%', marginTop: '16px' }}>
            {t('filePreview.audioNotSupported')}
          </audio>
        </Box>
      );
    
    // 视频预览
    case 'video':
      return (
        <Box 
          sx={{ 
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            textAlign: 'center'
          }}
        >
          <video 
            controls 
            src={fileUrl} 
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          >
            {t('filePreview.videoNotSupported')}
          </video>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {file.name}
          </Typography>
        </Box>
      );
    
    // 文本预览
    case 'text':
    case 'html':
    case 'data':
      return (
        <Box 
          sx={{ 
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            maxHeight: 500
          }}
        >
          <TextPreview>
            {textContent || t('filePreview.loading')}
          </TextPreview>
        </Box>
      );
    
    // Excel预览
    case 'excel':
      return (
        <Box>
          <ExcelPreview>
            <table>
              <thead>
                {excelData && excelData.length > 0 && (
                  <tr>
                    {excelData[0].map((cell, cellIndex) => (
                      <th key={cellIndex}>{cell || ''}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {excelData && excelData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ExcelPreview>
        </Box>
      );
    
    // Word预览
    case 'word':
      return (
        <WordPreviewContainer>
          {wordHtml ? (
            <div dangerouslySetInnerHTML={{ __html: wordHtml }} />
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {!isLoading && !errorMessage && (
                <Typography color="textSecondary">
                  {t('filePreview.loading')}
                </Typography>
              )}
            </Box>
          )}
        </WordPreviewContainer>
      );
    
    // PowerPoint预览
    case 'powerpoint':
      return (
        <Box>
          <DocViewer
            documents={[{ uri: fileUrl, fileType: 'pptx', fileName: file.name }]}
            pluginRenderers={DocViewerRenderers}
            style={{ height: '500px' }}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true
              }
            }}
          />
        </Box>
      );
    
    // 默认预览
    default:
      return (
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 4,
            minHeight: 200
          }}
        >
          {getFileTypeIcon()}
          <Typography variant="body1" sx={{ ml: 2 }}>
            {file.name}
          </Typography>
        </Box>
      );
  }
};

export default FilePreview; 