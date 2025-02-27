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
  Menu as MenuIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import LanguageShareControls from '../LanguageShareControls';

function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
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
    { path: '/compress', label: t('tools.compress') },
    { path: '/extract', label: t('tools.extract') },
    { path: '/image-to-pdf', label: t('tools.imageToPdf') },
    { path: '/pdf-compare', label: t('tools.pdfCompare') }
  ];

  // 移动端导航菜单抽屉
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
          {/* 移动端汉堡菜单 */}
          {isMobile && (
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* 使用 LanguageShareControls 组件替换语言切换与分享按钮 */}
          <LanguageShareControls />
        </Box>

        {mobileMenu}

        {/* Snackbar 提示分享复制成功 */}
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