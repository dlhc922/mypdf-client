import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Box, Typography, CircularProgress, Pagination, Paper } from '@mui/material';

function PdfViewer({ file, zoom = 1.0 }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 文档加载成功
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  // 文档加载失败
  const onDocumentLoadError = (error) => {
    console.error('PDF加载错误:', error);
    setError('PDF文件加载失败，请检查文件是否有效');
    setLoading(false);
  };

  // 页面变化处理
  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 2,
      minHeight: '100%'
    }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ my: 4 }}>
          {error}
        </Typography>
      )}
      
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<CircularProgress />}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 2, 
            p: 1, 
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
            maxWidth: '100%'
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={600}
          />
        </Paper>
      </Document>
      
      {numPages && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          p: 1,
          borderRadius: 1,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          width: 'auto'
        }}>
          <Pagination 
            count={numPages} 
            page={pageNumber} 
            onChange={handlePageChange} 
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" sx={{ ml: 2 }}>
            第 {pageNumber} 页，共 {numPages} 页
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default PdfViewer; 