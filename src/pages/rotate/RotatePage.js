import React, { useState, useEffect } from 'react';
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
  TextField,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Close as CloseIcon,
  Rotate90DegreesCcw,
  Rotate90DegreesCw,
  RotateLeft,
  RotateRight,
  Description as FileIcon,
  Storage as SizeIcon,
  DateRange as DateIcon,
  Pages as PageIcon
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useRotate } from '../../hooks/rotate/useRotate';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function RotatePage() {
  const {
    file,
    rotatedFile,
    loading,
    error,
    message,
    progress,
    rotationAngle,
    setRotationAngle,
    pageRangeType,
    setPageRangeType,
    customPageRange,
    setCustomPageRange,
    selectedPages,
    totalPages,
    updateTotalPages,
    handleFileSelect,
    handleRotate,
    handleDownload,
    setFile,
    setRotatedFile,
    setError,
    setMessage,
    resetState,
    formatFileSize
  } = useRotate();

  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(0.8);

  const { t } = useTranslation();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    updateTotalPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.1));

  const handleClosePDF = () => {
    resetState();
    setNumPages(null);
    setScale(0.8);
  };

  // 旋转角度选项
  const rotationOptions = [
    { value: 90, label: t('rotate.rotate90'), icon: <RotateRight /> },
    { value: 180, label: t('rotate.rotate180'), icon: <RotateRight /> },
    { value: 270, label: t('rotate.rotate270'), icon: <RotateLeft /> }
  ];

  // 页面范围选项
  const pageRangeOptions = [
    { value: 'all', label: t('rotate.allPages') },
    { value: 'even', label: t('rotate.evenPages') },
    { value: 'odd', label: t('rotate.oddPages') },
    { value: 'custom', label: t('rotate.customPages') }
  ];

  return (
    <>
      <Helmet>
        <title>{t('rotate.pageTitle', 'PDF旋转工具')} | {t('appName', 'PDF工具箱')}</title>
        <meta name="description" content={t('rotate.pageDescription')} />
        <meta name="keywords" content="PDF工具,PDF旋转,调整PDF方向,PDF编辑,在线PDF工具,免费,无需上传" />
        <meta property="og:title" content={`${t('rotate.pageTitle')} | ${t('appName')}`} />
        <meta property="og:description" content={t('rotate.pageDescription')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${t('rotate.pageTitle')} | ${t('appName')}`} />
        <meta name="twitter:description" content={t('rotate.pageDescription')} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': `${t('rotate.pageTitle')}`,
            'applicationCategory': 'UtilitiesApplication',
            'operatingSystem': 'Web',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'CNY'
            },
            'description': t('rotate.pageDescription'),
            'featureList': [
              '本地浏览器处理，文件不会上传',
              '支持单页或多页旋转',
              '多种旋转角度选择',
              '完全免费，无需登录',
              '保护文件隐私'
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
                <Typography variant="h6">{t('rotate.title')}</Typography>
                {file && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={t('rotate.zoomOut')}>
                      <IconButton onClick={handleZoomOut} size="small">
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('rotate.zoomIn')}>
                      <IconButton onClick={handleZoomIn} size="small">
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('rotate.closeFile')}>
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

              {/* 没有文件时显示上传区域 */}
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
                    sx={{ mb: 2 }}
                  >
                    {t('rotate.selectFile')}
                    <input 
                      type="file" 
                      hidden 
                      accept="application/pdf" 
                      onChange={handleFileSelect}
                      onClick={(e) => e.target.value = null}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    PDF 文件将在您的浏览器内处理，不会上传到任何服务器
                  </Typography>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'auto',
                    position: 'relative'
                  }}
                >
                  {/* PDF 预览 */}
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      flexGrow: 1
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        width: '100%',
                        textAlign: 'center',
                        mb: 2
                      }}
                    >
                      <Typography>
                        {numPages ? t('common.pageIndicator', { current: numPages, total: numPages }) : ''}
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        height: '700px',
                        width: '100%',
                        overflowY: 'auto',
                        p: 2,
                        border: '1px solid #eee',
                        borderRadius: 1,
                        bgcolor: '#fff',
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#888',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#555',
                        },
                      }}
                    >
                      <Document
                        file={rotatedFile || file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <CircularProgress size={60} sx={{ m: 2 }} />
                        }
                        error={
                          <Typography color="error" sx={{ p: 2 }}>
                            加载PDF文件失败
                          </Typography>
                        }
                      >
                        {Array.from(new Array(numPages), (el, index) => (
                          <Box 
                            key={`page_${index + 1}`}
                            sx={{ 
                              mt: 2, 
                              mb: 4, 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              position: 'relative',
                              border: selectedPages.includes(index + 1) ? '2px solid #1976d2' : '1px solid #ddd',
                              borderRadius: '4px',
                              p: 0.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                              }
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                position: 'absolute', 
                                top: -20, 
                                fontWeight: 'bold',
                                bgcolor: selectedPages.includes(index + 1) ? 'primary.main' : 'rgba(0,0,0,0.6)',
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '4px 4px 0 0',
                              }}
                            >
                              {t('common.pageIndicator', { current: index + 1, total: numPages })}
                            </Typography>
                            <Page
                              pageNumber={index + 1}
                              scale={scale}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                              loading={
                                <CircularProgress size={40} sx={{ m: 2 }} />
                              }
                            />
                          </Box>
                        ))}
                      </Document>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          <DeviceCompatibilityAlert mobileCompatible={true} toolName="PDF旋转"></DeviceCompatibilityAlert>

          {/* 右侧工具栏 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                {t('rotate.settings')}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t('rotate.rotation')}</FormLabel>
                  <RadioGroup
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(parseInt(e.target.value, 10))}
                  >
                    {rotationOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {option.icon}
                            <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ my: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t('rotate.pageRange')}</FormLabel>
                  <RadioGroup
                    value={pageRangeType}
                    onChange={(e) => setPageRangeType(e.target.value)}
                  >
                    {pageRangeOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                {/* 自定义页面范围输入 */}
                {pageRangeType === 'custom' && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t('rotate.customPages')}
                      placeholder={t('rotate.quickSelectPlaceholder')}
                      helperText={t('rotate.quickSelectHelper')}
                      value={customPageRange}
                      onChange={(e) => setCustomPageRange(e.target.value)}
                      disabled={loading || !file || !numPages}
                      sx={{ mb: 1 }}
                    />
                    
                    {/* 选中的页面计数器 */}
                    {selectedPages.length > 0 && (
                      <Chip 
                        label={t('rotate.selectedPages', { count: selectedPages.length })} 
                        color="primary" 
                        size="small"
                        sx={{ my: 1 }}
                      />
                    )}
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                onClick={handleRotate}
                disabled={loading || !file || selectedPages.length === 0}
                sx={{ mb: 2, position: 'relative' }}
              >
                {loading ? (
                  <>
                    <CircularProgress 
                      size={20} 
                      color="inherit" 
                      sx={{ 
                        position: 'absolute',
                        left: 16
                      }} 
                    />
                    {t('rotate.rotationInProgress')}
                  </>
                ) : t('rotate.startRotate')}
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
                    },
                    mb: 2
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

              {rotatedFile && (
                <Button
                  variant="outlined"
                  onClick={() => handleDownload(rotatedFile)}
                  sx={{ mt: 2 }}
                >
                  {t('rotate.download')}
                </Button>
              )}

              {/* 文件信息 */}
              {file && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('rotate.fileInfo.fileName')}: {file.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SizeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                    {numPages && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PageIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {numPages} {t('rotate.fileInfo.pageUnit')}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DateIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
} 