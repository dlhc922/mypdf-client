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
  ArrowForward,
  Security as SecurityIcon,
  MenuBook as GuideIcon,
  Help as HelpIcon,
  QuestionAnswer as FAQIcon,
  VerifiedUser,
  Merge,
  CallSplit,
  Compress
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LanguageShareControls from '../components/LanguageShareControls';
import { featureCategories as importedFeatureCategories, features as importedFeatures } from '../config/featuresConfig';

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

  // 正确插入 script
  useEffect(() => {
    // 动态插入 script
    if (!document.getElementById('wsbn-latest-posts-script')) {
      const script = document.createElement('script');
      script.src = 'https://www.wsbn.tech/blog/embed/latest-posts.js';
      script.id = 'wsbn-latest-posts-script';
      script.async = true;
      script.onload = () => {
        // 脚本加载完成后，手动触发渲染
        if (window.WSBNLatestPosts) {
          window.WSBNLatestPosts.load('wsbn-latest-posts', { limit: 3 });
        }
      };
      document.body.appendChild(script);
    } else {
      // 如果脚本已存在，直接触发渲染
      if (window.WSBNLatestPosts) {
        window.WSBNLatestPosts.load('wsbn-latest-posts', { limit: 3 });
      }
    }
  }, []);

  // Use imported feature categories and features, applying translation
  const featureCategories = useMemo(() => importedFeatureCategories.map(category => ({
    ...category,
    title: t(category.titleKey, category.defaultTitle),
    description: t(category.descriptionKey, category.defaultDescription),
  })), [t, forceUpdate]);

  const features = useMemo(() => importedFeatures.map(feature => ({
    ...feature,
    title: t(feature.titleKey),
    description: t(feature.descriptionKey),
  })), [t, forceUpdate]);

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

      {/* Logo 和导航链接定位于左上角 */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 3 }}>
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
        <Typography
          variant="body1"
          component="a"
          href="https://www.wsbn.tech/blog"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'text.primary',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: '0.9rem',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline'
            }
          }}
        >
          Blog
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

      {/* 功能分类展示 */}
      {featureCategories.map((category) => (
        <Box key={category.id} sx={{ mb: 6 }}>
          {/* 分类标题和描述 */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            px: 2
          }}>
            <Box sx={{
              color: `${category.color}.main`,
              mr: 1.5,
              display: 'flex',
              alignItems: 'center'
            }}>
              {category.icon}
            </Box>
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                {category.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {category.description}
              </Typography>
            </Box>
          </Box>

          {/* 功能卡片网格 */}
          <Grid container spacing={2} sx={{ px: 2 }}>
            {features
              .filter(feature => feature.category === category.id)
              .map((feature) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={feature.path}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    {/* 处理类型标签 */}
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
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: feature.processingType === 'local'
                            ? 'success.main'
                            : 'warning.main'
                        }}
                      />
                      {t(`home.processingType.${feature.processingType}`)}
                    </Box>

                    <CardContent sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      p: { xs: 2, md: 3 }
                    }}>
                      <Box sx={{
                        color: `${featureCategories.find(c => c.id === feature.category)?.color}.main`,
                        mb: 1
                      }}>
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
                        color={featureCategories.find(c => c.id === feature.category)?.color}
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
        </Box>
      ))}

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

      {/* Latest Blog Posts Section */}
      <Box sx={{ my: { xs: 4, md: 6 } }}>
        <div id="wsbn-latest-posts"></div>
      </Box>
    </Container>
  );
}

export default HomePage; 