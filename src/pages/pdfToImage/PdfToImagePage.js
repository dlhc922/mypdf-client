// client/src/pages/pdfToImage/PdfToImagePage.js
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Backdrop,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import { 
  CloudUpload, 
  Download, 
  Refresh, 
  ArrowBack, 
  ArrowForward,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  Check,
  Article,
  FileCopy,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Document, Page } from 'react-pdf';
import { PdfToImageProvider, usePdfToImageContext } from '../../contexts/PdfToImageContext';

function PdfToImageContent() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    file,
    fileUrl,
    loading,
    converting,
    error,
    imageUrls,
    progress,
    totalPages,
    imageFormat,
    imageQuality,
    resolution,
    handleFileChange,
    handleCleanup,
    convertPdfToImage,
    downloadAllImages,
    downloadSingleImage,
    setImageFormat,
    setImageQuality,
    setResolution
  } = usePdfToImageContext();
  
  const [activeStep, setActiveStep] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1.0);
  
  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 文件选择后自动进入预览步骤
  useEffect(() => {
    if (file && activeStep === 0) {
      setActiveStep(1);
    }
  }, [file, activeStep]);

  // 转换成功后自动进入下载步骤
  useEffect(() => {
    if (imageUrls.length > 0 && !converting && activeStep === 1) {
      setActiveStep(2);
    }
  }, [imageUrls, converting, activeStep]);

  // 处理 PDF 加载完成
  const handleDocumentLoadSuccess = ({ numPages }) => {
    console.log("PDF 加载成功，总页数:", numPages);
    setNumPages(numPages);
  };

  // 处理 PDF 加载失败
  const handleDocumentLoadError = (error) => {
    console.error("PDF 加载失败:", error);
  };

  // 放大预览
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2.0));
  };

  // 缩小预览
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.6));
  };

  // 重置缩放
  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // 前进到下一步
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // 返回上一步
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // 重置整个流程
  const handleReset = () => {
    setActiveStep(0);
    handleCleanup();
    setNumPages(null);
    setZoom(1.0);
  };

  // 步骤标题
  const steps = [
    t('pdfToImage.steps.select', '选择文件'),
    t('pdfToImage.steps.preview', '预览PDF'),
    t('pdfToImage.steps.download', '下载图片')
  ];

  // 直接打开文件选择对话框的函数
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 简单的文件上传组件
  const SimpleFileUpload = () => (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: '600px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          width: '100%',
          '&:hover': {
            borderColor: 'primary.light',
            bgcolor: 'rgba(0, 0, 0, 0.01)'
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          style={{ display: 'none' }}
        />
        
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          <Article sx={{ fontSize: 60, opacity: 0.7 }} />
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {t('pdfToImage.uploadPrompt', '选择或拖放PDF文件到这里')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('pdfToImage.uploadDescription', '拖放文件或点击下方按钮选择文件')}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleBrowseClick}
          sx={{ mt: 1 }}
        >
          {t('pdfToImage.browseFiles', '浏览文件')}
        </Button>
      </Paper>
    </Box>
  );

  // 渲染所有PDF页面的函数
  const renderAllPages = () => {
    if (!numPages) return null;
    
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <Box key={`page_container_${i}`} sx={{ mb: 2, position: 'relative' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 4, 
              right: 4, 
              bgcolor: 'rgba(0, 0, 0, 0.5)', 
              color: 'white', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1 
            }}
          >
            {i} / {numPages}
          </Typography>
          <Page 
            key={`page_${i}`}
            pageNumber={i} 
            scale={zoom}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={isMobile ? undefined : isTablet ? 450 : 600}
          />
        </Box>
      );
    }
    
    return pages;
  };

  // 转换设置面板
  const ConversionSettings = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('pdfToImage.settings.title', '转换设置')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="image-format-label">
              {t('pdfToImage.settings.format', '图片格式')}
            </InputLabel>
            <Select
              labelId="image-format-label"
              value={imageFormat}
              onChange={(e) => setImageFormat(e.target.value)}
              label={t('pdfToImage.settings.format', '图片格式')}
            >
              <MenuItem value="png">PNG (无损)</MenuItem>
              <MenuItem value="jpeg">JPEG (有损)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {imageFormat === 'jpeg' && (
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>
              {t('pdfToImage.settings.quality', '图片质量')}: {imageQuality * 100}%
            </Typography>
            <Slider
              value={imageQuality}
              onChange={(_, value) => setImageQuality(value)}
              min={0.1}
              max={1.0}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
          </Grid>
        )}
        
        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            {t('pdfToImage.settings.resolution', '分辨率')}: {resolution}x
          </Typography>
          <Slider
            value={resolution}
            onChange={(_, value) => setResolution(value)}
            min={0.5}
            max={3.0}
            step={0.25}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}x`}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, md: 4 }, 
        px: { xs: 1, md: 2 },
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Helmet>
        <title>{t('pdfToImage.pageTitle', 'PDF转图片')} | {t('appName', 'PDF工具箱')}</title>
        <meta name="description" content={t('pdfToImage.metaDescription', '在线将PDF文件转换为图片格式。支持PNG、JPEG格式，可调整分辨率和质量。')} />
      </Helmet>

      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          {t('pdfToImage.title', 'PDF转图片')}
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary"
          sx={{ maxWidth: '700px', mx: 'auto', px: 2 }}
        >
          {t('pdfToImage.description', '将PDF文件转换为高质量图片格式，支持PNG和JPEG。')}
        </Typography>
      </Box>

      {/* 步骤指示器 */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ mb: 4, px: { xs: 0, sm: 2 } }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* 主要内容区域 */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 步骤 1: 文件选择 */}
        {activeStep === 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1
            }}
          >
            <SimpleFileUpload />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%', maxWidth: '500px' }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              {t('pdfToImage.maxFileSize', '最大文件大小：50MB')}
            </Typography>
          </Box>
        )}

        {/* 步骤 2: PDF 预览和转换设置 */}
        {activeStep === 1 && file && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2, 
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {file.name} ({Math.round(file.size / 1024 / 1024 * 10) / 10} MB)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={t('common.zoomOut', '缩小')}>
                  <IconButton size="small" onClick={handleZoomOut}>
                    <ZoomOut />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={t('common.resetZoom', '重置缩放')}>
                  <IconButton size="small" onClick={handleResetZoom}>
                    <RotateLeft />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={t('common.zoomIn', '放大')}>
                  <IconButton size="small" onClick={handleZoomIn}>
                    <ZoomIn />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* 转换设置 */}
            <ConversionSettings />
            
            {/* PDF 预览区域 - 显示所有页面 */}
            <Box 
              ref={pdfContainerRef}
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto',  // 添加滚动条
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1,
                p: 2,
                minHeight: '300px',
                maxHeight: '600px' // 可以设置最大高度，确保滚动条出现
              }}
            >
              {fileUrl && (
                <Document
                  file={fileUrl}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                  loading={
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  }
                  error={
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="error">
                        {t('pdfToImage.errors.loadFailed', '无法加载PDF文件。请确保文件格式正确。')}
                      </Typography>
                    </Box>
                  }
                >
                  {renderAllPages()}
                </Document>
              )}
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}

        {/* 步骤 3: 图片预览和下载 */}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                {t('pdfToImage.convertedImages', '已转换的图片')} ({imageUrls.length})
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={downloadAllImages}
              >
                {t('pdfToImage.downloadAll', '下载全部图片')}
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {imageUrls.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={image.url}
                        alt={`Page ${image.pageNumber}`}
                        sx={{ 
                          height: 200, 
                          objectFit: 'contain',
                          bgcolor: 'grey.100'
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 4, 
                          right: 4, 
                          bgcolor: 'rgba(0, 0, 0, 0.5)', 
                          color: 'white', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1 
                        }}
                      >
                        {t('pdfToImage.page', '页面')} {image.pageNumber}
                      </Typography>
                    </Box>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<Download />}
                        onClick={() => downloadSingleImage(image.url, image.pageNumber)}
                        fullWidth
                      >
                        {t('pdfToImage.download', '下载')}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<FileCopy />}
                onClick={handleReset}
              >
                {t('pdfToImage.convertAnother', '转换另一个PDF')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* 底部按钮区域 */}
      {activeStep !== 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? undefined : handleBack}
            sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
          >
            {t('common.back', '返回')}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === 0 ? (file ? handleNext : undefined) : convertPdfToImage}
            disabled={(activeStep === 0 && !file) || converting}
            endIcon={converting ? undefined : <ArrowForward />}
          >
            {converting ? t('pdfToImage.converting', '转换中...') : 
            activeStep === 0 ? t('pdfToImage.next', '继续') : t('pdfToImage.convert', '立即转换')}
          </Button>
        </Box>
      )}

      {/* 转换进度指示器 */}
      {converting && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            {Math.round(progress)}% {t('pdfToImage.processing', '处理中...')}
            {progress > 0 && progress < 100 && totalPages > 0 && (
              ` (${Math.ceil((progress / 100) * totalPages)}/${totalPages} ${t('pdfToImage.pages', '页')})`
            )}
          </Typography>
        </Box>
      )}

      {/* 帮助信息 */}
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('pdfToImage.aboutConversion.title', '关于PDF转图片')}
        </Typography>
        
        <Typography variant="body2" component="div">
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>{t('pdfToImage.aboutConversion.quality', '生成高质量的图片，保留PDF文档的所有视觉元素。')}</li>
            <li>{t('pdfToImage.aboutConversion.formats', '支持PNG格式（无损，适合文本和线条）和JPEG格式（有损压缩，适合照片）。')}</li>
            <li>{t('pdfToImage.aboutConversion.resolution', '可调整分辨率以满足不同需要，高分辨率适合打印，低分辨率适合屏幕查看。')}</li>
            <li>{t('pdfToImage.aboutConversion.local', '所有转换在您的浏览器本地完成，文件不会上传到服务器，保证隐私安全。')}</li>
          </ul>
        </Typography>
      </Paper>

      {/* // client/src/pages/pdfToImage/PdfToImagePage.js (续)
      {/* 全屏加载指示器 */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading || converting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}

function PdfToImagePage() {
  return (
    <PdfToImageProvider>
      <PdfToImageContent />
    </PdfToImageProvider>
  );
}

export default PdfToImagePage;