import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs,
  Link as MuiLink,
  Tabs,
  Tab,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Link,
  useParams,
  useLocation
} from 'react-router-dom';
import { 
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lightbulb as TipIcon,
  VerifiedUser,
  Merge,
  CallSplit,
  Compress,
  Image as ImageIcon,
  Gesture,
  CompareArrows
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function GuidesPage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 获取URL参数
  const { toolId } = useParams();
  const location = useLocation();

  // 工具指南数据 - 使用useMemo和翻译函数
  const guides = useMemo(() => [
    {
      id: 'stamp',
      title: t('home.guides.stamp'),
      icon: <VerifiedUser />,
      steps: [
        t('guides.stamp.steps.step1', '上传您的PDF文件，点击"选择PDF文件"'),
        t('guides.stamp.steps.step2', '上传印章图片或创建透明印章'),
        t('guides.stamp.steps.step3', '调整印章大小、位置和角度'),
        t('guides.stamp.steps.step4', '选择要应用印章的页面'),
        t('guides.stamp.steps.step5', '点击"添加印章"处理您的PDF'),
        t('guides.stamp.steps.step6', '下载盖章后的PDF')
      ],
      tips: [
        t('guides.stamp.tips.tip1', '使用带透明度的PNG图片可获得更清晰的印章效果'),
        t('guides.stamp.tips.tip2', '对于非透明图片，可以使用我们的"制作透明印章"工具'),
        t('guides.stamp.tips.tip3', '大多数文档建议的印章尺寸为30-50mm')
      ],
      faqs: [
        {
          question: t('guides.stamp.faqs.q1', '支持哪些印章图片格式？'),
          answer: t('guides.stamp.faqs.a1', '我们的工具支持PNG、JPEG等常见图片格式。带透明度的PNG格式效果最佳。')
        },
        {
          question: t('guides.stamp.faqs.q2', '有文件大小限制吗？'),
          answer: t('guides.stamp.faqs.a2', '由于所有处理都在您的浏览器中完成，文件大小限制取决于您设备的内存。通常，100MB以内的文件处理效果良好。')
        }
      ]
    },
    {
      id: 'merge',
      title: t('home.guides.merge'),
      icon: <Merge />,
      steps: [
        t('guides.merge.steps.step1', '点击"添加文件"选择多个PDF文件'),
        t('guides.merge.steps.step2', '拖动调整文件顺序（如需要）'),
        t('guides.merge.steps.step3', '点击"合并"组合文件'),
        t('guides.merge.steps.step4', '下载合并后的PDF')
      ],
      tips: [
        t('guides.merge.tips.tip1', '确保所有PDF页面大小相似，以获得最佳外观'),
        t('guides.merge.tips.tip2', '一次最多可合并20个文件以获得最佳性能')
      ],
      faqs: [
        {
          question: t('guides.merge.faqs.q1', '合并后的PDF会保留书签和链接吗？'),
          answer: t('guides.merge.faqs.a1', '是的，我们的合并工具会保留原始文档中的大多数PDF功能，包括书签、链接和表单字段。')
        },
        {
          question: t('guides.merge.faqs.q2', '可以合并受密码保护的PDF吗？'),
          answer: t('guides.merge.faqs.a2', '目前，我们的工具不支持合并受密码保护的PDF。请在上传前移除密码保护。')
        }
      ]
    },
    {
      id: 'split',
      title: t('home.guides.split'),
      icon: <CallSplit />,
      steps: [
        t('guides.split.steps.step1', '上传您的PDF文件'),
        t('guides.split.steps.step2', '选择范围选择或自定义选择'),
        t('guides.split.steps.step3', '定义页面范围（例如：1-3, 5, 7-9）'),
        t('guides.split.steps.step4', '点击"开始拆分"'),
        t('guides.split.steps.step5', '下载每个拆分后的PDF文件')
      ],
      tips: [
        t('guides.split.tips.tip1', '使用预览确认页面选择后再拆分'),
        t('guides.split.tips.tip2', '对于复杂的拆分，可以添加多个范围选择')
      ],
      faqs: [
        {
          question: t('guides.split.faqs.q1', '可以将PDF拆分为单页文件吗？'),
          answer: t('guides.split.faqs.a1', '是的，您可以通过为每个页面创建单独的范围或使用自定义选择选项将PDF拆分为单页文件。')
        }
      ]
    },
    {
      id: 'compress',
      title: t('home.guides.compress'),
      icon: <Compress />,
      steps: [
        t('guides.compress.steps.step1', '上传您的PDF文件'),
        t('guides.compress.steps.step2', '选择压缩质量级别'),
        t('guides.compress.steps.step3', '点击"开始压缩"'),
        t('guides.compress.steps.step4', '下载压缩后的PDF文件')
      ],
      tips: [
        t('guides.compress.tips.tip1', '对于主要包含文本的文档，可以选择较高的压缩率'),
        t('guides.compress.tips.tip2', '对于包含高质量图像的文档，选择中等压缩以保持图像质量')
      ],
      faqs: [
        {
          question: t('guides.compress.faqs.q1', '压缩会影响PDF的质量吗？'),
          answer: t('guides.compress.faqs.a1', '压缩会根据选择的级别略微降低图像质量，但文本通常不受影响。您可以选择适合您需求的压缩级别。')
        },
        {
          question: t('guides.compress.faqs.q2', '有最大文件大小限制吗？'),
          answer: t('guides.compress.faqs.a2', '由于处理在浏览器中进行，大文件可能需要更多时间和内存。建议文件大小不超过100MB。')
        }
      ]
    },
    {
      id: 'sign',
      title: "如何在PDF上添加签名",
      icon: <Gesture />,
      steps: [
        "上传您的PDF文件",
        "创建新签名（手写、文本或上传图片）",
        "调整签名大小和位置",
        "点击PDF页面添加签名",
        "下载签名后的PDF"
      ],
      tips: [
        "使用手写模式可以创建更个性化的签名",
        "您可以保存多个签名以便将来使用",
        "签名图片支持透明背景，效果更好"
      ],
      faqs: [
        {
          question: "签名是否安全？",
          answer: "所有签名处理都在您的浏览器中本地完成，不会上传到服务器，确保您的签名安全。"
        },
        {
          question: "可以在一个文档中添加多个签名吗？",
          answer: "是的，您可以在PDF文档的不同位置添加多个签名。"
        }
      ]
    },
    {
      id: 'extract',
      title: "如何从PDF提取图片",
      icon: <ImageIcon />,
      steps: [
        "上传您的PDF文件",
        "点击'提取图片'按钮",
        "选择您想要保存的图片",
        "点击'保存选中'下载图片"
      ],
      tips: [
        "提取的图片质量取决于PDF中的原始图片质量",
        "某些嵌入式或特殊格式的图片可能无法提取"
      ],
      faqs: [
        {
          question: "可以提取的图片格式有哪些？",
          answer: "工具可以提取大多数常见的图片格式，包括JPEG、PNG、GIF等。"
        },
        {
          question: "如果PDF中没有图片会怎样？",
          answer: "如果PDF中没有可提取的图片，工具会显示提示信息告知您没有找到图片。"
        }
      ]
    },
    {
      id: 'compare',
      title: "如何比较两个PDF文件",
      icon: <CompareArrows />,
      steps: [
        "上传原始PDF文件",
        "上传修改后的PDF文件",
        "点击'比较PDF文件'按钮",
        "查看比较结果，高亮显示的部分表示差异",
        "可以下载比较结果PDF"
      ],
      tips: [
        "确保两个PDF文件具有相似的结构以获得最佳比较结果",
        "使用全屏模式可以更清晰地查看差异"
      ],
      faqs: [
        {
          question: "比较工具能识别哪些类型的差异？",
          answer: "我们的比较工具可以识别文本更改、添加或删除的内容，以及图像和格式的变化。"
        },
        {
          question: "比较大型文档需要多长时间？",
          answer: "比较时间取决于文档大小和复杂度。大型文档可能需要几分钟时间。"
        }
      ]
    }
  ], [t]);

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

  // 根据URL参数设置活动标签并滚动到顶部
  useEffect(() => {
    // 首先滚动到页面顶部
    window.scrollTo(0, 0);
    
    // 检查是否有工具ID参数
    if (toolId) {
      // 查找匹配的工具索引
      const toolIndex = guides.findIndex(guide => guide.id === toolId);
      if (toolIndex !== -1) {
        setActiveTab(toolIndex);
      }
    } else {
      // 检查路径中是否包含工具ID
      const pathParts = location.pathname.split('/');
      const pathToolId = pathParts[pathParts.length - 1];
      if (pathToolId && pathToolId !== 'guides') {
        const toolIndex = guides.findIndex(guide => guide.id === pathToolId);
        if (toolIndex !== -1) {
          setActiveTab(toolIndex);
        }
      }
    }
  }, [toolId, location.pathname, guides]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Helmet>
        <title>{t('appName')} - {t('guides.pageTitle', '使用指南')}</title>
        <meta name="description" content={t('guides.pageDescription', '详细的PDF工具使用指南，包括PDF盖章、合并、拆分、压缩等功能的步骤说明。')} />
      </Helmet>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink 
          component={Link} 
          to="/" 
          color="inherit" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('tools.home')}
        </MuiLink>
        <Typography color="text.primary">{t('guides.pageTitle', '使用指南')}</Typography>
      </Breadcrumbs>
      
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 4 }}
      >
        {t('guides.pageTitle', '使用指南')}
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        sx={{ mb: 4 }}
      >
        {t('guides.subtitle', '通过这些详细的步骤说明，了解如何有效使用我们的PDF工具。')}
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {guides.map((guide, index) => (
            <Tab 
              key={`${guide.id}-${forceUpdate}`} 
              label={guide.title} 
              icon={guide.icon} 
              iconPosition="start"
              sx={{ 
                minHeight: { xs: 48, md: 72 },
                py: { xs: 1, md: 2 }
              }}
            />
          ))}
        </Tabs>
        
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {guides.map((guide, index) => (
            <Box 
              key={`${guide.id}-content-${forceUpdate}`} 
              role="tabpanel"
              hidden={activeTab !== index}
              id={`guide-tabpanel-${index}`}
              aria-labelledby={`guide-tab-${index}`}
            >
              {activeTab === index && (
                <Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main',
                      mb: 3
                    }}
                  >
                    {guide.icon}
                    <Box component="span" sx={{ ml: 1 }}>{guide.title}</Box>
                  </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {t('guides.stepsTitle', '使用步骤')}
                      </Typography>
                      <List>
                        {guide.steps.map((step, stepIndex) => (
                          <ListItem key={stepIndex}>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={`${t('guides.step', '步骤')} ${stepIndex + 1}: ${step}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <TipIcon color="primary" sx={{ mr: 1 }} />
                          {t('guides.tipsTitle', '使用技巧')}
                        </Typography>
                        <List>
                          {guide.tips.map((tip, tipIndex) => (
                            <ListItem key={tipIndex}>
                              <ListItemText primary={tip} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      
                      <Divider sx={{ mb: 3 }} />
                      
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <InfoIcon color="primary" sx={{ mr: 1 }} />
                          {t('guides.faqsTitle', '常见问题')}
                        </Typography>
                        {guide.faqs.map((faq, faqIndex) => (
                          <Box key={faqIndex} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {faq.question}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {faq.answer}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <MuiLink 
                      component={Link} 
                      to={`/${guide.id}`}
                      variant="contained"
                      color="primary"
                      sx={{ 
                        display: 'inline-block',
                        py: 1,
                        px: 3,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 1,
                        textDecoration: 'none',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    >
                      {t('guides.useToolNow', '立即使用')} {guide.title.replace(t('guides.howTo', '如何'), '')}
                    </MuiLink>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('guides.localProcessingTitle', '所有工具都在本地处理')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('guides.localProcessingDescription', '我们的所有PDF工具都在您的浏览器中本地处理文件，不会将您的文件上传到任何服务器。这确保了您的数据隐私和安全。无需注册，无需等待上传和下载，处理速度更快。')}
        </Typography>
      </Box>
    </Container>
  );
}

export default GuidesPage; 