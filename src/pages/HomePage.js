import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Merge, Create, CallSplit, Compress } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t, i18n } = useTranslation();

  const features = [
    {
      title: t('home.features.stamp.title'),
      description: t('home.features.stamp.description'),
      icon: <Create sx={{ fontSize: 40 }} />,
      path: '/stamp'
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
    }
  ];

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8, position: 'relative' }}>
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

      {/* 语言切换按钮定位于右上角 */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Button 
          variant={i18n.language === 'zh' ? 'contained' : 'outlined'} 
          onClick={() => handleChangeLanguage('zh')}
          size="small"
          sx={{ mr: 1 }}
        >
          中文
        </Button>
        <Button 
          variant={i18n.language === 'en' ? 'contained' : 'outlined'} 
          onClick={() => handleChangeLanguage('en')}
          size="small"
        >
          English
        </Button>
      </Box>
      
      <Typography 
          variant="h4" 
          align="center" 
          component="h1" 
          sx={{ 
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
            mb: 6
          }}
        >
          {t('home.appTitle')}
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={6} key={feature.path}>
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
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {feature.description}
                </Typography>
                <Button
                  component={Link}
                  to={feature.path}
                  variant="contained"
                  color="primary"
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