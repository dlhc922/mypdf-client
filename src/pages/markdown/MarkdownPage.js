import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  ContentCopy as ContentCopyIcon,
  Code as CodeIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Article as ArticleIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useMarkdown } from '../../hooks/markdown/useMarkdown';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';
import FilePreview from '../../components/FilePreview';
import ReactMarkdown from 'react-markdown';

// Custom styled preview container
const MarkdownPreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '14px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  overflowX: 'auto',
  maxHeight: '500px',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  border: `1px solid ${theme.palette.divider}`
}));

// Custom Text Preview component
const TextPreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '14px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  overflowX: 'auto',
  maxHeight: '500px',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  border: `1px solid ${theme.palette.divider}`
}));

export default function MarkdownPage() {
  const {
    file,
    fileUrl,
    fileType,
    loading,
    error,
    message,
    convertedMarkdown,
    handleFileSelect,
    handleConvert,
    handleDownload,
    setError,
    setMessage,
    isPreviewable
  } = useMarkdown();

  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [useOcr, setUseOcr] = useState(false);
  const [preserveTables, setPreserveTables] = useState(true);

  // Zoom control
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // Document load success callback
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    setMessage(t('documentToMarkdown.steps.documentLoaded', { pages: numPages }));
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    if (convertedMarkdown) {
      navigator.clipboard.writeText(convertedMarkdown)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Page navigation
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages || 1));

  // Handle conversion with options
  const handleConvertWithOptions = () => {
    // 确保传递正确的布尔值
    const options = {
      useOcr: useOcr === true,
      preserveTables: preserveTables === true
    };
    
    console.log('MarkdownPage 选项:', options);
    console.log('useOcr类型:', typeof useOcr, 'useOcr值:', useOcr);
    console.log('preserveTables类型:', typeof preserveTables, 'preserveTables值:', preserveTables);
    
    handleConvert(options);
  };

  // Load text file content for preview
  useEffect(() => {
    if (file && ['text', 'html'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target.result);
      };
      reader.readAsText(file);
    } else {
      setTextContent(null);
    }
  }, [file, fileType]);

  // Get file type icon
  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'pdf': return <PdfIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'word': return <ArticleIcon sx={{ fontSize: 60, color: '#2b579a', opacity: 0.7 }} />;
      case 'excel': return <FileIcon sx={{ fontSize: 60, color: '#217346', opacity: 0.7 }} />;
      case 'powerpoint': return <FileIcon sx={{ fontSize: 60, color: '#d24726', opacity: 0.7 }} />;
      case 'image': return <ImageIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'audio': return <AudioIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'video': return <VideoIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      case 'text': 
      case 'html':
      case 'data': return <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7 }} />;
      default: return <FileIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.7 }} />;
    }
  };

  // Get accept string for file input
  const getAcceptString = () => {
    return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.html,.htm,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.webm';
  };

  // Render file preview based on type
  const renderFilePreview = () => {
    return (
      <FilePreview 
        file={file} 
        fileUrl={fileUrl} 
        fileType={fileType} 
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* SEO metadata */}
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('documentToMarkdown.seo.title')}</title>
        <meta name="description" content={t('documentToMarkdown.seo.description')} />
        <meta name="keywords" content={t('documentToMarkdown.seo.keywords')} />
        <meta property="og:title" content={t('documentToMarkdown.seo.title')} />
        <meta property="og:description" content={t('documentToMarkdown.seo.description')} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={t('documentToMarkdown.seo.title')} />
        <meta name="twitter:description" content={t('documentToMarkdown.seo.description')} />
        <link rel="canonical" href={window.location.href} />
        {/* JSON-LD structured data for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': t('documentToMarkdown.seo.title'),
            'description': t('documentToMarkdown.seo.description'),
            'applicationCategory': 'DocumentConversion',
            'operatingSystem': 'Any',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            }
          })}
        </script>
      </Helmet>
      
      <DeviceCompatibilityAlert />
      <Grid container spacing={3}>
        {/* Left panel - File upload and preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
            <Typography variant="h6" gutterBottom>
              {t('documentToMarkdown.steps.preview')}
            </Typography>
            
            {/* File selection and actions */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<DescriptionIcon />}
              >
                {t('common.selectFile')}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept={getAcceptString()}
                  onChange={handleFileSelect}
                />
              </Button>
              
              {(fileType === 'pdf' || fileType === 'image') && (
                <>
                  <IconButton onClick={handleZoomIn}>
                    <ZoomIn />
                  </IconButton>
                  <IconButton onClick={handleZoomOut}>
                    <ZoomOut />
                  </IconButton>
                </>
              )}
            </Stack>
            
            {/* Supported formats hint */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('documentToMarkdown.supportedFormats')}
            </Typography>

            {/* File info */}
            {file && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {t('documentToMarkdown.steps.fileName')}: {file.name}
                </Typography>
                <Typography variant="body2">
                  {t('documentToMarkdown.steps.fileSize')}: {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Typography variant="body2">
                  {t('documentToMarkdown.steps.fileType')}: {t(`documentToMarkdown.fileTypes.${fileType || 'unknown'}`)}
                </Typography>
              </Box>
            )}

            {/* File Preview */}
            {renderFilePreview()}
            
            {/* Error/message display */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {message && !error && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {message}
              </Alert>
            )}
          </Paper>
        </Grid>
        
        {/* Right panel - Conversion and results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
            <Typography variant="h6" gutterBottom>
              {t('documentToMarkdown.steps.conversion')}
            </Typography>
            
            {/* Conversion options */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={useOcr}
                    onChange={(e) => setUseOcr(e.target.checked)}
                    name="useOcr"
                  />
                }
                label={t('documentToMarkdown.options.useOcr', 'OCR识别')}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={preserveTables}
                    onChange={(e) => setPreserveTables(e.target.checked)}
                    name="preserveTables"
                  />
                }
                label={t('documentToMarkdown.options.preserveTables', '保留表格')}
              />
            </Box>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleConvertWithOptions}
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CodeIcon />}
              >
                {loading ? t('common.processing') : t('documentToMarkdown.steps.convert')}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleDownload}
                disabled={!convertedMarkdown}
                startIcon={<DownloadIcon />}
              >
                {t('documentToMarkdown.steps.download')}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleCopyToClipboard}
                disabled={!convertedMarkdown}
                startIcon={<ContentCopyIcon />}
                color={copySuccess ? "success" : "primary"}
              >
                {copySuccess ? t('documentToMarkdown.steps.copied') : t('documentToMarkdown.steps.copy')}
              </Button>
            </Stack>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Markdown Preview with react-markdown */}
            {convertedMarkdown ? (
              <Box sx={{ 
                bgcolor: '#fff', 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                p: 2,
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('documentToMarkdown.steps.markdownPreview', '渲染预览')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {convertedMarkdown.length} {t('documentToMarkdown.steps.characters', '字符')}
                  </Typography>
                </Box>
                <ReactMarkdown>
                  {convertedMarkdown}
                </ReactMarkdown>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  p: 3,
                  borderRadius: 1,
                  flex: 1
                }}
              >
                <CodeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" align="center">
                  {t('documentToMarkdown.steps.placeholder')}
                </Typography>
              </Box>
            )}
            
            {/* Markdown Source Code */}
            {convertedMarkdown && (
              <MarkdownPreview sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('documentToMarkdown.steps.markdownSource', 'Markdown源码')}
                </Typography>
                {convertedMarkdown}
              </MarkdownPreview>
            )}
            
            {/* About section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('documentToMarkdown.aboutConversion.title')}
              </Typography>
              <Typography variant="body2" paragraph>
                {t('documentToMarkdown.aboutConversion.description')}
              </Typography>
              <Typography variant="body2" paragraph>
                {t('documentToMarkdown.aboutConversion.formats')}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 