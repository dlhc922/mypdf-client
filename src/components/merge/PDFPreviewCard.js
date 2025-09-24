import React, { useState, useEffect, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, IconButton, Box, CircularProgress, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const PDFPreviewCard = memo(({ file, index, onRemove }) => {
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
    height: '100%',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        sx={{
          height: '100%',
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
          }}
        >
          {loading && (
            <CircularProgress 
              size={24} 
              sx={{ position: 'absolute', zIndex: 1 }}
            />
          )}

          {error && (
            <Typography color="error" align="center" sx={{ p: 2 }}>
              {error.message}
            </Typography>
          )}

          <Document
            file={file.previewUrl}
            onLoadSuccess={() => setLoading(false)}
            onLoadError={(err) => {
              setError(err);
              setLoading(false);
            }}
            loading={null}
          >
            <Page
              pageNumber={1}
              width={140}
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
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.file.id === nextProps.file.id &&
    prevProps.index === nextProps.index
  );
});

PDFPreviewCard.displayName = 'PDFPreviewCard';

PDFPreviewCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    file: PropTypes.instanceOf(File).isRequired,
    previewUrl: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default PDFPreviewCard; 