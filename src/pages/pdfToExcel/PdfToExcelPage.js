// client/src/pages/pdfToExcel/PdfToExcelPage.js
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
  CircularProgress
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
  FileCopy
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import FileUploadArea from '../../components/FileUploadArea';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { PdfToExcelProvider, usePdfToExcelContext } from '../../contexts/PdfToExcelContext';

function PdfToExcelContent() {
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
    resultUrl,
    progress,
    handleFileChange,
    convertPdfToExcel,
    handleCleanup
  } = usePdfToExcelContext();
  
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
    if (resultUrl && !converting && activeStep === 1) {
      setActiveStep(2);
    }
  }, [resultUrl, converting, activeStep]);

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

  // 下载转换后的文件
  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `${file.name.replace('.pdf', '')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 步骤标题
  const steps = [
    t('pdfToExcel.steps.select', '选择文件'),
    t('pdfToExcel.steps.preview', '预览PDF'),
    t('pdfToExcel.steps.download', '下载Excel')
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
          {t('pdfToExcel.uploadPrompt', '选择或拖放PDF文件到这里')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('pdfToExcel.uploadDescription', '拖放文件或点击下方按钮选择文件')}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleBrowseClick}
          sx={{ mt: 1 }}
        >
          {t('pdfToExcel.browseFiles', '浏览文件')}
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
        <title>{t('pdfToExcel.pageTitle', 'PDF转Excel')} | {t('appName', 'PDF工具箱')}</title>
        <meta name="description" content={t('pdfToExcel.metaDescription', '在线将PDF文件转换为Excel电子表格。提取表格数据，便于编辑和分析。')} />
      </Helmet>

      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          {t('pdfToExcel.title', 'PDF转Excel电子表格')}
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary"
          sx={{ maxWidth: '700px', mx: 'auto', px: 2 }}
        >
          {t('pdfToExcel.description', '提取PDF中的表格数据转换为Excel电子表格，便于编辑和数据分析。')}
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
              {t('pdfToExcel.maxFileSize', '最大文件大小：50MB')}
            </Typography>
          </Box>
        )}

        {/* 步骤 2: PDF 预览 */}
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
                        {t('pdfToExcel.errors.loadFailed', '无法加载PDF文件。请确保文件格式正确。')}
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

        {/* 步骤 3: 下载结果 */}
        {activeStep === 2 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              py: 4,
              flexGrow: 1,
              textAlign: 'center'
            }}
          >
            <Box 
              sx={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Check sx={{ fontSize: 60, color: 'white' }} />
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {t('pdfToExcel.conversionSuccess', '转换完成！')}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('pdfToExcel.documentReady', '您的Excel电子表格已准备好下载')}
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{ mt: 2, minWidth: '200px' }}
            >
              {t('pdfToExcel.downloadFile', '下载Excel电子表格')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FileCopy />}
              onClick={handleReset}
              sx={{ mt: 2 }}
            >
              {t('pdfToExcel.convertAnother', '转换另一个PDF')}
            </Button>
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
            onClick={activeStep === 0 ? (file ? handleNext : undefined) : convertPdfToExcel}
            disabled={(activeStep === 0 && !file) || converting}
            endIcon={converting ? undefined : <ArrowForward />}
          >
            {converting ? t('pdfToExcel.converting', '转换中...') : 
            activeStep === 0 ? t('pdfToExcel.next', '继续') : t('pdfToExcel.convert', '立即转换')}
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
            {Math.round(progress)}% {t('pdfToExcel.processing', '处理中...')}
          </Typography>
        </Box>
      )}

      {/* 帮助信息 */}
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('pdfToExcel.aboutConversion.title', '关于PDF转Excel转换')}
        </Typography>
        
        <Typography variant="body2" component="div">
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>{t('pdfToExcel.aboutConversion.tables', '我们的转换器能够识别和提取PDF中的表格数据。')}</li>
            <li>{t('pdfToExcel.aboutConversion.editable', '转换后的Excel文件可在Microsoft Excel或其他电子表格软件中完全编辑。')}</li>
            <li>{t('pdfToExcel.aboutConversion.complex', '复杂的表格结构可能无法完美转换，可能需要进一步调整。')}</li>
          </ul>
        </Typography>
      </Paper>

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

function PdfToExcelPage() {
  return (
    <PdfToExcelProvider>
      <PdfToExcelContent />
    </PdfToExcelProvider>
  );
}

export default PdfToExcelPage;