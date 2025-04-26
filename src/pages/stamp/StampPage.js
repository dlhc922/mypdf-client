import React from 'react';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PDFPreview from '../../components/stamp/PDFPreview';
import StampTools from '../../components/stamp/StampTools';
import { StampProvider } from '../../contexts/StampContext';
import { useTranslation } from 'react-i18next';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

function StampPage() {
  const { t } = useTranslation();
  
  return (
    <StampProvider>
      <Helmet>
        <title>{t('stamp.pageTitle', '免费PDF盖章工具 - 本地处理无需上传 安全私密')} | {t('appName', 'PDF工具箱')}</title>
        <meta name="description" content={t('stamp.pageDescription', '100%免费在线PDF盖章工具。在浏览器中本地添加自定义印章、公章或水印，无需上传文件，完全保护隐私。可调整大小、位置和透明度，简单易用。')} />
        <meta name="keywords" content="免费PDF盖章,本地处理,无需上传,骑缝章,电子印章,PDF工具,公章,私章,透明印章,批量盖章,在线PDF处理,安全" />
        <meta property="og:title" content={`${t('stamp.pageTitle', '免费PDF盖章工具 - 本地处理无需上传 安全私密')} | ${t('appName', 'PDF工具箱')}`} />
        <meta property="og:description" content={t('stamp.pageDescription', '100%免费在线PDF盖章工具。在浏览器中本地添加自定义印章、公章或水印，无需上传文件，完全保护隐私。可调整大小、位置和透明度，简单易用。')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${t('stamp.pageTitle', '免费PDF盖章工具 - 本地处理无需上传 安全私密')} | ${t('appName', 'PDF工具箱')}`} />
        <meta name="twitter:description" content={t('stamp.pageDescription', '100%免费在线PDF盖章工具。在浏览器中本地添加自定义印章、公章或水印，无需上传文件，完全保护隐私。可调整大小、位置和透明度，简单易用。')} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': `${t('stamp.pageTitle', '免费PDF盖章工具 - 本地处理无需上传 安全私密')}`,
            'applicationCategory': 'UtilitiesApplication',
            'operatingSystem': 'Web',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'CNY'
            },
            'description': t('stamp.pageDescription', '100%免费在线PDF盖章工具。在浏览器中本地添加自定义印章、公章或水印，无需上传文件，完全保护隐私。可调整大小、位置和透明度，简单易用。'),
            'featureList': [
              '100%免费使用，无隐藏费用',
              '本地浏览器处理，文件不会上传',
              '支持自定义印章图片',
              '支持骑缝章设置',
              '支持透明印章制作',
              '支持多页批量盖章',
              '完全保护文件隐私和安全'
            ],
            'browserRequirements': 'requires JavaScript support',
            'softwareVersion': '1.0'
          })}
        </script>
      </Helmet>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 左侧预览区域 - 独立滚动 */}
        <Box
          sx={{
            flex: 1,
            height: '100vh',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <PDFPreview />
        </Box>
        <DeviceCompatibilityAlert mobileCompatible={false} toolName="PDF盖章"></DeviceCompatibilityAlert>
        
      {/* 右侧工具栏 */}
      <Box
        sx={{
          width: 280,
          height: '100vh',
          borderLeft: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <StampTools />
      </Box>
    </Box>
  </StampProvider>
);
}

export default StampPage; 