import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '首页' },
    { path: '/merge', label: 'PDF合并' },
    { path: '/stamp', label: 'PDF盖章' },
    { path: '/split', label: 'PDF拆分' },
    { path: '/compress', label: 'PDF压缩' }
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            color: '#00BFFF',
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
                color: location.pathname === item.path ? '#00BFFF' : 'text.primary',
                '&:hover': {
                  bgcolor: 'rgba(233, 30, 99, 0.04)'
                },
                ...(location.pathname === item.path && {
                  bgcolor: 'rgba(233, 30, 99, 0.08)',
                  fontWeight: 'bold'
                })
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 