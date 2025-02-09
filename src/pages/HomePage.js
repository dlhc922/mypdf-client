import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Merge, Create } from '@mui/icons-material';

function HomePage() {
  const features = [
    {
      title: 'PDF 合并',
      description: '将多个 PDF 文件合并为一个文件',
      icon: <Merge sx={{ fontSize: 40 }} />,
      path: '/merge'
    },
    {
      title: 'PDF 盖章',
      description: '在 PDF 文件上添加电子印章',
      icon: <Create sx={{ fontSize: 40 }} />,
      path: '/stamp'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        PDF 工具箱
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.path}>
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
                <Box sx={{ color: '#e91e63', mb: 2 }}>
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
                  sx={{ 
                    bgcolor: '#e91e63',
                    '&:hover': {
                      bgcolor: '#c2185b'
                    }
                  }}
                >
                  开始使用
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