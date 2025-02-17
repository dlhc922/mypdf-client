import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, Typography, IconButton, Box, CircularProgress, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const PDFPreviewCard = memo(({ file, index, onRemove, isDragging }) => {
  const { t } = useTranslation();
  console.log('PDFPreviewCard constructing:', file.name);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  // 检查 worker 配置
  useEffect(() => {
    console.log('PDFPreviewCard worker check:', {
      workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
      workerVersion: pdfjs.version,
      file: {
        name: file.name,
        type: file.file.type,
        size: file.file.size,
        previewUrl: file.previewUrl
      }
    });
  }, [file]);

  return (
    <Card 
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'none',
        opacity: isDragging ? 0.9 : 1,
        position: 'relative',
        boxShadow: (theme) => isDragging ? theme.shadows[8] : theme.shadows[1],
        '&:hover': {
          boxShadow: (theme) => isDragging ? theme.shadows[12] : theme.shadows[4]
        },
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          zIndex: 1,
          boxShadow: 1,
          transition: 'transform 0.2s ease',
          transform: isDragging ? 'scale(1.1)' : 'none'
        }}
      >
        {index + 1}
      </Box>

      <Box 
        sx={{ 
          position: 'relative',
          height: 160,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.50',
          overflow: 'hidden',
          '& canvas': {
            transition: 'transform 0.2s ease',
            transform: isDragging ? 'scale(0.98)' : 'none'
          }
        }}
      >
        {/* 显示加载状态 */}
        {loading && (
          <CircularProgress 
            size={24} 
            sx={{ position: 'absolute', zIndex: 1 }}
          />
        )}

        {/* 显示错误信息 */}
        {error && (
          <Typography color="error" align="center" sx={{ p: 2 }}>
            {error.message}
          </Typography>
        )}

        {/* PDF 预览 */}
        <Document
          file={file.previewUrl}
          onLoadSuccess={() => {
            console.log('Document loaded:', file.name);
            setLoading(false);
          }}
          onLoadError={(error) => {
            console.error('Document load error:', {
              file: file.name,
              error: error.message
            });
            setError(error);
            setLoading(false);
          }}
          loading={null}
        >
          <Page
            pageNumber={1}
            width={140}
            onLoadSuccess={(page) => {
              console.log('Page loaded:', {
                file: file.name,
                dimensions: `${page.width}x${page.height}`
              });
              setPageLoaded(true);
            }}
            onRenderError={(error) => {
              console.error('Page render error:', {
                file: file.name,
                error: error.message
              });
              setError(error);
            }}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </Box>

      <CardContent 
        sx={{ 
          p: '8px 12px !important',
          bgcolor: 'background.paper'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}
        >
          <Typography 
            variant="body2" 
            noWrap 
            sx={{ 
              flex: 1,
              fontSize: '0.875rem',
              color: 'text.primary'
            }}
          >
            {file.name}
          </Typography>
          <Tooltip title={t('merge.deleteFile')}>
            <IconButton 
              size="small" 
              onClick={() => onRemove(file.id)}
              sx={{ 
                color: 'error.light',
                p: 0.5,
                '&:hover': {
                  bgcolor: 'error.lighter'
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // 只有在必要时才重新渲染
  return (
    prevProps.file.id === nextProps.file.id &&
    prevProps.index === nextProps.index &&
    prevProps.isDragging === nextProps.isDragging
  );
});

PDFPreviewCard.displayName = 'PDFPreviewCard';

PDFPreviewCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    file: PropTypes.instanceOf(File).isRequired,
    previewUrl: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  isDragging: PropTypes.bool
};

PDFPreviewCard.defaultProps = {
  isDragging: false
};

export default PDFPreviewCard; 