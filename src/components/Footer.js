import { Box, Link, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  // 使用一个变量来存储联系我们的文本，这样更容易调试
  const contactText = t('footer.contact', '联系我们');
  
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 3,  // 上下内边距
        mt: 'auto',  // 自动上边距，使 footer 保持在内容区域下方
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'none',
            color: 'primary.dark'
          }
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <Link href="/guides">{t('guides.pageTitle', '使用指南')}</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/faq">{t('faq.pageTitle', '常见问题')}</Link>
          </Typography>
        </Stack>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          {t('footer.poweredBy', '技术支持')}{' '}
          <Link 
            href="https://wsbn.tech" 
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 600,
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            WSBN.tech
          </Link>
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {/* 使用硬编码的文本作为备选，确保至少有一个可见的文本 */}
            {contactText || '联系我们'}: <Link href="mailto:dlhc922@gmail.com">dlhc922@gmail.com</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/privacy">{t('footer.privacyPolicy', '隐私政策')}</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/disclaimer">{t('footer.disclaimer', '免责声明')}</Link>
          </Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
          <Link href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            辽ICP备2025052615号
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 