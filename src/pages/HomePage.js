import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import { 
  Link 
} from 'react-router-dom';
import { 
  VerifiedUser, 
  Gesture, 
  Merge, 
  CallSplit, 
  Compress, 
  Image as ImageIcon, 
  ArrowForward,
  CompareArrows,
  Security as SecurityIcon,
  MenuBook as GuideIcon,
  Help as HelpIcon,
  QuestionAnswer as FAQIcon,
  Description,
  TableChart,
  Info,
  LocalLibrary,
  CloudQueue,
  Code
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LanguageShareControls from '../components/LanguageShareControls';

function HomePage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // 当语言变化时强制重新渲染组件
  const [forceUpdate, setForceUpdate] = React.useState(0);
  
  // 监听语言变化
  useEffect(() => {
    const handleLanguageChanged = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const features = useMemo(() => [
    {
      title: t('home.features.stamp.title'),
      description: t('home.features.stamp.description'),
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      path: '/stamp',
      processingType: 'local'
    },
    {
      title: t('home.features.sign.title'),
      description: t('home.features.sign.description'),
      icon: <Gesture sx={{ fontSize: 40 }} />,
      path: '/sign',
      processingType: 'local'
    },
    {
      title: t('home.features.merge.title'),
      description: t('home.features.merge.description'),
      icon: <Merge sx={{ fontSize: 40 }} />,
      path: '/merge',
      processingType: 'local'
    },
    {
      title: t('home.features.split.title'),
      description: t('home.features.split.description'),
      icon: <CallSplit sx={{ fontSize: 40 }} />,
      path: '/split',
      processingType: 'local'
    },
    {
      title: t('home.features.compress.title'),
      description: t('home.features.compress.description'),
      icon: <Compress sx={{ fontSize: 40 }} />,
      path: '/compress',
      processingType: 'local'
    },
    {
      title: t('home.features.extract.title'),
      description: t('home.features.extract.description'),
      icon: <ImageIcon sx={{ fontSize: 40 }} />,
      path: '/extract',
      processingType: 'local'
    },
    {
      title: t('home.features.imageToPdf.title'),
      description: t('home.features.imageToPdf.description'),
      icon: <ImageIcon sx={{ fontSize: 40 }} />,
      path: '/image-to-pdf',
      processingType: 'local'
    },
    {
      title: t('home.features.pdfCompare.title'),
      description: t('home.features.pdfCompare.description'),
      icon: <CompareArrows sx={{ fontSize: 40 }} />,
      path: '/pdf-compare',
      processingType: 'local'
    },
    {
      title: t('home.features.pdfToWord.title'),
      description: t('home.features.pdfToWord.description'),
      icon: <Description sx={{ fontSize: 40 }} />,
      path: '/pdf-to-word',
      processingType: 'server'
    },
    {
      title: t('home.features.pdfToExcel.title', 'PDF转Excel'),
      description: t('home.features.pdfToExcel.description', '提取PDF中的表格数据转换为Excel电子表格，便于编辑和数据分析。'),
      icon: <TableChart sx={{ fontSize: 40 }} />, // 使用表格图标
      path: '/pdf-to-excel',
      processingType: 'server' // 标记为服务器处理
    },
    {
      title: t('home.features.pdfToImage.title', 'PDF转图片'),
      description: t('home.features.pdfToImage.description', '将PDF文件转换为图片格式(PNG、JPEG)，可自定义分辨率。'),
      icon: <ImageIcon sx={{ fontSize: 40 }} />,
      path: '/pdf-to-image',
      processingType: 'local' // 这是本地处理功能
    },
    {
      title: t('home.features.documentToMarkdown.title', 'PDF转Markdown'),
      description: t('home.features.documentToMarkdown.description', '将PDF、Word等文档转换为Markdown格式，适用于编写文档、博客和技术文章。'),
      icon: <Code sx={{ fontSize: 40 }} />,
      path: '/document-to-markdown',
      processingType: 'server'
    }
  ], [t]);

  // 常用工具使用说明链接 - 使用翻译
  const quickGuides = useMemo(() => [
    {
      title: t('home.guides.stamp'),
      path: "/guides/stamp",
      icon: <VerifiedUser fontSize="small" />
    },
    {
      title: t('home.guides.merge'),
      path: "/guides/merge",
      icon: <Merge fontSize="small" />
    },
    {
      title: t('home.guides.split'),
      path: "/guides/split",
      icon: <CallSplit fontSize="small" />
    },
    {
      title: t('home.guides.compress'),
      path: "/guides/compress",
      icon: <Compress fontSize="small" />
    }
  ], [t]);

  // 常见问题链接 - 使用翻译
  const commonFaqs = useMemo(() => [
    {
      question: t('home.faq.free'),
      path: "/faq#free"
    },
    {
      question: t('home.faq.security'),
      path: "/faq#security"
    },
    {
      question: t('home.faq.mobile'),
      path: "/faq#mobile"
    },
    {
      question: t('home.faq.fileSize'),
      path: "/faq#size-limit"
    }
  ], [t]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: 'relative' }}>
      <Helmet>
        {/* 根据当前语言动态设置 lang 属性和 meta 信息 */}
        <html lang={i18n.language} />
        <title>{t('appName')} - {t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta property="og:title" content={t('meta.ogTitle')} />
        <meta property="og:description" content={t('meta.ogDescription')} />
        <meta property="og:image" content={t('meta.ogImage')} />
        <meta name="keywords" content={t('meta.keywords')} />
        
        {/* 添加结构化数据 */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "${t('appName')}",
              "applicationCategory": "WebApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "${t('meta.description')}"
            }
          `}
        </script>
      </Helmet>
      
      {/* Logo 定位于左上角 */}
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ 
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          WSBN.tech
        </Typography>
      </Box>

      {/* 语言切换和分享按钮 */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageShareControls />
      </Box>
      
      {/* 添加一个顶部空间，确保标题不会与顶部元素重叠 */}
      <Box sx={{ height: { xs: 60, md: 20 } }} />
      
      <Typography 
        variant="h4" 
        align="center" 
        component="h1" 
        sx={{ 
          color: 'primary.main',
          textDecoration: 'none',
          fontWeight: 'bold',
          mb: 2,
          fontSize: { xs: '1.75rem', md: '2.125rem' }
        }}
      >
        {t('home.appTitle')}
      </Typography>

      <Typography 
        variant="subtitle1" 
        align="center" 
        sx={{ 
          mb: { xs: 2, md: 3 },
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2
        }}
      >
        <Box 
          component="span" 
          sx={{ 
            py: 0.5,
            fontSize: { xs: '0.875rem', md: '0.95rem' },
            opacity: 0.85,
          }}
        >
        
        </Box>
      </Typography>

      {/* 处理方式简要说明 - 与功能卡片样式一致 */}
      <Box sx={{ 
        mb: { xs: 3, md: 4 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'center',
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1.5,
          width: '100%',
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 'medium',
            bgcolor: 'success.light',
            color: 'success.contrastText'
          }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 0.5 }} />
            {t('home.processingType.local', '本地处理')}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('home.processingInfo.localShort', '文件仅在您的浏览器中处理，确保数据隐私与安全')}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1.5,
          width: '100%',
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 'medium',
            bgcolor: 'warning.light',
            color: 'warning.contrastText'
          }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', mr: 0.5 }} />
            {t('home.processingType.server', '云端处理')}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('home.processingInfo.serverShort', '文件加密传输至服务器处理，提供高级功能，处理后立即删除')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} justifyContent="flex-start" sx={{ px: 2 }}>
        {features.map((feature) => (
          <Grid 
            item 
            xs={6}   // 手机端保持每行2个
            sm={4}   // 平板端每行3个
            md={2.4} // 桌面端每行5个 (12/5=2.4)
            key={feature.path}
            sx={{
              flexBasis: 'calc(20% - 16px)', // 精确控制5列布局
              maxWidth: 'calc(20% - 16px)',
              transition: 'all 0.3s',
              // 响应式调整
              [theme.breakpoints.down('md')]: {
                flexBasis: '33.33%',
                maxWidth: '33.33%'
              },
              [theme.breakpoints.down('sm')]: {
                flexBasis: '50%',
                maxWidth: '50%'
              }
            }}
          >
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  borderRadius: '12px',
                  px: 1,
                  py: 0.25,
                  fontSize: '0.7rem',
                  fontWeight: 'medium',
                  backgroundColor: feature.processingType === 'local' 
                    ? 'success.light' 
                    : 'warning.light',
                  color: feature.processingType === 'local' 
                    ? 'success.contrastText' 
                    : 'warning.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  zIndex: 1
                }}
              >
                {feature.processingType === 'local' ? (
                  <>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    {t('home.processingType.local', '本地处理')}
                  </>
                ) : (
                  <>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    {t('home.processingType.server', '云端处理')}
                  </>
                )}
              </Box>

              <CardContent sx={{ 
                flexGrow: 1, 
                textAlign: 'center',
                p: { xs: 2, md: 3 }
              }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {feature.icon}
                </Box>
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component="h2"
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    mb: { xs: 0.5, md: 1 }
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  color="text.secondary" 
                  paragraph 
                  variant="body2"
                  sx={{ 
                    mb: 1.5,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {feature.description}
                </Typography>
                <Button
                  component={Link}
                  to={feature.path}
                  variant="contained"
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 'auto' }}
                >
                  {t('home.startUsing')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* 使用指南和FAQ部分 */}
      <Grid container spacing={3} sx={{ mt: { xs: 3, md: 6 } }}>
        {/* 使用指南部分 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: { xs: 2, md: 3 }, 
              height: '100%',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GuideIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                {t('home.quickGuides.title')}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box component="ul" sx={{ 
              listStyle: 'none', 
              p: 0, 
              m: 0,
              '& li': { 
                mb: 1.5 
              }
            }}>
              {quickGuides.map((guide, index) => (
                <Box 
                  component="li" 
                  key={`guide-${index}-${forceUpdate}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ 
                    mr: 1.5, 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {guide.icon}
                  </Box>
                  <Typography 
                    component={Link} 
                    to={guide.path}
                    variant="body1"
                    sx={{ 
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {guide.title}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/guides" 
                variant="outlined" 
                color="primary"
                endIcon={<ArrowForward />}
                size={isMobile ? "small" : "medium"}
              >
                {t('home.quickGuides.viewAll')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* FAQ部分 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: { xs: 2, md: 3 }, 
              height: '100%',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FAQIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                {t('home.faqSection.title')}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box component="ul" sx={{ 
              listStyle: 'none', 
              p: 0, 
              m: 0,
              '& li': { 
                mb: 1.5 
              }
            }}>
              {commonFaqs.map((faq, index) => (
                <Box 
                  component="li" 
                  key={`faq-${index}-${forceUpdate}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ 
                    mr: 1.5, 
                    color: 'primary.main',
                    pt: 0.5
                  }}>
                    <HelpIcon fontSize="small" />
                  </Box>
                  <Typography 
                    component={Link} 
                    to={faq.path}
                    variant="body1"
                    sx={{ 
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {faq.question}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/faq" 
                variant="outlined" 
                color="primary"
                endIcon={<ArrowForward />}
                size={isMobile ? "small" : "medium"}
              >
                {t('home.faqSection.viewAll')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Privacy and Security Section */}
      <Paper 
        elevation={1}
        sx={{ 
          my: { xs: 4, md: 6 }, 
          p: { xs: 2, md: 4 }, 
          bgcolor: 'background.paper', 
          borderRadius: 2 
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          align="center" 
          sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('home.privacy.title')}
        </Typography>
        
        <Typography 
          variant="body1" 
          paragraph 
          align="center"
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          {t('home.privacy.description')}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {t('home.privacy.noRegistration.title')}
              </Typography>
              <Typography variant="body2">
                {t('home.privacy.noRegistration.description')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {t('home.privacy.localProcessing.title')}
              </Typography>
              <Typography variant="body2">
                {t('home.privacy.localProcessing.description')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {t('home.privacy.noStorage.title')}
              </Typography>
              <Typography variant="body2">
                {t('home.privacy.noStorage.description')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default HomePage; 