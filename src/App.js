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
import ImageToPdfPage from './pages/image-to-pdf/ImageToPdfPage';
import PdfComparePage from './pages/pdf-compare/PdfComparePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import GuidesPage from './pages/GuidesPage';
import FaqPage from './pages/FaqPage';
import ScrollToTop from './components/ScrollToTop';
import PdfToWordPage from './pages/pdfToWord/PdfToWordPage';
import PdfToExcelPage from './pages/pdfToExcel/PdfToExcelPage';
import PdfToImagePage from './pages/pdfToImage/PdfToImagePage';
import RotatePage from './pages/rotate/RotatePage';
import MarkdownPage from './pages/markdown/MarkdownPage';
import { HelmetProvider } from 'react-helmet-async';
import InvoiceRecognitionPage from './pages/invoice/InvoiceRecognitionPage';
import EditPagesPage from './pages/edit-pages/EditPagesPage';
import { PDFWorkflowProvider } from './contexts/PDFWorkflowContext';


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
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PDFWorkflowProvider>
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
                <ScrollToTop />
                <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/merge" element={<MergePage />} />
                  <Route path="/stamp" element={<StampPage />} />
                  <Route path="/split" element={<SplitPage />} />
                  <Route path="/compress" element={<CompressPage />} />
                  <Route path="/sign" element={<SignPage />} />
                  <Route path="/extract" element={<ExtractPage />} />
                  <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
                  <Route path="/pdf-compare" element={<PdfComparePage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                  <Route path="/guides" element={<GuidesPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/guides/:toolId" element={<GuidesPage />} />
                  <Route path="/pdf-to-word" element={<PdfToWordPage />} />
                  <Route path="/pdf-to-excel" element={<PdfToExcelPage />} />
                  <Route path="/pdf-to-image" element={<PdfToImagePage />} />
                  <Route path="/rotate" element={<RotatePage />} />
                  <Route path="/document-to-markdown" element={<MarkdownPage />} />
                  <Route path="/invoice-recognition" element={<InvoiceRecognitionPage />} />
                  <Route path="/edit-pages" element={<EditPagesPage />} />
                </Routes>
                </Layout>
              </BrowserRouter>
            </Box>
            <Footer />
          </Box>
        </PDFWorkflowProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
