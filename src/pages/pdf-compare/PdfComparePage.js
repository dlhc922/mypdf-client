import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Divider,
  useMediaQuery,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  FileUpload as UploadIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { usePdfCompare } from '../../hooks/pdf-compare/usePdfCompare';
import PdfViewer from '../../components/pdf-compare/PdfViewer';
import DifferenceViewer from '../../components/pdf-compare/DifferenceViewer';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

function PdfComparePage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef(null);
  
  const {
    originalPdf,
    modifiedPdf,
    comparisonResult,
    loading,
    error,
    message,
    zoom,
    handleOriginalPdfUpload,
    handleModifiedPdfUpload,
    handleRemoveOriginalPdf,
    handleRemoveModifiedPdf,
    handleComparePdfs,
    handleZoomIn,
    handleZoomOut,
    handleDownloadComparisonPdf,
    resetComparisonResult
  } = usePdfCompare();

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 处理全屏切换
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (fullscreenContainerRef.current.requestFullscreen) {
        fullscreenContainerRef.current.requestFullscreen();
      } else if (fullscreenContainerRef.current.webkitRequestFullscreen) {
        fullscreenContainerRef.current.webkitRequestFullscreen();
      } else if (fullscreenContainerRef.current.msRequestFullscreen) {
        fullscreenContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // 处理原始PDF拖放
  const handleOriginalDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleOriginalDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    handleOriginalPdfUpload(files);
  }, [handleOriginalPdfUpload]);

  // 处理修改后PDF拖放
  const handleModifiedDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleModifiedDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    handleModifiedPdfUpload(files);
  }, [handleModifiedPdfUpload]);

  // 文件选择处理
  const handleOriginalFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleOriginalPdfUpload(files);
  };

  const handleModifiedFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleModifiedPdfUpload(files);
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 } }}>
      <Helmet>
        <title>{t('pdfCompare.seoTitle', 'PDF文件比对工具 - 快速识别文档差异 | 在线免费对比PDF文件')}</title>
        <meta name="description" content={t('pdfCompare.seoDescription', '免费在线PDF比对工具，快速准确地比较两个PDF文件的差异并高亮显示不同之处。本地处理，无需上传，保护隐私安全。支持文本、图像和格式差异对比。')} />
        <meta name="keywords" content={t('pdfCompare.seoKeywords', 'PDF比对,PDF对比,PDF比较,PDF文件比较,文档对比,差异检测,PDF变更查找,文件对比工具')} />
        <meta property="og:title" content={t('pdfCompare.seoTitle', 'PDF文件比对工具 - 快速识别文档差异 | 在线免费对比PDF文件')} />
        <meta property="og:description" content={t('pdfCompare.seoDescription', '免费在线PDF比对工具，快速准确地比较两个PDF文件的差异并高亮显示不同之处。本地处理，无需上传，保护隐私安全。支持文本、图像和格式差异对比。')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': t('pdfCompare.seoTitle', 'PDF文件比对工具 - 快速识别文档差异'),
            'url': window.location.href.split('?')[0],
            'applicationCategory': 'UtilitiesApplication',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'CNY'
            },
            'description': t('pdfCompare.seoDescription', '免费在线PDF比对工具，快速准确地比较两个PDF文件的差异并高亮显示不同之处。本地处理，无需上传，保护隐私安全。支持文本、图像和格式差异对比。'),
            'operatingSystem': 'Web',
            'browserRequirements': 'Requires JavaScript. Requires HTML5.',
            'featureList': [
              '识别两个PDF文件之间的文本差异',
              '高亮显示添加、删除和修改的内容',
              '本地处理，确保文件安全',
              '支持图像对比和格式变化检测',
              '可下载比较结果'
            ]
          })}
        </script>
      </Helmet>

      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}
      >
        {t('pdfCompare.title') || "PDF文件比对工具"}
      </Typography>

      <Typography 
        variant="subtitle1" 
        align="center" 
        color="text.secondary" 
        gutterBottom
        sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
      >
        {t('pdfCompare.subtitle') || "快速准确地比较两个PDF文件，识别并高亮显示所有文本、图像和格式差异，让文档对比变得简单高效"}
      </Typography>

      <DeviceCompatibilityAlert mobileCompatible={true} toolName="PDF比对"></DeviceCompatibilityAlert>

      <Grid container spacing={3}>
        {/* 原始PDF上传区域 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('pdfCompare.originalPdf') || "原始PDF文件"}
            </Typography>
            
            {!originalPdf ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                onDragOver={handleOriginalDragOver}
                onDrop={handleOriginalDrop}
                onClick={() => document.getElementById('original-pdf-upload').click()}
              >
                <input
                  type="file"
                  id="original-pdf-upload"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleOriginalFileSelect}
                />
                <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {t('pdfCompare.dropOriginalPdf') || "拖放原始PDF文件到这里或点击上传"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('pdfCompare.onlyPdfSupported') || "仅支持PDF格式"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <FileIcon color="primary" sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" noWrap title={originalPdf.name}>
                      {originalPdf.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(originalPdf.size)}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={handleRemoveOriginalPdf}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
                
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {originalPdf && (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon sx={{ mr: 1, fontSize: 16 }} />
                      {t('pdfCompare.fileReady') || "文件已就绪，请上传第二个PDF文件进行比较"}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* 修改后PDF上传区域 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('pdfCompare.modifiedPdf') || "修改后PDF文件"}
            </Typography>
            
            {!modifiedPdf ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                onDragOver={handleModifiedDragOver}
                onDrop={handleModifiedDrop}
                onClick={() => document.getElementById('modified-pdf-upload').click()}
              >
                <input
                  type="file"
                  id="modified-pdf-upload"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleModifiedFileSelect}
                />
                <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {t('pdfCompare.dropModifiedPdf') || "拖放修改后PDF文件到这里或点击上传"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('pdfCompare.onlyPdfSupported') || "仅支持PDF格式"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <FileIcon color="primary" sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" noWrap title={modifiedPdf.name}>
                      {modifiedPdf.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(modifiedPdf.size)}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={handleRemoveModifiedPdf}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
                
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {modifiedPdf && (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon sx={{ mr: 1, fontSize: 16 }} />
                      {t('pdfCompare.fileReady') || "文件已就绪，请上传第一个PDF文件进行比较"}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* 比较按钮 */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CompareIcon />}
          disabled={!originalPdf || !modifiedPdf || loading}
          onClick={handleComparePdfs}
          sx={{ px: 4, py: 1.5 }}
        >
          {loading 
            ? (t('pdfCompare.comparing') || "正在比较...") 
            : (t('pdfCompare.comparePdfs') || "比较PDF文件")}
        </Button>
      </Box>
      
      {/* 错误和消息提示 */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
      
      {message && !error && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {message}
        </Alert>
      )}
      
      {/* 比较结果区域 */}
      {comparisonResult && (
        <Paper 
          elevation={3} 
          sx={{ mt: 4, overflow: 'hidden' }}
          ref={fullscreenContainerRef}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
            >
              <Tab 
                label={t('pdfCompare.comparisonTab') || "比较结果"} 
                disabled={!comparisonResult}
                icon={<CompareIcon />}
                iconPosition="start"
              />
              <Tab 
                label={t('pdfCompare.originalTab') || "原始文档"} 
                disabled={!originalPdf}
                icon={<FileIcon />}
                iconPosition="start"
              />
              <Tab 
                label={t('pdfCompare.modifiedTab') || "修改后文档"} 
                disabled={!modifiedPdf}
                icon={<FileIcon />}
                iconPosition="start"
              />
            </Tabs>
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={1}>
                <Tooltip title={t('pdfCompare.zoomIn') || "放大"}>
                  <span>
                    <IconButton onClick={handleZoomIn} disabled={!originalPdf && !modifiedPdf && !comparisonResult}>
                      <ZoomInIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('pdfCompare.zoomOut') || "缩小"}>
                  <span>
                    <IconButton onClick={handleZoomOut} disabled={!originalPdf && !modifiedPdf && !comparisonResult}>
                      <ZoomOutIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  {Math.round(zoom * 100)}%
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={1}>
                {comparisonResult && (
                  <Tooltip title={t('pdfCompare.downloadComparison') || "下载比较结果"}>
                    <IconButton onClick={handleDownloadComparisonPdf} color="primary">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={isFullscreen ? (t('pdfCompare.exitFullscreen') || "退出全屏") : (t('pdfCompare.enterFullscreen') || "全屏查看")}>
                  <IconButton onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ 
            height: isFullscreen ? 'calc(100vh - 120px)' : '70vh', 
            overflow: 'auto',
            bgcolor: '#f5f5f5'
          }}>
            {activeTab === 0 && comparisonResult && (
              <DifferenceViewer 
                comparisonResult={comparisonResult} 
                zoom={zoom}
              />
            )}
            
            {activeTab === 1 && originalPdf && (
              <PdfViewer file={originalPdf} zoom={zoom} />
            )}
            
            {activeTab === 2 && modifiedPdf && (
              <PdfViewer file={modifiedPdf} zoom={zoom} />
            )}
          </Box>
        </Paper>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('pdfCompare.howItWorks') || '工作原理'}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('pdfCompare.howItWorksDescription') || 
            '本工具使用先进的PDF比较算法，分析两个PDF文件的内容、布局和格式差异。系统会识别文本更改、添加或删除的内容，以及图像和格式的变化，并在比较结果中用不同颜色高亮显示这些差异。'}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('pdfCompare.privacyNote') || 
            '注意：所有处理都在您的浏览器中完成，文件不会上传到服务器，确保您的数据隐私和安全。'}
        </Typography>
      </Box>
    </Container>
  );
}

export default PdfComparePage; 