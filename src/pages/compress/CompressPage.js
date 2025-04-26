import React, { useState } from 'react';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  Button,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Close as CloseIcon,
  Description as FileIcon,
  Storage as SizeIcon,
  DateRange as DateIcon,
  Pages as PageIcon
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useCompress } from '../../hooks/compress/useCompress';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function CompressPage() {
  const {
    file,
    compressedFile,
    loading,
    error,
    message,
    quality,
    setQuality,
    handleFileSelect,
    handleCompress,
    handleDownload,
    setFile,
    setCompressedFile,
    setError,
    setMessage,
    formatFileSize,
    progress
  } = useCompress();

  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(0.8); // 增大初始预览大小

  const { t } = useTranslation();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.1));

  const handleClosePDF = () => {
    setFile(null);
    setCompressedFile(null);
    setNumPages(null);
    setScale(0.8);
    setError(null);
    setMessage(null);
  };

  return (
    <>
      <Helmet>
        <title>{t('compress.pageTitle', '免费PDF压缩工具 - 本地处理无需上传 安全私密')} | {t('appName', 'PDF工具箱')}</title>
        <meta name="description" content={t('compress.pageDescription', '100%免费在线PDF压缩工具。在浏览器中本地减小PDF文件大小，无需上传，完全保护隐私。在保持质量的同时减小文件体积，简单易用。')} />
        <meta name="keywords" content="免费PDF压缩,本地处理,无需上传,减小PDF大小,PDF工具,优化PDF,安全压缩PDF,在线PDF处理,安全" />
        <meta property="og:title" content={`${t('compress.pageTitle', '免费PDF压缩工具 - 本地处理无需上传 安全私密')} | ${t('appName', 'PDF工具箱')}`} />
        <meta property="og:description" content={t('compress.pageDescription', '100%免费在线PDF压缩工具。在浏览器中本地减小PDF文件大小，无需上传，完全保护隐私。在保持质量的同时减小文件体积，简单易用。')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${t('compress.pageTitle', '免费PDF压缩工具 - 本地处理无需上传 安全私密')} | ${t('appName', 'PDF工具箱')}`} />
        <meta name="twitter:description" content={t('compress.pageDescription', '100%免费在线PDF压缩工具。在浏览器中本地减小PDF文件大小，无需上传，完全保护隐私。在保持质量的同时减小文件体积，简单易用。')} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': `${t('compress.pageTitle', '免费PDF压缩工具 - 本地处理无需上传 安全私密')}`,
            'applicationCategory': 'UtilitiesApplication',
            'operatingSystem': 'Web',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'CNY'
            },
            'description': t('compress.pageDescription', '100%免费在线PDF压缩工具。在浏览器中本地减小PDF文件大小，无需上传，完全保护隐私。在保持质量的同时减小文件体积，简单易用。'),
            'featureList': [
              '100%免费使用，无隐藏费用',
              '本地浏览器处理，文件不会上传',
              '支持多种压缩级别',
              '保持文档质量',
              '完全保护文件隐私和安全'
            ],
            'browserRequirements': 'requires JavaScript support',
            'softwareVersion': '1.0'
          })}
        </script>
      </Helmet>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* 左侧预览区域 */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '600px',
                position: 'relative'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6">{t('compress.title')}</Typography>
                {file && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="关闭文件">
                      <IconButton 
                        onClick={handleClosePDF}
                        size="small"
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {!file ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    p: 3
                  }}
                >
                  <Button 
                    variant="contained" 
                    component="label"
                  >
                    {t('compress.selectFile')}
                    <input 
                      type="file" 
                      hidden 
                      accept="application/pdf" 
                      onChange={handleFileSelect}
                      onClick={(e) => e.target.value = null}
                    />
                  </Button>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  {/* 文件预览卡片 */}
                  <Paper
                    elevation={3}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 3,
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                      mb: 3,
                      width: '280px',  // 固定宽度
                      mx: 'auto'       // 水平居中
                    }}
                  >
                    {/* PDF 缩略图 */}
                    <Box
                      sx={{
                        width: '220px',  // 略微增加宽度
                        height: '311px',  // 保持 A4 比例
                        bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        borderRadius: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                      >
                        <Page
                          pageNumber={1}
                          width={220}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      </Document>
                    </Box>

                    {/* 文件信息 */}
                    <Box 
                      sx={{ 
                        mt: 3,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500,
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {file.name}
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',  // 改为垂直排列
                          gap: 1,
                          color: 'text.secondary',
                          mt: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SizeIcon fontSize="small" />
                          <Typography variant="body2">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PageIcon fontSize="small" />
                          <Typography variant="body2">
                            {numPages} {t('compress.fileInfo.pageUnit')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DateIcon fontSize="small" />
                          <Typography variant="body2">
                            {new Date(file.lastModified).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>
          <DeviceCompatibilityAlert mobileCompatible={true} toolName="PDF压缩"></DeviceCompatibilityAlert>

          {/* 右侧工具栏 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                {t('compress.settings')}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Typography gutterBottom>
                  {t('compress.quality')}: {quality}%
                </Typography>
                <Slider
                  value={quality}
                  onChange={(_, newValue) => setQuality(newValue)}
                  min={10}
                  max={100}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleCompress}
                disabled={loading || !file}
                sx={{ mb: 2, position: 'relative' }}
              >
                {loading ? (
                  <CircularProgress 
                    size={20} 
                    color="inherit" 
                    sx={{ 
                      position: 'absolute',
                      left: 16
                    }} 
                  />
                ) : t('compress.startCompress')}
              </Button>

              {loading && (
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                    }
                  }}
                />
              )}

              {error && (
                <Typography 
                  color="error" 
                  sx={{ mt: 2 }}
                >
                  {error}
                </Typography>
              )}

              {message && (
                <Typography 
                  color="success.main"
                  sx={{ mt: 2 }}
                >
                  {message}
                </Typography>
              )}

              {compressedFile && (
                <Button
                  variant="outlined"
                  onClick={() => handleDownload(compressedFile)}
                  sx={{ mt: 2 }}
                >
                  {t('compress.download')}
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
} 