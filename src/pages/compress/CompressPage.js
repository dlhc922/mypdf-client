import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  Button,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Close as CloseIcon,
  Description as FileIcon,
  Storage as SizeIcon,
  DateRange as DateIcon,
  Pages as PageIcon
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useCompress } from '../../hooks/compress/useCompress';

export default function CompressPage() {
  const {
    file,
    compressedFile,
    loading,
    error,
    message,
    quality,
    setQuality,
    handleFileSelect,
    handleCompress,
    handleDownload,
    setFile,
    setCompressedFile,
    setError,
    setMessage,
    formatFileSize,
    progress
  } = useCompress();

  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(0.8); // 增大初始预览大小

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.1));

  const handleClosePDF = () => {
    setFile(null);
    setCompressedFile(null);
    setNumPages(null);
    setScale(0.8);
    setError(null);
    setMessage(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* 左侧预览区域 */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '600px',
              position: 'relative'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6">文件预览</Typography>
              {file && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="关闭文件">
                    <IconButton 
                      onClick={handleClosePDF}
                      size="small"
                      color="error"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {!file ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: 3
                }}
              >
                <Button 
                  variant="contained" 
                  component="label"
                >
                  选择 PDF 文件
                  <input 
                    type="file" 
                    hidden 
                    accept="application/pdf" 
                    onChange={handleFileSelect}
                    onClick={(e) => e.target.value = null}
                  />
                </Button>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                {/* 文件预览卡片 */}
                <Paper
                  elevation={3}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    mb: 3,
                    width: '280px',  // 固定宽度
                    mx: 'auto'       // 水平居中
                  }}
                >
                  {/* PDF 缩略图 */}
                  <Box
                    sx={{
                      width: '220px',  // 略微增加宽度
                      height: '311px',  // 保持 A4 比例
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      borderRadius: 1,
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Document
                      file={file}
                      onLoadSuccess={onDocumentLoadSuccess}
                    >
                      <Page
                        pageNumber={1}
                        width={220}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </Document>
                  </Box>

                  {/* 文件信息 */}
                  <Box 
                    sx={{ 
                      mt: 3,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 500,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {file.name}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',  // 改为垂直排列
                        gap: 1,
                        color: 'text.secondary',
                        mt: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SizeIcon fontSize="small" />
                        <Typography variant="body2">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PageIcon fontSize="small" />
                        <Typography variant="body2">
                          {numPages} 页
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateIcon fontSize="small" />
                        <Typography variant="body2">
                          {new Date(file.lastModified).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右侧工具栏 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              压缩设置
            </Typography>
            
            <Box sx={{ my: 3 }}>
              <Typography gutterBottom>
                压缩质量: {quality}%
              </Typography>
              <Slider
                value={quality}
                onChange={(_, newValue) => setQuality(newValue)}
                min={10}
                max={100}
                step={10}
                marks
                valueLabelDisplay="auto"
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleCompress}
              disabled={loading || !file}
              sx={{ mb: 2, position: 'relative' }}
            >
              {loading ? (
                <CircularProgress 
                  size={20} 
                  color="inherit" 
                  sx={{ 
                    position: 'absolute',
                    left: 16
                  }} 
                />
              ) : '开始压缩'}
            </Button>

            {loading && (
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{
                  height: 8,
                  borderRadius: 1,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 1,
                  }
                }}
              />
            )}

            {error && (
              <Typography 
                color="error" 
                sx={{ mt: 2 }}
              >
                {error}
              </Typography>
            )}

            {message && (
              <Typography 
                color="success.main"
                sx={{ mt: 2 }}
              >
                {message}
              </Typography>
            )}

            {compressedFile && (
              <Button
                variant="outlined"
                onClick={() => handleDownload(compressedFile)}
                sx={{ mt: 2 }}
              >
                下载压缩后的文件
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 