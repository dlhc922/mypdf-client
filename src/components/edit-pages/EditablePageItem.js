import React, { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  Checkbox,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  SwapHoriz as ReplaceIcon,
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useTranslation } from 'react-i18next';

const EditablePageItem = ({ 
  page, 
  index, 
  isSelected, 
  onSelect, 
  onReplace, 
  zoom,
  file,
  isDragDisabled = false,
}) => {
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState(null);
  const replaceInputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
    height: '100%',
  };

  const handleReplaceClick = () => {
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onReplace(page.id, file);
      event.target.value = '';
    }
  };

  const handlePageLoadSuccess = () => {
    setPageLoading(false);
    setPageError(null);
  };

  const handlePageLoadError = (error) => {
    setPageLoading(false);
    setPageError(error);
  };

  const handleCardClick = (event) => {
    if (event.target.closest('.replace-button')) {
      return;
    }
    onSelect(page.id, !isSelected);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        sx={{
          height: '100%',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          backgroundColor: isSelected 
            ? alpha('#1976d2', 0.08) 
            : 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDragging ? 8 : 1,
          '&:hover': {
            boxShadow: (theme) => isDragging ? theme.shadows[12] : theme.shadows[4],
          },
          '&:hover .replace-button': {
            opacity: 1,
          },
          cursor: isDragDisabled ? 'default' : 'grab',
        }}
        onClick={handleCardClick}
      >

        {/* 选择框 */}
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(page.id, e.target.checked);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        />

        {/* 替换按钮 */}
        <Button
          className="replace-button"
          variant="contained"
          size="small"
          startIcon={<ReplaceIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleReplaceClick();
          }}
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            opacity: 0,
            transition: 'all 0.2s',
            zIndex: 2,
            backgroundColor: 'secondary.main',
            color: 'white',
            fontSize: '0.75rem',
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'secondary.dark',
              transform: 'scale(1.05)',
            },
          }}
        >
          {t('editPages.replace')}
        </Button>
        <input
          type="file"
          ref={replaceInputRef}
          onChange={handleReplaceFile}
          style={{ display: 'none' }}
          accept="application/pdf,image/*"
        />

        <CardContent sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* PDF页面预览 */}
          <Box
            className="page-preview"
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              minHeight: 240,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.300',
            }}
          >
            {pageLoading && (
              <CircularProgress size={24} />
            )}
            
            {pageError && (
              <Typography color="error" variant="body2" align="center">
                {t('common.loadError')}
              </Typography>
            )}

            {!pageError && (
              <>
                {page.isReplaced && page.replacementData ? (
                  page.replacementData.type === 'image' ? (
                    <img
                      src={URL.createObjectURL(new Blob([page.replacementData.data], { type: page.replacementData.mimeType }))}
                      alt="Replacement"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                      onLoad={(e) => {
                        setTimeout(() => URL.revokeObjectURL(e.target.src), 100);
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'grey.100', border: '2px dashed', borderColor: 'secondary.main' }}>
                      <Typography variant="body2" color="secondary.main">
                        {t('editPages.replacedWithPdf')}
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Document file={page.originalFile || file} loading="" error="">
                    <Page
                      pageNumber={page.originalIndex + 1}
                      width={180}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onLoadSuccess={handlePageLoadSuccess}
                      onLoadError={handlePageLoadError}
                      loading=""
                      error=""
                    />
                  </Document>
                )}
              </>
            )}

            {/* 页面编号 */}
            <Box
              className="page-number-badge"
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                boxShadow: 1,
              }}
            >
              {index + 1}
            </Box>

            {/* 替换标识 */}
            {page.isReplaced && (
              <Chip
                label={t('editPages.replaceWith')}
                size="small"
                color="secondary"
                className="replacement-badge"
                sx={{
                  position: 'absolute',
                  top: 6,
                  left: 34, // 避开页码圆圈
                  fontSize: '0.6rem',
                  height: 18,
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditablePageItem; 