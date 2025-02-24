import React, { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import ShareIcon from '@mui/icons-material/Share';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

// 定义支持的语言列表，可根据需要调整
const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

export default function LanguageShareControls() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('home.appTitle'),
          text: t('home.share.text') || t('home.appTitle'),
          url: window.location.href,
        });
      } catch (err) {
        console.error('分享失败：', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(t('home.share.copied') || '链接已复制到剪贴板');
      } catch (error) {
        console.error('复制链接失败：', error);
        alert(t('home.share.copyFailed') || '复制链接失败');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* 语言切换按钮 */}
      <Button
        startIcon={<LanguageIcon />}
        onClick={handleLanguageClick}
        sx={{ ml: 1, color: 'primary.main', textTransform: 'none' }}
      >
        {languages.find(lang => lang.code === currentLanguage)?.label || 'Language'}
      </Button>

      {/* 分享按钮 */}
      <IconButton
        onClick={handleShare}
        sx={{ ml: 1, color: 'primary.main' }}
      >
        <ShareIcon />
      </IconButton>

      {/* 语言菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageClose}
        PaperProps={{ sx: { minWidth: '120px' } }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={currentLanguage === lang.code}
            sx={{ py: 1, px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: '30px' }}>
              {lang.flag}
            </ListItemIcon>
            <ListItemText primary={lang.label} />
            {currentLanguage === lang.code && (
              <CheckIcon sx={{ ml: 1, color: 'primary.dark' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
} 