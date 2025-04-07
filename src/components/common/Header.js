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
  useMediaQuery,
  Collapse,
  Divider,
  Tooltip,
  ListSubheader
} from '@mui/material';
import { 
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
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
  
  // 添加菜单的状态管理
  const [anchorEls, setAnchorEls] = useState({});
  const [mobileGroupExpanded, setMobileGroupExpanded] = useState({});
  
  // 使用 MUI 的响应式断点
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 定义菜单组
  const menuGroups = [
    {
      id: 'edit',
      label: t('menuGroups.edit', 'PDF编辑'),
      items: [
        { path: '/stamp', label: t('tools.stamp', '电子印章') },
        { path: '/sign', label: t('tools.sign', '电子签名') }
      ]
    },
    {
      id: 'organize',
      label: t('menuGroups.organize', 'PDF整理'),
      items: [
        { path: '/merge', label: t('tools.merge', '合并PDF') },
        { path: '/split', label: t('tools.split', '拆分PDF') },
        { path: '/extract', label: t('tools.extract', '提取图片') }
      ]
    },
    {
      id: 'convert',
      label: t('menuGroups.convert', '格式转换'),
      items: [
        { path: '/image-to-pdf', label: t('tools.imageToPdf', '图片转PDF') },
        { path: '/pdf-to-word', label: t('tools.pdfToWord', 'PDF转Word') },
        { path: '/pdf-to-excel', label: t('tools.pdfToExcel', 'PDF转Excel') },
        { path: '/pdf-to-image', label: t('tools.pdfToImage', 'PDF转图片') }
      ]
    },
    {
      id: 'analyze',
      label: t('menuGroups.analyze', 'PDF优化'),
      items: [
        { path: '/pdf-compare', label: t('tools.pdfCompare', 'PDF比较') },
        { path: '/compress', label: t('tools.compress', '压缩PDF') }
      ]
    }
  ];

  const handleMenuOpen = (event, groupId) => {
    // 关闭所有其他菜单，只打开当前悬停的菜单
    const newAnchorEls = {};
    newAnchorEls[groupId] = event.currentTarget;
    setAnchorEls(newAnchorEls);
  };

  const handleMenuClose = (groupId) => {
    setAnchorEls({
      ...anchorEls,
      [groupId]: null
    });
  };

  const handleAllMenusClose = () => {
    setAnchorEls({});
  };

  const toggleMobileGroup = (groupId) => {
    setMobileGroupExpanded({
      ...mobileGroupExpanded,
      [groupId]: !mobileGroupExpanded[groupId]
    });
  };

  // 移动端导航菜单抽屉
  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
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
        <List component="nav" aria-labelledby="nested-list-subheader">
          {menuGroups.map(group => (
            <React.Fragment key={group.id}>
              <ListItem 
                button 
                onClick={() => toggleMobileGroup(group.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: group.items.some(item => location.pathname === item.path)
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                }}
              >
                <ListItemText 
                  primary={group.label} 
                  primaryTypographyProps={{ 
                    fontWeight: group.items.some(item => location.pathname === item.path) ? 'bold' : 'normal'
                  }}
                />
                {mobileGroupExpanded[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={mobileGroupExpanded[group.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map(item => (
                    <ListItem
                      key={item.path}
                      component={Link}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        pl: 4,
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
              </Collapse>
              <Divider sx={{ my: 1 }} />
            </React.Fragment>
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
            {menuGroups.map(group => (
              <React.Fragment key={group.id}>
                <Box
                  onMouseEnter={(e) => handleMenuOpen(e, group.id)}
                  onMouseLeave={() => handleMenuClose(group.id)}
                  sx={{ 
                    display: 'inline-block', 
                    position: 'relative'
                  }}
                >
                  <Button
                    aria-haspopup="true"
                    sx={{
                      mx: 1,
                      color: group.items.some(item => location.pathname === item.path) 
                        ? 'primary.dark' 
                        : 'text.primary',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.04)
                      },
                      ...(group.items.some(item => location.pathname === item.path) && {
                        bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.08),
                        fontWeight: 'bold'
                      })
                    }}
                    endIcon={<ExpandMoreIcon />}
                  >
                    {group.label}
                  </Button>
                  <Menu
                    anchorEl={anchorEls[group.id]}
                    open={Boolean(anchorEls[group.id])}
                    onClose={() => handleMenuClose(group.id)}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                      onMouseLeave: () => handleMenuClose(group.id),
                      sx: { pointerEvents: 'auto' }
                    }}
                    disableAutoFocusItem
                    PaperProps={{
                      onMouseLeave: () => handleMenuClose(group.id)
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    sx={{
                      pointerEvents: 'none'
                    }}
                  >
                    {group.items.map(item => (
                      <MenuItem 
                        key={item.path}
                        component={Link}
                        to={item.path}
                        onClick={() => handleMenuClose(group.id)}
                        selected={location.pathname === item.path}
                        sx={{
                          ...(location.pathname === item.path && {
                            bgcolor: alpha(theme.palette.primary.dark, 0.08),
                            fontWeight: 'bold'
                          })
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </React.Fragment>
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