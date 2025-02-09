import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import { useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const showHeader = location.pathname !== '/'; // 在首页不显示 header

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showHeader && <Header />}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout; 