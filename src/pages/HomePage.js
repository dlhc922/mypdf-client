import React from 'react';
import { Helmet } from 'react-helmet';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { VerifiedUser, Gesture, Merge, CallSplit, Compress, Image as ImageIcon, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LanguageShareControls from '../components/LanguageShareControls';

function HomePage() {
  const { t, i18n } = useTranslation();

  const features = [
    {
      title: t('home.features.stamp.title'),
      description: t('home.features.stamp.description'),
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      path: '/stamp'
    },
    {
      title: t('home.features.sign.title'),
      description: t('home.features.sign.description'),
      icon: <Gesture sx={{ fontSize: 40 }} />,
      path: '/sign'
    },
    {
      title: t('home.features.merge.title'),
      description: t('home.features.merge.description'),
      icon: <Merge sx={{ fontSize: 40 }} />,
      path: '/merge'
    },
    {
      title: t('home.features.split.title'),
      description: t('home.features.split.description'),
      icon: <CallSplit sx={{ fontSize: 40 }} />,
      path: '/split'
    },
    {
      title: t('home.features.compress.title'),
      description: t('home.features.compress.description'),
      icon: <Compress sx={{ fontSize: 40 }} />,
      path: '/compress'
    },
    {
      title: t('home.features.extract.title'),
      description: t('home.features.extract.description'),
      icon: <ImageIcon sx={{ fontSize: 40 }} />,
      path: '/extract'
    },
    {
      title: t('home.features.imageToPdf.title'),
      description: t('home.features.imageToPdf.description'),
      icon: <ImageIcon sx={{ fontSize: 40 }} />,
      path: '/image-to-pdf'
    }
  ];

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8, position: 'relative' }}>
      <Helmet>
        {/* 根据当前语言动态设置 lang 属性和 meta 信息 */}
        <html lang={i18n.language} />
        <title>{t('home.appTitle')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta property="og:title" content={t('meta.ogTitle')} />
        <meta property="og:description" content={t('meta.ogDescription')} />
        <meta property="og:image" content={t('meta.ogImage')} />
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

      {/* 语言切换和分享按钮（与 Header 中相同） */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageShareControls />
      </Box>
      
      <Typography 
        variant="h4" 
        align="center" 
        component="h1" 
        sx={{ 
          color: 'primary.main',
          textDecoration: 'none',
          fontWeight: 'bold',
          mb: 2
        }}
      >
        {t('home.appTitle')}
      </Typography>

      <Typography 
        variant="subtitle1" 
        align="center" 
        sx={{ 
          mb: 6,
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box 
          component="span" 
          sx={{ 
            px: 2,
            py: 0.5,
            fontSize: '0.95rem',
            opacity: 0.85,
          }}
        >
          {t('home.privacyHint')}
        </Box>
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.path}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h6" component="h2">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" paragraph variant="body2">
                  {feature.description}
                </Typography>
                <Button
                  component={Link}
                  to={feature.path}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {t('home.startUsing')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HomePage; 