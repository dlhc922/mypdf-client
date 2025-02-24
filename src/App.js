import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import MergePage from './pages/merge/MergePage';
import StampPage from './pages/stamp/StampPage';
import SplitPage from './pages/split/SplitPage';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import CompressPage from './pages/compress/CompressPage';
import './i18n';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import SignPage from './pages/sign/SignPage';
import ExtractPage from './pages/extract/ExtractPage';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {!isOnline && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            width: '100%', 
            background: '#ff4444', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center' 
          }}>
            您当前处于离线状态，但仍可以使用所有PDF处理功能
          </div>
        )}
        <Box sx={{ flex: 1 }}>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/merge" element={<MergePage />} />
                <Route path="/stamp" element={<StampPage />} />
                <Route path="/split" element={<SplitPage />} />
                <Route path="/compress" element={<CompressPage />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/extract" element={<ExtractPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
