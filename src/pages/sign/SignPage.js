import React from 'react';
import { Box } from '@mui/material';
import SignPreview from '../../components/sign/SignPreview';
import SignTools from '../../components/sign/SignTools';
import { SignProvider } from '../../contexts/SignContext';
import { useTranslation } from 'react-i18next';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';
import { Helmet } from 'react-helmet-async';
import WorkflowIndicator from '../../components/common/WorkflowIndicator';

function SignPage() {
  const { t } = useTranslation();
  
  return (
    <SignProvider>
        <Helmet>
          <title>{t('sign.pageTitle', '免费PDF签名工具 - 本地处理无需上传 安全私密')} | {t('appName', 'PDF工具箱')}</title>
          <meta name="description" content={t('sign.pageDescription', '100%免费在线PDF签名工具。在浏览器中本地添加手写或打字签名，无需上传文件，完全保护隐私。轻松创建和定位签名，简单易用。')} />
          <meta name="keywords" content="免费PDF签名,本地处理,无需上传,电子签名,PDF工具,手写签名,文字签名,图片签名,在线PDF处理,安全" />
          <meta property="og:title" content={`${t('sign.pageTitle', '免费PDF签名工具 - 本地处理无需上传 安全私密')} | ${t('appName', 'PDF工具箱')}`} />
          <meta property="og:description" content={t('sign.pageDescription', '100%免费在线PDF签名工具。在浏览器中本地添加手写或打字签名，无需上传文件，完全保护隐私。轻松创建和定位签名，简单易用。')} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
          <link rel="canonical" href={window.location.href.split('?')[0]} />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`${t('sign.pageTitle', '免费PDF签名工具 - 本地处理无需上传 安全私密')} | ${t('appName', 'PDF工具箱')}`} />
          <meta name="twitter:description" content={t('sign.pageDescription', '100%免费在线PDF签名工具。在浏览器中本地添加手写或打字签名，无需上传文件，完全保护隐私。轻松创建和定位签名，简单易用。')} />
          
          {/* JSON-LD Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': `${t('sign.pageTitle', '免费PDF签名工具 - 本地处理无需上传 安全私密')}`,
              'applicationCategory': 'UtilitiesApplication',
              'operatingSystem': 'Web',
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'CNY'
              },
              'description': t('sign.pageDescription', '100%免费在线PDF签名工具。在浏览器中本地添加手写或打字签名，无需上传文件，完全保护隐私。轻松创建和定位签名，简单易用。'),
              'featureList': [
                '100%免费使用，无隐藏费用',
                '本地浏览器处理，文件不会上传',
                '支持手写、文字和图片签名',
                '支持自定义签名位置和大小',
                '支持多个签名添加',
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
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 顶部工作流条 */}
          <Box
            sx={{
              height: 48,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              flexShrink: 0
            }}
          >
            <WorkflowIndicator />
          </Box>
          
          {/* 主要内容区域 */}
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden'
            }}
          >
            {/* 左侧预览区域 - 独立滚动 */}
            <Box
              sx={{
                flex: 1,
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <SignPreview />
            </Box>

            {/* 右侧工具栏：使用紧凑的垂直排列 */}
            <DeviceCompatibilityAlert mobileCompatible={false} toolName="PDF签名"></DeviceCompatibilityAlert>
            <Box
              sx={{
                width: 280,
                height: '100%',
                display: 'flex',          // 设为 flex 布局
                flexDirection: 'column',   // 垂直排列
                borderLeft: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                p: 1                     // 根据需要可以适当减少内边距
              }}
            >
              <SignTools />
            </Box>
          </Box>
        </Box>
    </SignProvider>
  );
}

export default SignPage; 