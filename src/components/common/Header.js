import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Drawer,
  List,
  ListItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Language as LanguageIcon,
  Check as CheckIcon,
  Share as ShareIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';

function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const currentLanguage = i18n.language; // 获取当前语言
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 使用 MUI 的响应式断点
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { path: '/stamp', label: t('tools.stamp') },
    { path: '/sign', label: t('tools.sign') },
    { path: '/merge', label: t('tools.merge') },
    { path: '/split', label: t('tools.split') },
    { path: '/compress', label: t('tools.compress') }
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleLanguageClose();
  };

  // 分享功能
  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    try {
      if (navigator.share) {
        // 如果浏览器支持原生分享API
        await navigator.share({
          title: document.title,
          url: currentUrl
        });
      } else {
        // 否则复制链接到剪贴板
        await navigator.clipboard.writeText(currentUrl);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 移动端导航菜单
  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 240,
          bgcolor: 'background.paper'
        }
      }}
    >
      <Box sx={{ py: 2, px: 1 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
            px: 2,
            display: 'block',
            mb: 2
          }}
        >
          WSBN.tech
        </Typography>
        <List>
          {menuItems.map(item => (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'background.default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar>
        {/* 移动端汉堡菜单按钮 */}
        {isMobile && (
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ 
              mr: 2,
              color: 'primary.main'
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
            flexGrow: isMobile ? 1 : 0,
            mr: isMobile ? 0 : 4
          }}
        >
          WSBN.tech
        </Typography>

        {/* PC端导航菜单 */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1 }}>
            {menuItems.map(item => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  color: location.pathname === item.path ? 'primary.dark' : 'text.primary',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.04)
                  },
                  ...(location.pathname === item.path && {
                    bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.08),
                    fontWeight: 'bold'
                  })
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* 右侧按钮组 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          ml: 'auto'
        }}>
          {/* 语言切换按钮 */}
          <Button
            startIcon={<LanguageIcon />}
            onClick={handleLanguageClick}
            sx={{ 
              color: 'primary.main',
              textTransform: 'none'
            }}
          >
            {isMobile ? '' : languages.find(lang => lang.code === currentLanguage)?.label || 'Language'}
          </Button>

          {/* 分享按钮 */}
          <IconButton
            onClick={handleShare}
            sx={{ 
              ml: 1,
              color: 'primary.main'
            }}
          >
            <ShareIcon />
          </IconButton>
        </Box>

        {/* 语言菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleLanguageClose}
          PaperProps={{
            sx: {
              minWidth: '120px'
            }
          }}
        >
          {languages.map((lang) => (
            <MenuItem 
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              selected={currentLanguage === lang.code}
              sx={{
                py: 1,
                px: 2
              }}
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

        {/* 移动端抽屉菜单 */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            sx: {
              width: 240,
              bgcolor: 'background.paper'
            }
          }}
        >
          <Box sx={{ py: 2, px: 1 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                px: 2,
                display: 'block',
                mb: 2
              }}
            >
              WSBN.tech
            </Typography>
            <List>
              {menuItems.map(item => (
                <ListItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message={t('share.linkCopied')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Toolbar>
    </AppBar>
  );
}

export default Header; 