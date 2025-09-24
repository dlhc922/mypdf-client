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

// 简单导入 Document 和 Page，worker 已经在 index.js 中全局配置
import { Document, Page, pdfjs } from 'react-pdf';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState('');
  // 新增状态用于轮询机制
  const [taskId, setTaskId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [pollingTimeout, setPollingTimeout] = useState(null);

  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 在组件加载时检查并确保worker配置正确
  useEffect(() => {
    const currentWorkerSrc = pdfjs.GlobalWorkerOptions.workerSrc;
    console.log('PdfToWordPage: 当前 PDF.js worker 配置:', {
      version: pdfjs.version,
      workerSrc: currentWorkerSrc,
      isLocal: currentWorkerSrc && currentWorkerSrc.startsWith('/'),
      isCDN: currentWorkerSrc && currentWorkerSrc.startsWith('http')
    });

    // 如果worker没有配置，设置默认配置
    if (!currentWorkerSrc) {
      console.warn('PdfToWordPage: Worker 未配置，设置默认配置');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    }
  }, []);

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
      // 清理轮询定时器
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      // 清理超时定时器
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
      }
    };
  }, [fileUrl, resultUrl, pollingInterval, pollingTimeout]);

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

  // 处理 PDF 加载失败 - 改进错误处理并提供worker重配置
  const handleDocumentLoadError = (error) => {
    console.error("PDF 加载失败:", error);
    
    let errorMessage = t('pdfToWord.errors.loadFailed', 'PDF文件加载失败');
    
    // 检查是否是worker相关错误
    if (error.message && (error.message.includes('worker') || error.message.includes('Worker'))) {
      console.warn('检测到 worker 相关错误，尝试重新配置 worker');
      
      // 尝试切换到CDN worker
      const cdnWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc;
      
      console.log('Worker 已切换到 CDN:', cdnWorkerSrc);
      errorMessage = 'PDF处理组件正在重新配置，请稍后重新尝试上传文件。';
      
    } else if (error.message && error.message.includes('Invalid PDF')) {
      errorMessage = 'PDF文件格式无效或已损坏，请选择其他PDF文件。';
    } else if (error.message && error.message.includes('network')) {
      errorMessage = '网络连接问题，请检查网络后重试。';
    }
    
    setError(errorMessage);
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
    // 清理轮询定时器
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    // 清理超时定时器
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      setPollingTimeout(null);
    }
    
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
    setUploadProgress(0);
    setConversionStatus('');
    setTaskId(null);
  };

  // 取消转换
  const handleCancelConversion = () => {
    // 清理轮询定时器
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    // 清理超时定时器
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      setPollingTimeout(null);
    }
    
    setConverting(false);
    setUploadProgress(0);
    setConversionStatus('');
    setTaskId(null);
    setError(null);
    
    console.log('用户取消了转换');
  };

  // 检查转换状态的函数 - 简化版本
  const pollStatus = async (fileId) => {
    const maxAttempts = 60; // 最多等待2分钟
    let attempts = 0;
    
    const poll = async () => {
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`尝试查询状态，第 ${attempts} 次尝试，任务ID: ${fileId}`);
        
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/word/status/${fileId}`,
            {
              withCredentials: true,
              timeout: 10000 // 10秒超时
            }
          );
          
          console.log('转换状态完整响应:', JSON.stringify(response.data, null, 2));
          
          // 根据服务器端建议处理状态
          switch (response.data.status) {
            case 'completed':
              // 转换完成
              console.log('转换状态为 completed');
              let finalDownloadUrl = response.data.downloadUrl;
              if (finalDownloadUrl) {
                if (finalDownloadUrl.startsWith('/')) {
                  finalDownloadUrl = `${process.env.REACT_APP_API_URL}${finalDownloadUrl}`;
                } else if (!finalDownloadUrl.startsWith('http')) {
                  finalDownloadUrl = `${process.env.REACT_APP_API_URL}/${finalDownloadUrl}`;
                }
                setResultUrl(finalDownloadUrl);
                setConversionStatus('转换完成！');
                setActiveStep(2);
                setConverting(false);
                console.log('转换完成，下载链接:', finalDownloadUrl);
              } else {
                console.log('转换完成，但未获取到下载链接');
                setError('转换完成，但未获取到下载链接');
                setConverting(false);
              }
              return true;
              
            case 'failed':
              // 转换失败
              console.log('转换状态为 failed');
              setError(response.data.message || '转换失败');
              setConverting(false);
              return true;
              
            case 'converting':
            case 'queued':
              // 显示不确定进度条 + 状态消息
              console.log(`转换状态为 ${response.data.status}，等待2秒后继续轮询`);
              setConversionStatus(response.data.message || '正在转换中...');
              await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
              break;
              
            default:
              // 未知状态，继续轮询
              console.log(`未知状态: ${response.data.status}，等待2秒后继续轮询`);
              setConversionStatus('正在转换中...');
              await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
              break;
          }
        } catch (error) {
          console.error('状态查询出错:', error);
          if (attempts < maxAttempts) {
            console.log(`状态查询失败，等待2秒后进行第 ${attempts + 1} 次尝试`);
            setConversionStatus('网络连接中...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
          } else {
            console.log('达到最大尝试次数，网络错误');
            setError('网络错误，请检查连接');
            setConverting(false);
            return true;
          }
        }
      }
      
      // 达到最大尝试次数
      console.log('达到最大尝试次数，转换超时');
      setError('转换超时，请重试');
      setConverting(false);
      return true;
    };
    
    // 开始轮询
    console.log('开始状态轮询，任务ID:', fileId);
    return await poll();
  };

  // 转换PDF到Word - 使用轮询机制避免超时
  const convertPdfToWord = async () => {
    if (!file) return;
    
    try {
      setConverting(true);
      setError(null);
      setUploadProgress(0);
      setConversionStatus('准备转换...');
      
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
          timeout: 30000, // 30秒上传超时
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log('上传进度:', percentCompleted + '%');
            setUploadProgress(percentCompleted);
          }
        }
      );

      console.log('服务器响应:', response.data);

      // 检查响应格式，支持两种模式：
      // 1. 直接返回下载链接（小文件，快速处理）
      // 2. 返回任务ID（大文件，需要轮询）
      
      let downloadUrl = null;
      let receivedTaskId = null;
      
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
      
      // 检查是否有任务ID
      if (response.data.fileId) {
        receivedTaskId = response.data.fileId;
      } else if (response.data.taskId) {
        receivedTaskId = response.data.taskId;
      } else if (response.data.id) {
        receivedTaskId = response.data.id;
      }
      
      // 如果有直接下载链接，立即处理
      if (downloadUrl) {
        // 确保下载链接是完整的URL
        if (downloadUrl.startsWith('/')) {
          downloadUrl = `${process.env.REACT_APP_API_URL}${downloadUrl}`;
        } else if (!downloadUrl.startsWith('http')) {
          downloadUrl = `${process.env.REACT_APP_API_URL}/${downloadUrl}`;
        }
        
        setResultUrl(downloadUrl);
        setUploadProgress(100);
        setConversionStatus('转换完成！');
        setActiveStep(2);
        setConverting(false);
        console.log('快速转换完成，下载链接:', downloadUrl);
        return;
      }
      
      // 如果有任务ID，开始轮询
      if (receivedTaskId) {
        setTaskId(receivedTaskId);
        console.log('开始轮询任务状态，任务ID:', receivedTaskId);
        
        await pollStatus(receivedTaskId);
        return;
      }
      
      // 如果既没有下载链接也没有任务ID，抛出错误
      throw new Error('服务器响应格式异常，未获取到下载链接或任务ID');

    } catch (err) {
      console.error('转换失败:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = err.response?.data?.message || err.message || '转换失败';
      
      // 特殊处理超时错误
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接或稍后重试';
      }
      
      setError(errorMessage);
      setConverting(false);
      
      // 清理轮询定时器
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      // 清理超时定时器
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
        setPollingTimeout(null);
      }
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
            variant='outlined'
            onClick={activeStep === 0 ? undefined : handleBack}
            sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
            disabled={converting}
          >
            {t('common.back', '返回')}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {converting && (
              <Button
                variant='outlined'
                color='error'
                onClick={handleCancelConversion}
              >
                {t('common.cancel', '取消')}
              </Button>
            )}
            
            {!converting && (
              <Button
                variant='contained'
                color='primary'
                onClick={activeStep === 0 ? (file ? handleNext : undefined) : convertPdfToWord}
                disabled={(activeStep === 0 && !file) || converting}
                endIcon={converting ? undefined : <ArrowForward />}
              >
                {converting ? t('pdfToWord.converting', '转换中...') : 
                activeStep === 0 ? t('pdfToWord.next', '继续') : t('pdfToWord.convert', '立即转换')}
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* 转换进度指示器 */}
      {converting && (
        <Box sx={{ width: '100%', mb: 2 }}>
          {uploadProgress < 100 ? (
            <>
              <LinearProgress 
                variant='determinate'
                value={uploadProgress} 
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant='body2' align='center'>
                {Math.round(uploadProgress)}% {t('pdfToWord.uploading', '上传中...')}
              </Typography>
            </>
          ) : (
            <>
              <LinearProgress 
                variant='indeterminate'
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant='body2' align='center'>
                {conversionStatus || t('pdfToWord.converting', '转换中...')}
              </Typography>
            </>
          )}
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