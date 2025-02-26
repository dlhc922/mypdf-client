import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Alert, Box, Button, Typography, TextField, Divider, IconButton } from '@mui/material';
import { 
  Share as ShareIcon, 
  Computer as ComputerIcon, 
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * 设备兼容性提示组件
 * @param {Object} props 组件属性
 * @param {boolean} props.mobileCompatible 是否兼容移动设备
 * @param {string} props.toolName 工具名称（可选）
 * @param {React.ReactNode} props.children 子组件
 * @returns {React.ReactNode}
 */
export default function DeviceCompatibilityAlert({ mobileCompatible = false, toolName = '', children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // 如果是移动设备且不兼容移动设备，则显示提示
  if (isMobile && !mobileCompatible) {
    const currentUrl = window.location.href;
    
    // 复制当前链接到剪贴板
    const copyLinkToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert(t('device.linkCopied') || '链接已复制到剪贴板');
      } catch (error) {
        console.error('复制链接失败:', error);
      }
    };
    
    // 分享当前链接
    const shareLink = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: toolName || t('device.shareTitle') || 'PDF工具',
            text: t('device.shareText') || '请在电脑上打开此链接以获得最佳体验',
            url: currentUrl,
          });
        } catch (err) {
          console.error('分享失败:', err);
        }
      } else {
        copyLinkToClipboard();
      }
    };
    
    // 返回首页
    const handleBack = () => {
      navigate('/');
    };
    
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3
        }}
      >
        <Box 
          sx={{ 
            width: '100%',
            maxWidth: '450px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <ComputerIcon sx={{ fontSize: 70, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" align="center">
            {t('device.desktopOnly') || '请使用电脑访问'}
          </Typography>
          
          <Typography variant="body2" paragraph align="center" sx={{ mb: 3 }}>
            {t('device.simpleMobileNotSupported') || '此功能不适合在手机上使用，请复制链接在电脑上打开'}
          </Typography>
          
          {/* 显示当前网址 */}
          <Box 
            sx={{ 
              width: '100%',
              mt: 1, 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 1
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={currentUrl}
              InputProps={{
                readOnly: true,
                sx: { 
                  fontSize: '0.8rem',
                  wordBreak: 'break-all',
                  bgcolor: 'background.paper'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                },
              }}
            />
            <IconButton 
              color="primary" 
              onClick={copyLinkToClipboard}
              sx={{ ml: 1 }}
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ width: '100%', my: 2 }} />
          
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button 
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              size="medium"
            >
              {t('device.backToHome') || '返回首页'}
            </Button>
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ShareIcon />}
              onClick={shareLink}
              size="medium"
            >
              {t('device.shareLink') || '分享链接'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }
  
  // 如果是桌面设备或者兼容移动设备，则正常显示内容
  return children;
} 