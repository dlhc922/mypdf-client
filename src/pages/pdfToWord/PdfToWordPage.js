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

// 简单导入 Document 和 Page，worker 已经在 index.js 中配置
import { Document, Page } from 'react-pdf';
// 不要重复配置 worker
// import { pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = '...';

function PdfToWordPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // 状态管理
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [fileUrl, resultUrl]);

  // 处理文件选择
  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setCurrentPage(1);
      setNumPages(null);
      setError(null);
      setLoading(true); // 开始加载 PDF
      // 文件选择后自动进入预览步骤
      setActiveStep(1);
    } else if (selectedFile) {
      setError(t('pdfToWord.errors.pdfOnly', '请选择PDF文件'));
    }
  };

  // 处理 PDF 加载完成
  const handleDocumentLoadSuccess = ({ numPages }) => {
    console.log("PDF 加载成功，总页数:", numPages);
    setNumPages(numPages);
    setLoading(false);
  };

  // 处理 PDF 加载失败
  const handleDocumentLoadError = (error) => {
    console.error("PDF 加载失败:", error);
    setError(t('pdfToWord.errors.loadFailed', 'PDF文件加载失败，请确保文件格式正确'));
    setLoading(false);
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
    setFile(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setCurrentPage(1);
    setNumPages(null);
    setZoom(1.0);
    setError(null);
    setProgress(0);
  };

  // 转换PDF到Word - 使用 axios
  const convertPdfToWord = async () => {
    if (!file) return;
    
    try {
      setConverting(true);
      setError(null);
      setProgress(0);
      
      const formData = new FormData();
      formData.append('pdf', file);  // 使用服务器期望的字段名 'pdf'
      
      console.log('准备上传文件:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/convert/pdf-to-word`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('上传进度:', percentCompleted + '%');
            setProgress(percentCompleted);
          }
        }
      );

      console.log('服务器响应:', response.data);

      // 检查不同格式的下载链接字段
      let downloadUrl = null;
      
      if (response.data.downloadUrl) {
        downloadUrl = response.data.downloadUrl;
      } else if (response.data.download_url) {
        downloadUrl = response.data.download_url;
      } else if (response.data.url) {
        downloadUrl = response.data.url;
      } else if (typeof response.data === 'string') {
        // 如果响应直接是字符串形式的URL
        downloadUrl = response.data;
      }
      
      // 确保下载链接是完整的URL
      if (downloadUrl) {
        // 如果是相对路径，添加服务器基础URL
        if (downloadUrl.startsWith('/')) {
          downloadUrl = `${process.env.REACT_APP_API_URL}${downloadUrl}`;
        } else if (!downloadUrl.startsWith('http')) {
          downloadUrl = `${process.env.REACT_APP_API_URL}/${downloadUrl}`;
        }
        
        setResultUrl(downloadUrl);
        setProgress(100);
        setActiveStep(2);
        console.log('最终下载链接:', downloadUrl);
      } else {
        throw new Error('未获取到下载链接');
      }

    } catch (err) {
      console.error("转换失败:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = err.response?.data?.message || err.message || '转换失败';
      setError(errorMessage);
    } finally {
      setConverting(false);
    }
  };

  // 下载转换后的文件
  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `${file.name.replace('.pdf', '')}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 步骤标题
  const steps = [
    t('pdfToWord.steps.select', '选择文件'),
    t('pdfToWord.steps.preview', '预览PDF'),
    t('pdfToWord.steps.download', '下载Word')
  ];

  // 直接打开文件选择对话框的函数
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 原始的 FileUploadArea 可能不工作，创建一个简单的替代方案
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
          {t('pdfToWord.uploadPrompt', '选择或拖放PDF文件到这里')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {'拖放文件或点击下方按钮选择文件'}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleBrowseClick}
          sx={{ mt: 1 }}
        >
          {t('pdfToWord.browseFiles', '浏览文件')}
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
        <title>{t('pdfToWord.pageTitle', 'PDF转Word')} | {t('appName', 'PDF工具箱')}</title>
        <meta name="description" content={t('pdfToWord.metaDescription', '在线将PDF文件转换为可编辑的Word文档。免费、快速、安全。')} />
        <meta name="keywords" content="PDF转Word,PDF转换器,在线转换,文档处理,格式转换,免费工具" />
        <meta property="og:title" content={`${t('pdfToWord.pageTitle', 'PDF转Word')} | ${t('appName', 'PDF工具箱')}`} />
        <meta property="og:description" content={t('pdfToWord.metaDescription', '在线将PDF文件转换为可编辑的Word文档。免费、快速、安全。')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/images/pdf-to-word-thumbnail.png" />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('pdfToWord.pageTitle', 'PDF转Word')} | ${t('appName', 'PDF工具箱')}`} />
        <meta name="twitter:description" content={t('pdfToWord.metaDescription', '在线将PDF文件转换为可编辑的Word文档。免费、快速、安全。')} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "PDF转Word工具",
            "applicationCategory": "DocumentApplication",
            "operatingSystem": "Web",
            "description": "将PDF文件转换为可编辑的Word文档，保留原始格式",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            },
            "featureList": [
              "保留原始格式和布局",
              "在线免费转换",
              "快速处理",
              "支持表格和图像"
            ]
          })}
        </script>
      </Helmet>

      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          {t('pdfToWord.title', 'PDF转Word文档')}
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary"
          sx={{ maxWidth: '700px', mx: 'auto', px: 2 }}
        >
          {t('pdfToWord.description', '将PDF文件转换为完全可编辑的Word文档。保留格式、表格和图像，便于编辑。')}
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
              {t('pdfToWord.maxFileSize', '最大文件大小：50MB')}
            </Typography>
          </Box>
        )}

        {/* 步骤 2: PDF 预览 - 修改为显示所有页面 */}
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
                        无法加载PDF文件。请确保文件格式正确。
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
              {t('pdfToWord.conversionSuccess', '转换完成！')}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('pdfToWord.documentReady', '您的Word文档已准备好下载')}
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{ mt: 2, minWidth: '200px' }}
            >
              {t('pdfToWord.downloadFile', '下载Word文档')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FileCopy />}
              onClick={handleReset}
              sx={{ mt: 2 }}
            >
              {t('pdfToWord.convertAnother', '转换另一个PDF')}
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
            onClick={activeStep === 0 ? (file ? handleNext : undefined) : convertPdfToWord}
            disabled={(activeStep === 0 && !file) || converting}
            endIcon={converting ? undefined : <ArrowForward />}
          >
            {converting ? t('pdfToWord.converting', '转换中...') : 
            activeStep === 0 ? t('pdfToWord.next', '继续') : t('pdfToWord.convert', '立即转换')}
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
            {Math.round(progress)}% {t('pdfToWord.processing', '处理中...')}
          </Typography>
        </Box>
      )}

      {/* 帮助信息 */}
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('pdfToWord.aboutConversion.title', '关于PDF转Word转换')}
        </Typography>
        
        <Typography variant="body2" component="div">
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>{t('pdfToWord.aboutConversion.quality', '我们的转换器尽可能保留文本、格式和图像。')}</li>
            <li>{t('pdfToWord.aboutConversion.editable', '转换后的Word文档可在Microsoft Word或其他文字处理软件中完全编辑。')}</li>
            <li>{t('pdfToWord.aboutConversion.formatting', '复杂的布局或特殊的PDF功能可能无法完美转换。')}</li>
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

export default PdfToWordPage; 