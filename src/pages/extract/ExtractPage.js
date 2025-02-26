import React, { useState } from 'react';
import { 
  Container, 
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Tooltip,
  Chip,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Download as DownloadIcon,
  Image as ImageIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useExtract } from '../../hooks/extract/useExtract';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

// 自定义样式的预览图片容器
const PreviewImage = styled('img')({
  maxWidth: '100%',
  height: 'auto',
  borderRadius: 4,
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 0 8px rgba(0,0,0,0.2)'
  }
});

export default function ExtractPage() {
  const {
    file,
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
  } = useExtract();

  const { t } = useTranslation();
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 缩放控制
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // 文档加载成功回调
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    setMessage(t('extract.documentLoaded', { pages: numPages }));
  };

  // 处理图片选择
  const handleImageSelect = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
    setSelectAll(newSelected.size === extractedImages.length);
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(extractedImages.map(img => img.id)));
    }
    setSelectAll(!selectAll);
  };

  // 添加分页控制按钮
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* 左侧面板 */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 500
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('extract.preview')}
                </Typography>
                
                {/* 文件选择和操作按钮 */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<ImageIcon />}
                  >
                    {t('common.selectFile')}
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      onChange={handleFileSelect}
                    />
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleExtract}
                    disabled={!file || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {t('extract.extractImages')}
                  </Button>

                <IconButton onClick={handleZoomIn}>
                  <ZoomIn />
                </IconButton>
                <IconButton onClick={handleZoomOut}>
                  <ZoomOut />
                </IconButton>
              </Stack>

              {/* PDF 预览 */}
              {file && (
                <Box 
                  sx={{ 
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 600,
                    position: 'relative',
                    height: 'auto'
                  }}
                >
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <CircularProgress />
                      </Box>
                    }
                  >
                    {Array.from({ length: numPages || 0 }, (_, index) => (
                      <Box 
                        key={`page-${index + 1}`}
                        sx={{
                          mb: 4,
                          position: 'relative',
                          mx: 'auto',
                          width: 'fit-content',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Paper
                          elevation={3}
                          sx={{
                            p: 1.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Page
                            pageNumber={index + 1}
                            scale={scale}
                            loading={
                              <Box sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                height: 800
                              }}>
                                <CircularProgress />
                              </Box>
                            }
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                          />
                        </Paper>

                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'grey.500',
                            color: 'common.white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: 2
                          }}
                        >
                          {index + 1}
                        </Box>
                      </Box>
                    ))}
                  </Document>
                  
                 
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        <DeviceCompatibilityAlert mobileCompatible={true} toolName="PDF提取"></DeviceCompatibilityAlert>
        {/* 右侧面板 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('extract.extractedImages')}
              {extractedImages.length > 0 && (
                <Chip 
                  label={extractedImages.length}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>

            {/* 提取的图片列表 */}
            {extractedImages.length > 0 && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Button
                    startIcon={<SelectAllIcon />}
                    onClick={handleSelectAll}
                    size="small"
                  >
                    {selectAll ? t('common.deselectAll') : t('common.selectAll')}
                  </Button>
                  {selectedImages.size > 0 && (
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadAll(Array.from(selectedImages))}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {t('extract.downloadSelected')}
                    </Button>
                  )}
                </Box>

                <List 
                  sx={{ 
                    maxHeight: 500,
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 1
                  }}
                >
                  {extractedImages.map((image, index) => (
                    <ListItem
                      key={image.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedImages.has(image.id)}
                                onChange={() => handleImageSelect(image.id)}
                              />
                            }
                            label={`${t('extract.image')} ${index + 1}`}
                          />
                          <Chip 
                            label={`${(image.size / 1024).toFixed(1)} KB`}
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        <PreviewImage
                          src={image.url}
                          alt={`${t('extract.image')} ${index + 1}`}
                          onClick={() => handleDownload(image)}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* 状态提示 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {message && !error && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {message}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}