import React, { useState, useCallback } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  IconButton,
  useMediaQuery,
  Alert,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  Delete as DeleteIcon,
  Download as DownloadIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
  HighQuality as HighQualityIcon,
  Compress as CompressIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useImageToPdf } from '../../hooks/image-to-pdf/useImageToPdf';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';


export default function ImageToPdfPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    images,
    loading,
    error,
    message,
    pdfQuality,
    setPdfQuality,
    handleImageUpload,
    handleRemoveImage,
    handleRemoveAllImages,
    handleDragEnd,
    handleGeneratePdf,
    handlePdfQualityChange
  } = useImageToPdf();
  
  // 处理文件拖放
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  }, [handleImageUpload]);

  // 文件选择处理
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleImageUpload(files);
  };

  return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                gutterBottom
                align="center"
                sx={{ fontWeight: 'bold', mb: 3 }}
              >
                {t('imageToPdf.title') || "图片转PDF"}
              </Typography>
              
              {/* 上传区域 */}
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  mb: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {t('imageToPdf.dropImages') || "拖放图片到这里或点击上传"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('imageToPdf.supportedFormats') || "支持JPG、PNG、GIF等格式"}
                </Typography>
              </Box>

              <DeviceCompatibilityAlert mobileCompatible={true} toolName="图片转PDF"></DeviceCompatibilityAlert>
              
              {/* 图片列表 */}
              {images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {t('imageToPdf.selectedImages', { count: images.length }) || `已选择 ${images.length} 张图片`}
                    </Typography>
                    <Tooltip title={t('imageToPdf.removeAll') || "移除所有图片"}>
                      <IconButton 
                        onClick={handleRemoveAllImages}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* 拖拽排序区域 */}
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <DragIcon sx={{ mr: 1, fontSize: 20 }} />
                    {t('imageToPdf.dragToReorder') || "拖动调整顺序"}
                  </Typography>
                  
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div style={{ width: '100%' }}>
                      <Droppable droppableId="image-list" direction={isMobile ? "vertical" : "horizontal"}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                              display: 'flex',
                              flexDirection: isMobile ? 'column' : 'row',
                              flexWrap: isMobile ? 'nowrap' : 'wrap',
                              gap: '16px',
                              padding: '16px',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              minHeight: '150px'
                            }}
                          >
                            {images.map((image, index) => (
                              <Draggable key={image.id} draggableId={String(image.id)} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      width: isMobile ? '100%' : '150px',
                                      maxWidth: isMobile ? '100%' : '150px',
                                      position: 'relative',
                                      borderRadius: '4px',
                                      overflow: 'hidden',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                      backgroundColor: '#fff',
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    <div style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      backgroundColor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      padding: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      zIndex: 1
                                    }}>
                                      <DragIcon style={{ fontSize: '16px' }} />
                                      <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                                        {index + 1}
                                      </span>
                                      <div style={{ flexGrow: 1 }} />
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveImage(image.id);
                                        }}
                                        style={{ 
                                          color: 'white', 
                                          padding: '2px'
                                        }}
                                      >
                                        <CloseIcon style={{ fontSize: '16px' }} />
                                      </IconButton>
                                    </div>
                                    <div style={{
                                      width: '100%',
                                      textAlign: 'center',
                                      lineHeight: 0
                                    }}>
                                      <img 
                                        src={image.preview} 
                                        alt={`Image ${index + 1}`}
                                        style={{ 
                                          maxWidth: '100%',
                                          height: 'auto',
                                          maxHeight: isMobile ? '250px' : '300px',
                                          display: 'inline-block'
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </DragDropContext>
                  
                  {/* PDF质量选项 - 移到图片预览区下方 */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 3,
                      mb: 3, 
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <HighQualityIcon sx={{ mr: 1, fontSize: 20 }} />
                      {t('imageToPdf.pdfQuality') || "PDF质量设置"}
                    </Typography>
                    
                    <RadioGroup
                      row={!isMobile}
                      name="pdf-quality"
                      value={pdfQuality}
                      onChange={(e) => handlePdfQualityChange(e.target.value)}
                      sx={{ mt: 1 }}
                    >
                      <FormControlLabel
                        value="low"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                              <CompressIcon sx={{ mr: 0.5, fontSize: 16 }} />
                              {t('imageToPdf.lowQuality') || "低质量"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('imageToPdf.smallerFile') || "文件较小，适合分享"}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          border: '1px solid',
                          borderColor: pdfQuality === 'low' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          p: 1,
                          flex: 1,
                          mr: 1,
                          bgcolor: pdfQuality === 'low' ? 'primary.lighter' : 'transparent'
                        }}
                      />
                      <FormControlLabel
                        value="medium"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('imageToPdf.mediumQuality') || "中等质量"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('imageToPdf.balancedOption') || "平衡大小和质量"}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          border: '1px solid',
                          borderColor: pdfQuality === 'medium' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          p: 1,
                          flex: 1,
                          mr: 1,
                          bgcolor: pdfQuality === 'medium' ? 'primary.lighter' : 'transparent'
                        }}
                      />
                      <FormControlLabel
                        value="high"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                              <HighQualityIcon sx={{ mr: 0.5, fontSize: 16 }} />
                              {t('imageToPdf.highQuality') || "高质量"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('imageToPdf.largerFile') || "文件较大，清晰度高"}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          border: '1px solid',
                          borderColor: pdfQuality === 'high' ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          p: 1,
                          flex: 1,
                          bgcolor: pdfQuality === 'high' ? 'primary.lighter' : 'transparent'
                        }}
                      />
                    </RadioGroup>
                  </Paper>
                </Box>
              )}
              
              {/* 转换按钮 */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                fullWidth
                disabled={loading || images.length === 0}
                onClick={handleGeneratePdf}
                sx={{ 
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              >
                {loading 
                  ? (t('imageToPdf.generating') || "正在生成PDF...") 
                  : (t('imageToPdf.generatePdf') || "生成PDF")}
              </Button>
              
              {/* 错误和消息提示 */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              {message && !error && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {message}
                </Alert>
              )}
              
              {/* 使用说明 */}
              {images.length === 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('imageToPdf.howToUse') || "使用说明"}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      1. {t('imageToPdf.step1') || "上传一张或多张图片"}
                    </Typography>
                    <Typography variant="body2">
                      2. {t('imageToPdf.step2') || "拖动图片调整顺序（可选）"}
                    </Typography>
                    <Typography variant="body2">
                      3. {t('imageToPdf.step3') || "调整PDF质量设置（可选）"}
                    </Typography>
                    <Typography variant="body2">
                      4. {t('imageToPdf.step4') || "点击生成PDF按钮"}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    {t('imageToPdf.privacyNote') || "注意：所有处理都在您的浏览器中完成，图片不会上传到服务器。"}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
  );
} 