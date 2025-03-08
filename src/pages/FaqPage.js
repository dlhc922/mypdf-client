import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Box, 
  Container, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Link,
  useLocation,
  useParams
} from 'react-router-dom';
import { 
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  QuestionAnswer as FAQIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function FaqPage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [forceUpdate, setForceUpdate] = useState(0);
  const location = useLocation();
  
  // 获取URL中的问题ID
  const { questionId } = useParams();
  const hash = location.hash.substring(1); // 移除 # 符号
  const targetQuestionId = questionId || hash;
  
  // 创建对问题元素的引用
  const questionRefs = useRef({});

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

  // 滚动到页面顶部并处理特定问题的展开
  useEffect(() => {
    // 首先滚动到页面顶部
    window.scrollTo(0, 0);
    
    // 如果有目标问题ID，等待组件渲染完成后滚动到该问题
    if (targetQuestionId) {
      // 使用setTimeout确保DOM已经更新
      setTimeout(() => {
        const element = questionRefs.current[targetQuestionId];
        if (element) {
          // 滚动到问题位置，并留出一些顶部空间
          const yOffset = -80; // 调整这个值以适应你的页面布局
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          
          // 如果问题在Accordion中，确保它被展开
          if (element.querySelector('[aria-expanded="false"]')) {
            element.querySelector('[aria-expanded="false"]').click();
          }
        }
      }, 300);
    }
  }, [targetQuestionId, forceUpdate]);

  // FAQ分类和问题 - 使用useMemo和翻译函数
  const faqCategories = useMemo(() => [
    {
      id: 'general',
      title: t('faq.categories.general', '一般问题'),
      faqs: [
        {
          id: 'free',
          question: t('home.faq.free'),
          answer: t('faq.answers.free', '是的，我们的所有PDF工具都是完全免费的，没有隐藏费用或高级功能。我们相信为所有人提供可访问的工具。')
        },
        {
          id: 'security',
          question: t('home.faq.security'),
          answer: t('faq.answers.security', '您的数据完全安全，因为所有处理都在您的浏览器中本地进行。您的文件不会上传到任何服务器，确保最大程度的隐私和安全。')
        },
        {
          id: 'mobile',
          question: t('home.faq.mobile'),
          answer: t('faq.answers.mobile', '是的，我们的工具设计为同时适用于桌面和移动设备。但是，对于复杂操作或大文件，我们建议使用桌面设备以获得最佳体验。')
        },
        {
          id: 'size-limit',
          question: t('home.faq.fileSize'),
          answer: t('faq.answers.fileSize', '由于所有处理都在您的浏览器中进行，限制取决于您设备的性能。通常，100MB以内的文件处理效果良好，但更大的文件可能需要更多处理时间或内存。')
        }
      ]
    },
    {
      id: 'features',
      title: t('faq.categories.features', '功能相关'),
      faqs: [
        {
          id: 'pdf-versions',
          question: t('faq.questions.pdfVersions', '支持哪些PDF版本？'),
          answer: t('faq.answers.pdfVersions', '我们的工具支持大多数常见的PDF版本（1.4到1.7）。但是，某些高度专业化或加密的PDF可能有限制的兼容性。')
        },
        {
          id: 'processing-time',
          question: t('faq.questions.processingTime', '处理PDF需要多长时间？'),
          answer: t('faq.answers.processingTime', '处理时间取决于文件大小、复杂度和您设备的性能。大多数操作在几秒钟内完成，但大型或复杂的文件可能需要更长时间。')
        },
        {
          id: 'encrypted-pdfs',
          question: t('faq.questions.encryptedPdfs', '可以处理加密或受密码保护的PDF吗？'),
          answer: t('faq.answers.encryptedPdfs', '目前，我们的工具不支持处理加密或受密码保护的PDF。您需要先移除密码保护，然后再使用我们的工具。')
        },
        {
          id: 'quality',
          question: t('faq.questions.quality', '处理后的PDF质量如何？'),
          answer: t('faq.answers.quality', '我们的工具旨在保持原始PDF的质量。但是，某些操作（如压缩）可能会根据选择的设置略微降低质量。您可以选择适合您需求的质量级别。')
        }
      ]
    },
    {
      id: 'technical',
      title: t('faq.categories.technical', '技术问题'),
      faqs: [
        {
          id: 'why-browser',
          question: t('faq.questions.whyBrowser', '为什么选择浏览器内处理而不是服务器处理？'),
          answer: t('faq.answers.whyBrowser', '浏览器内处理提供了几个优势：完全的数据隐私（文件不离开您的设备）、无需等待上传和下载、无服务器限制，以及即使在离线状态下也能使用的能力。')
        },
        {
          id: 'browsers',
          question: t('faq.questions.browsers', '使用这些工具需要什么浏览器？'),
          answer: t('faq.answers.browsers', '我们的工具与所有现代浏览器兼容，包括Chrome、Firefox、Safari和Edge的最新版本。为获得最佳体验，建议使用最新版本的浏览器。')
        },
        {
          id: 'large-files',
          question: t('faq.questions.largeFiles', '为什么某些大文件处理较慢？'),
          answer: t('faq.answers.largeFiles', '大文件处理需要更多的浏览器内存和处理能力。处理速度取决于您设备的规格和可用资源。关闭其他标签页和应用程序可能会提高性能。')
        },
        {
          id: 'issues',
          question: t('faq.questions.issues', '如果我在使用工具时遇到问题怎么办？'),
          answer: t('faq.answers.issues', '如果您遇到任何问题，请尝试刷新页面或使用不同的浏览器。如果问题仍然存在，请通过页面底部的联系方式与我们联系，我们将尽快提供帮助。')
        }
      ]
    }
  ], [t]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Helmet>
        <title>{t('appName')} - {t('faq.pageTitle', '常见问题')}</title>
        <meta name="description" content={t('faq.pageDescription', '关于我们免费PDF工具的常见问题解答，包括安全性、功能和技术支持等方面的信息。')} />
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
        <Typography color="text.primary">{t('faq.pageTitle', '常见问题')}</Typography>
      </Breadcrumbs>
      
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <FAQIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          {t('faq.heading', '常见问题解答')}
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ maxWidth: 700, mx: 'auto' }}
        >
          {t('faq.subtitle', '查找有关我们PDF工具的常见问题的答案。如果您没有找到所需的信息，请随时联系我们。')}
        </Typography>
      </Box>
      
      {faqCategories.map((category) => (
        <Paper 
          key={`${category.id}-${forceUpdate}`} 
          elevation={1} 
          sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}
        >
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            py: 2, 
            px: 3 
          }}>
            <Typography variant="h6">{category.title}</Typography>
          </Box>
          
          <Box sx={{ p: { xs: 0, md: 1 } }}>
            {category.faqs.map((faq, index) => (
              <Accordion 
                key={`${faq.id || index}-${forceUpdate}`} 
                elevation={0}
                disableGutters
                id={faq.id}
                ref={el => questionRefs.current[faq.id] = el}
                sx={{ 
                  '&:before': { display: 'none' },
                  borderBottom: index < category.faqs.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  ...(faq.id === targetQuestionId && {
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                    transition: 'background-color 0.3s ease'
                  })
                }}
                defaultExpanded={faq.id === targetQuestionId}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${category.id}-${index}-content`}
                  id={`panel-${category.id}-${index}-header`}
                  sx={{ 
                    px: { xs: 2, md: 3 }, 
                    py: { xs: 1.5, md: 2 },
                    ...(faq.id === targetQuestionId && {
                      fontWeight: 'bold',
                      color: 'primary.main'
                    })
                  }}
                >
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"}
                    sx={{ 
                      fontWeight: faq.id === targetQuestionId ? 600 : 500,
                      color: faq.id === targetQuestionId ? 'primary.main' : 'inherit'
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, md: 3 }, py: { xs: 1, md: 2 } }}>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Paper>
      ))}
      
      <Box sx={{ 
        mt: 6, 
        p: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6" gutterBottom>
          {t('faq.moreQuestions', '还有其他问题？')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('faq.contactUs', '如果您没有找到所需的答案，请随时联系我们。我们很乐意提供帮助！')}
        </Typography>
        <MuiLink 
          href="mailto:dlhc922@gmail.com" 
          sx={{ 
            display: 'inline-block',
            color: 'primary.main',
            fontWeight: 'bold',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          dlhc922@gmail.com
        </MuiLink>
      </Box>
    </Container>
  );
}

export default FaqPage; 