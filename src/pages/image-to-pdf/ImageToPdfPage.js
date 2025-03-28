import React, { useState, useCallback, useRef } from 'react';
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
  Divider,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  Backdrop
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  Delete as DeleteIcon,
  Download as DownloadIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
  HighQuality as HighQualityIcon,
  Compress as CompressIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { useImageToPdf } from '../../hooks/image-to-pdf/useImageToPdf';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

export default function ImageToPdfPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);
  
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
    handlePdfQualityChange,
    pageFormat,
    setPageFormat,
    pageOrientation,
    setPageOrientation,
    pageMargin,
    setPageMargin,
    imagesPerPage,
    setImagesPerPage,
    fitMethod,
    setFitMethod,
    addPageNumbers,
    setAddPageNumbers,
    customFilename,
    setCustomFilename,
    watermarkText,
    setWatermarkText,
    previewMode,
    previewUrl,
    setPreviewMode,
    handlePreviewPdf,
    handleClosePreview
  } = useImageToPdf();
  
  // 处理文件拖放
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

  // 文件选择处理
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
      // 重置文件输入以允许选择相同文件
      e.target.value = '';
    }
  };

  // 点击上传区域
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
              onClick={handleUploadClick}
            >
              <input
                type="file"
                ref={fileInputRef}
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
                      disabled={loading}
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
                
                <DraggableImageList images={images} handleRemoveImage={handleRemoveImage} handleDragEnd={handleDragEnd} loading={loading} isMobile={isMobile} />
                
                {/* PDF质量选项 */}
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
            
            {/* 页面设置选项 */}
            <Paper elevation={0} sx={{ p: 2, mt: 3, mb: 3, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                {t('imageToPdf.pageSettings') || "页面设置"}
              </Typography>
              
              <Grid container spacing={2}>
                {/* 纸张大小 */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('imageToPdf.pageSize') || "纸张大小"}</InputLabel>
                    <Select
                      value={pageFormat}
                      onChange={(e) => setPageFormat(e.target.value)}
                      label={t('imageToPdf.pageSize') || "纸张大小"}
                    >
                      <MenuItem value="a4">A4</MenuItem>
                      <MenuItem value="letter">Letter</MenuItem>
                      <MenuItem value="a3">A3</MenuItem>
                      <MenuItem value="custom">{t('imageToPdf.custom') || "自定义"}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* 页面方向 */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('imageToPdf.orientation') || "页面方向"}</InputLabel>
                    <Select
                      value={pageOrientation}
                      onChange={(e) => setPageOrientation(e.target.value)}
                      label={t('imageToPdf.orientation') || "页面方向"}
                    >
                      <MenuItem value="portrait">{t('imageToPdf.portrait') || "纵向"}</MenuItem>
                      <MenuItem value="landscape">{t('imageToPdf.landscape') || "横向"}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* 每页图片数 */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('imageToPdf.imagesPerPage') || "每页图片数"}</InputLabel>
                    <Select
                      value={imagesPerPage}
                      onChange={(e) => setImagesPerPage(e.target.value)}
                      label={t('imageToPdf.imagesPerPage') || "每页图片数"}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={6}>6</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* 高级选项 */}
            <Paper elevation={0} sx={{ p: 2, mt: 3, mb: 3, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                <TuneIcon sx={{ mr: 1, fontSize: 20 }} />
                {t('imageToPdf.advancedOptions') || "高级选项"}
              </Typography>
              
              <Grid container spacing={2}>
                {/* 添加页码 */}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={addPageNumbers}
                        onChange={(e) => setAddPageNumbers(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={t('imageToPdf.addPageNumbers') || "添加页码"}
                  />
                </Grid>
                
                {/* 自定义文件名 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('imageToPdf.customFilename') || "自定义文件名"}
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={t('imageToPdf.leaveBlankForDefault') || "留空使用默认名称"}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">.pdf</InputAdornment>,
                    }}
                  />
                </Grid>
                
                {/* 水印文本 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('imageToPdf.watermarkText') || "水印文本"}
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder={t('imageToPdf.optionalWatermark') || "可选水印文本"}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 预览按钮 */}
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<VisibilityIcon />}
              fullWidth
              disabled={loading || images.length === 0}
              onClick={handlePreviewPdf}
              sx={{ 
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2,
                mb: 2
              }}
            >
              {t('imageToPdf.previewPdf') || "预览PDF"}
            </Button>

            {/* 转换按钮 */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              fullWidth
              disabled={loading || images.length === 0}
              onClick={() => handleGeneratePdf(false)}
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

      {/* PDF预览对话框 */}
      {previewMode && previewUrl && (
        <Dialog
          open={previewMode}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { 
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }
          }}
        >
          <DialogContent sx={{ flex: 1, p: 0, overflow: 'hidden' }}>
            <iframe 
              src={previewUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
              title="PDF Preview"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleClosePreview} color="inherit">
              {t('imageToPdf.closePdfPreview') || "关闭预览"}
            </Button>
            <Button 
              onClick={() => {
                handleClosePreview();
                handleGeneratePdf(false);
              }} 
              color="primary" 
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              {t('imageToPdf.downloadPdf') || "下载PDF"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* 加载中遮罩 */}
      <Backdrop
        sx={{ 
          color: '#fff',
          zIndex: theme.zIndex.drawer + 1
        }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('imageToPdf.processing') || "正在处理图片..."}
          </Typography>
        </Box>
      </Backdrop>
    </Container>
  );
}

// 图片拖拽组件
const DraggableImageList = ({ images, handleRemoveImage, handleDragEnd, loading, isMobile }) => {
  const { t } = useTranslation();
  
  const onDragEnd = (result) => {
    // 如果没有目标位置或位置没变，则不执行任何操作
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // 调用父组件的处理函数
    handleDragEnd(result);
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable 
        droppableId="image-list" 
        direction={isMobile ? "vertical" : "horizontal"} 
        type="IMAGE"
      >
        {(provided) => (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2,
              p: 2,
              minHeight: '150px',
              bgcolor: '#f5f5f5',
              borderRadius: 1
            }}
          >
            {images.map((image, index) => (
              <Draggable 
                key={image.id} 
                draggableId={image.id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    elevation={snapshot.isDragging ? 8 : 1}
                    sx={{
                      width: isMobile ? '100%' : '150px',
                      height: '230px',
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      transition: 'box-shadow 0.2s ease',
                      ...provided.draggableProps.style
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 2
                      }}
                    >
                      <DragIcon fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {index + 1}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveImage(image.id);
                        }}
                        sx={{ 
                          color: 'white', 
                          p: 0.25
                        }}
                        disabled={loading}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{
                      width: '100%',
                      height: '180px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f8f8f8'
                    }}>
                      <img 
                        src={image.preview} 
                        alt={`Image ${index + 1}`}
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '180px',
                          objectFit: 'contain',
                          pointerEvents: 'none'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      p: 0.5,
                      fontSize: '10px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center'
                    }}>
                      {image.name}
                    </Box>
                  </Paper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}; 