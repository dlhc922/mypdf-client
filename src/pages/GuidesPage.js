import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Button
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
  CompareArrows,
  Description,
  TableChart,
  ExpandMore as ExpandMoreIcon,
  ArrowBack
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function GuidesPage() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 获取URL参数
  const { toolId } = useParams();
  const location = useLocation();

  // 工具指南数据 - 按类别分组
  const guideCategories = useMemo(() => [
    {
      id: 'edit',
      title: t('menuGroups.edit', 'PDF编辑'),
      guides: ['stamp', 'sign']
    },
    {
      id: 'organize',
      title: t('menuGroups.organize', 'PDF整理'),
      guides: ['merge', 'split', 'extract']
    },
    {
      id: 'convert',
      title: t('menuGroups.convert', '格式转换'),
      guides: ['image-to-pdf', 'pdf-to-word', 'pdf-to-excel', 'pdf-to-image']
    },
    {
      id: 'analyze',
      title: t('menuGroups.analyze', 'PDF优化'),
      guides: ['compress', 'compare']
    }
  ], [t]);

  // 工具指南数据 - 使用useMemo和翻译函数
  const guides = useMemo(() => [
    {
      id: 'stamp',
      title: t('home.guides.stamp'),
      icon: <VerifiedUser />,
      category: 'edit',
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
      category: 'organize',
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
      category: 'organize',
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
      category: 'analyze',
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
      title: t('guides.sign.title', "如何在PDF上添加签名"),
      icon: <Gesture />,
      category: 'edit',
      steps: [
        t('guides.sign.steps.step1', "上传您的PDF文件"),
        t('guides.sign.steps.step2', "创建新签名（手写、文本或上传图片）"),
        t('guides.sign.steps.step3', "调整签名大小和位置"),
        t('guides.sign.steps.step4', "点击PDF页面添加签名"),
        t('guides.sign.steps.step5', "下载签名后的PDF")
      ],
      tips: [
        t('guides.sign.tips.tip1', "使用手写模式可以创建更个性化的签名"),
        t('guides.sign.tips.tip2', "您可以保存多个签名以便将来使用"),
        t('guides.sign.tips.tip3', "签名图片支持透明背景，效果更好")
      ],
      faqs: [
        {
          question: t('guides.sign.faqs.q1', "签名是否安全？"),
          answer: t('guides.sign.faqs.a1', "所有签名处理都在您的浏览器中本地完成，不会上传到服务器，确保您的签名安全。")
        },
        {
          question: t('guides.sign.faqs.q2', "可以在一个文档中添加多个签名吗？"),
          answer: t('guides.sign.faqs.a2', "是的，您可以在PDF文档的不同位置添加多个签名。")
        }
      ]
    },
    {
      id: 'extract',
      title: t('guides.extract.title', "如何从PDF提取图片"),
      icon: <ImageIcon />,
      category: 'organize',
      steps: [
        t('guides.extract.steps.step1', "上传您的PDF文件"),
        t('guides.extract.steps.step2', "点击'提取图片'按钮"),
        t('guides.extract.steps.step3', "选择您想要保存的图片"),
        t('guides.extract.steps.step4', "点击'保存选中'下载图片")
      ],
      tips: [
        t('guides.extract.tips.tip1', "提取的图片质量取决于PDF中的原始图片质量"),
        t('guides.extract.tips.tip2', "某些嵌入式或特殊格式的图片可能无法提取")
      ],
      faqs: [
        {
          question: t('guides.extract.faqs.q1', "可以提取的图片格式有哪些？"),
          answer: t('guides.extract.faqs.a1', "工具可以提取大多数常见的图片格式，包括JPEG、PNG、GIF等。")
        },
        {
          question: t('guides.extract.faqs.q2', "如果PDF中没有图片会怎样？"),
          answer: t('guides.extract.faqs.a2', "如果PDF中没有可提取的图片，工具会显示提示信息告知您没有找到图片。")
        }
      ]
    },
    {
      id: 'compare',
      title: t('guides.compare.title', "如何比较两个PDF文件"),
      icon: <CompareArrows />,
      category: 'analyze',
      steps: [
        t('guides.compare.steps.step1', "上传原始PDF文件"),
        t('guides.compare.steps.step2', "上传修改后的PDF文件"),
        t('guides.compare.steps.step3', "点击'比较PDF文件'按钮"),
        t('guides.compare.steps.step4', "查看比较结果，高亮显示的部分表示差异"),
        t('guides.compare.steps.step5', "可以下载比较结果PDF")
      ],
      tips: [
        t('guides.compare.tips.tip1', "确保两个PDF文件具有相似的结构以获得最佳比较结果"),
        t('guides.compare.tips.tip2', "使用全屏模式可以更清晰地查看差异")
      ],
      faqs: [
        {
          question: t('guides.compare.faqs.q1', "比较工具能识别哪些类型的差异？"),
          answer: t('guides.compare.faqs.a1', "我们的比较工具可以识别文本更改、添加或删除的内容，以及图像和格式的变化。")
        },
        {
          question: t('guides.compare.faqs.q2', "比较大型文档需要多长时间？"),
          answer: t('guides.compare.faqs.a2', "比较时间取决于文档大小和复杂度。大型文档可能需要几分钟时间。")
        }
      ]
    },
    {
      id: 'image-to-pdf',
      title: t('guides.imageToPdf.title', "如何将图片转换为PDF"),
      icon: <ImageIcon />,
      category: 'convert',
      steps: [
        t('guides.imageToPdf.steps.step1', "点击上传区域或拖放图片"),
        t('guides.imageToPdf.steps.step2', "可以添加多张图片，调整顺序"),
        t('guides.imageToPdf.steps.step3', "选择所需的PDF质量（低质量、中等质量或高质量）"),
        t('guides.imageToPdf.steps.step4', "调整页面设置（纸张大小、方向等）"),
        t('guides.imageToPdf.steps.step5', "点击'生成PDF'"),
        t('guides.imageToPdf.steps.step6', "下载生成的PDF文件")
      ],
      tips: [
        t('guides.imageToPdf.tips.tip1', "使用中等质量可以平衡文件大小和图片清晰度"),
        t('guides.imageToPdf.tips.tip2', "可以拖动图片改变它们在PDF中的顺序"),
        t('guides.imageToPdf.tips.tip3', "添加水印功能可以保护您的图片版权")
      ],
      faqs: [
        {
          question: t('guides.imageToPdf.faqs.q1', "支持哪些图片格式？"),
          answer: t('guides.imageToPdf.faqs.a1', "我们的工具支持所有常见的图片格式，包括JPG、PNG、GIF、BMP等。")
        },
        {
          question: t('guides.imageToPdf.faqs.q2', "一次可以转换多少张图片？"),
          answer: t('guides.imageToPdf.faqs.a2', "虽然没有严格的限制，但建议一次处理不超过50张图片，以获得最佳性能。")
        },
        {
          question: t('guides.imageToPdf.faqs.q3', "图片会上传到服务器吗？"),
          answer: t('guides.imageToPdf.faqs.a3', "不会。所有处理都在您的浏览器中完成，图片不会上传到任何服务器，确保您的隐私安全。")
        }
      ]
    },
    {
      id: 'pdf-to-word',
      title: t('guides.pdfToWord.title', "如何将PDF转换为Word文档"),
      icon: <Description />,
      category: 'convert',
      steps: [
        t('guides.pdfToWord.steps.step1', "上传您的PDF文件"),
        t('guides.pdfToWord.steps.step2', "预览PDF文件内容确认无误"),
        t('guides.pdfToWord.steps.step3', "点击'转换为Word'按钮"),
        t('guides.pdfToWord.steps.step4', "等待转换完成"),
        t('guides.pdfToWord.steps.step5', "下载生成的Word文档")
      ],
      tips: [
        t('guides.pdfToWord.tips.tip1', "PDF文件内容越简单，转换质量越高"),
        t('guides.pdfToWord.tips.tip2', "包含复杂表格和图表的PDF可能需要转换后进行一些手动调整"),
        t('guides.pdfToWord.tips.tip3', "确保PDF文本是可选择的，而不是扫描图像")
      ],
      faqs: [
        {
          question: t('guides.pdfToWord.faqs.q1', "转换后的Word文档是否保留原PDF的格式？"),
          answer: t('guides.pdfToWord.faqs.a1', "我们的转换工具尽可能保留原始格式，包括字体、颜色和布局，但复杂元素可能需要一些手动调整。")
        },
        {
          question: t('guides.pdfToWord.faqs.q2', "有文件大小限制吗？"),
          answer: t('guides.pdfToWord.faqs.a2', "一般建议上传不超过20MB的PDF文件，以获得最佳的转换性能和速度。")
        },
        {
          question: t('guides.pdfToWord.faqs.q3', "我的文件安全吗？"),
          answer: t('guides.pdfToWord.faqs.a3', "为了提供高质量转换，PDF文件会安全地上传到我们的服务器进行处理，但不会存储或用于其他目的。如果文件包含敏感信息，建议使用本地处理工具。")
        }
      ]
    },
    {
      id: 'pdf-to-excel',
      title: t('guides.pdfToExcel.title', "如何将PDF中的表格转换为Excel"),
      icon: <TableChart />,
      category: 'convert',
      steps: [
        t('guides.pdfToExcel.steps.step1', "上传包含表格的PDF文件"),
        t('guides.pdfToExcel.steps.step2', "预览PDF内容确认有表格数据"),
        t('guides.pdfToExcel.steps.step3', "点击'转换为Excel'按钮"),
        t('guides.pdfToExcel.steps.step4', "等待转换完成（较大文件可能需要更长时间）"),
        t('guides.pdfToExcel.steps.step5', "下载生成的Excel文件")
      ],
      tips: [
        t('guides.pdfToExcel.tips.tip1', "结构清晰的表格转换效果最佳"),
        t('guides.pdfToExcel.tips.tip2', "复杂的合并单元格可能需要转换后调整"),
        t('guides.pdfToExcel.tips.tip3', "确保PDF中的表格是文本格式，而不是图像")
      ],
      faqs: [
        {
          question: t('guides.pdfToExcel.faqs.q1', "转换后Excel中的数据是否可以编辑？"),
          answer: t('guides.pdfToExcel.faqs.a1', "是的，转换后的Excel文件是完全可编辑的，您可以像处理普通Excel文件一样操作数据。")
        },
        {
          question: t('guides.pdfToExcel.faqs.q2', "能从PDF中提取多个表格吗？"),
          answer: t('guides.pdfToExcel.faqs.a2', "是的，我们的工具可以识别PDF中的多个表格，并将它们转换为Excel中的不同工作表。")
        },
        {
          question: t('guides.pdfToExcel.faqs.q3', "如果PDF中的表格是扫描图像怎么办？"),
          answer: t('guides.pdfToExcel.faqs.a3', "我们的工具目前主要处理文本格式的表格。对于扫描的表格图像，转换准确度可能会降低。")
        }
      ]
    },
    {
      id: 'pdf-to-image',
      title: t('guides.pdfToImage.title', "如何将PDF转换为图片"),
      icon: <ImageIcon />,
      category: 'convert',
      steps: [
        t('guides.pdfToImage.steps.step1', "上传您的PDF文件"),
        t('guides.pdfToImage.steps.step2', "预览PDF内容"),
        t('guides.pdfToImage.steps.step3', "选择转换设置（图片格式、质量和分辨率）"),
        t('guides.pdfToImage.steps.step4', "点击'转换为图片'按钮"),
        t('guides.pdfToImage.steps.step5', "等待转换完成"),
        t('guides.pdfToImage.steps.step6', "下载所有图片或选择单张下载")
      ],
      tips: [
        t('guides.pdfToImage.tips.tip1', "PNG格式适合包含文本和线条的PDF，保持清晰度"),
        t('guides.pdfToImage.tips.tip2', "JPEG格式适合包含照片内容的PDF，文件更小"),
        t('guides.pdfToImage.tips.tip3', "提高分辨率可以获得更清晰的图片，但文件大小会增加")
      ],
      faqs: [
        {
          question: t('guides.pdfToImage.faqs.q1', "一次可以转换多少页PDF？"),
          answer: t('guides.pdfToImage.faqs.a1', "转换页数没有严格限制，但大量页面的PDF可能需要更多的处理时间和浏览器内存。建议一次处理不超过50页的文档。")
        },
        {
          question: t('guides.pdfToImage.faqs.q2', "转换后的图片质量如何？"),
          answer: t('guides.pdfToImage.faqs.a2', "图片质量取决于您选择的设置。高分辨率和高质量设置会产生更清晰的图片，但文件大小也会更大。")
        },
        {
          question: t('guides.pdfToImage.faqs.q3', "这个过程是在本地完成的吗？"),
          answer: t('guides.pdfToImage.faqs.a3', "是的，所有转换过程都在您的浏览器中完成，不会上传文件到服务器，确保文件安全和隐私。")
        }
      ]
    }
  ], [t]);

  // 将工具按类别分组
  const getGuidesByCategory = (categoryId) => {
    return guides.filter(guide => guide.category === categoryId);
  };

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

  // 根据URL参数设置活动指南并滚动到顶部
  useEffect(() => {
    // 首先滚动到页面顶部
    window.scrollTo(0, 0);
    
    // 检查是否有工具ID参数
    if (toolId) {
      setActiveGuideId(toolId);
    } else {
      // 检查路径中是否包含工具ID
      const pathParts = location.pathname.split('/');
      const pathToolId = pathParts[pathParts.length - 1];
      if (pathToolId && pathToolId !== 'guides') {
        setActiveGuideId(pathToolId);
      }
    }
  }, [toolId, location.pathname]);

  // 渲染指南详情
  const renderGuideDetails = (guide) => {
    return (
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
    );
  };

  // 渲染指南卡片
  const renderGuideCard = (guide) => {
    return (
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
        onClick={() => setActiveGuideId(guide.id)}
      >
        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <CardContent sx={{ width: '100%' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                color: 'primary.main'
              }}
            >
              {guide.icon}
              <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 'medium' }}>
                {guide.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {guide.steps[0]}...
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  // 获取当前活动的指南
  const activeGuide = guides.find(guide => guide.id === activeGuideId);

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
      
      <Box sx={{ mb: 4 }}>
        {activeGuide ? (
          <Paper sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={() => setActiveGuideId(null)}
                sx={{ 
                  boxShadow: 2,
                  px: 2,
                  py: 1
                }}
              >
                {t('guides.backToList', '返回全部指南')}
              </Button>
            </Box>
            
            {renderGuideDetails(activeGuide)}
          </Paper>
        ) : (
          <Box>
            {guideCategories.map((category) => (
              <Accordion key={category.id} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${category.id}-content`}
                  id={`${category.id}-header`}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <Typography variant="h6">{category.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {guides
                      .filter(guide => category.guides.includes(guide.id))
                      .map(guide => (
                        <Grid item xs={12} sm={6} md={4} key={guide.id}>
                          {renderGuideCard(guide)}
                        </Grid>
                      ))
                    }
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
      
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