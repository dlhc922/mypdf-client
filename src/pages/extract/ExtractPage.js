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
  Alert,
  Divider
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Download as DownloadIcon,
  Image as ImageIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PhotoLibrary as PhotoLibraryIcon
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useExtract } from '../../hooks/extract/useExtract';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';
import { Helmet } from 'react-helmet-async';

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
    <>
      <Helmet>
        <title>{t('extract.seoTitle', 'PDF图片提取工具 - 一键提取PDF中的所有图片 | 免费在线工具')}</title>
        <meta name="description" content={t('extract.seoDescription', '免费在线PDF图片提取工具，快速从PDF文档中提取所有图片。支持各种格式图片，本地处理无需上传，保护隐私安全。提取后可按原始格式单独保存和使用。')} />
        <meta name="keywords" content={t('extract.seoKeywords', 'PDF图片提取,提取PDF图片,PDF提取器,PDF图片导出,PDF图片分离,PDF工具,图片提取')} />
        <meta property="og:title" content={t('extract.seoTitle', 'PDF图片提取工具 - 一键提取PDF中的所有图片 | 免费在线工具')} />
        <meta property="og:description" content={t('extract.seoDescription', '免费在线PDF图片提取工具，快速从PDF文档中提取所有图片。支持各种格式图片，本地处理无需上传，保护隐私安全。提取后可按原始格式单独保存和使用。')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': t('extract.seoTitle', 'PDF图片提取工具 - 一键提取PDF中的所有图片'),
            'url': window.location.href.split('?')[0],
            'applicationCategory': 'UtilitiesApplication',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'CNY'
            },
            'description': t('extract.seoDescription', '免费在线PDF图片提取工具，快速从PDF文档中提取所有图片。支持各种格式图片，本地处理无需上传，保护隐私安全。提取后可按原始格式单独保存和使用。'),
            'operatingSystem': 'Web',
            'browserRequirements': 'Requires JavaScript. Requires HTML5.'
          })}
        </script>
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {t('extract.pageTitle', 'PDF 图片提取工具')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, maxWidth: '800px', mx: 'auto' }}>
            {t('extract.pageSubtitle', '快速从PDF文档中提取所有图片，并以原始格式保存。支持JPG、PNG等多种图片格式。')}
          </Typography>
          <Divider sx={{ mt: 2, mb: 3 }} />
        </Box>
        
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h1" gutterBottom color="primary.main" fontWeight="bold">
                  {t('extract.preview')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('extract.description', '从PDF文件中提取所有图片，无需复杂软件。支持各种格式的图片，提取后可单独保存。')}
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
                    startIcon={loading ? <CircularProgress size={20} /> : <PhotoLibraryIcon />}
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
              <Typography variant="h6" component="h2" gutterBottom color="primary.main" fontWeight="medium">
                {t('extract.extractedImages')}
                {extractedImages.length > 0 && (
                  <Chip 
                    label={extractedImages.length}
                    size="small"
                    color="primary"
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
                        variant="contained"
                        color="success"
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
    </>
  );
}