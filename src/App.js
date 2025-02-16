import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import MergePage from './pages/merge/MergePage';
import StampPage from './pages/stamp/StampPage';
import SplitPage from './pages/split/SplitPage';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import CompressPage from './pages/compress/CompressPage';

function App() {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/merge" element={<MergePage />} />
              <Route path="/stamp" element={<StampPage />} />
              <Route path="/split" element={<SplitPage />} />
              <Route path="/compress" element={<CompressPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
