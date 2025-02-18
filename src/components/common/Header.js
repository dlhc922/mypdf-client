import React from 'react';
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
  ListItemText
} from '@mui/material';
import { 
  Language as LanguageIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';

function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const currentLanguage = i18n.language; // 获取当前语言

  const menuItems = [
    { path: '/stamp', label: t('tools.stamp') },
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

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'background.paper',
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
            flexGrow: 0,
            mr: 4
          }}
        >
          WSBN.tech
        </Typography>
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

        <Button
          startIcon={<LanguageIcon />}
          onClick={handleLanguageClick}
          sx={{ 
            ml: 2,
            color: 'text.primary',
            textTransform: 'none'
          }}
        >
          {languages.find(lang => lang.code === currentLanguage)?.label || 'Language'}
        </Button>
        
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
      </Toolbar>
    </AppBar>
  );
}

export default Header; 