import React, { useState, useCallback, useRef, useMemo } from 'react';
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useImageToPdf } from '../../hooks/image-to-pdf/useImageToPdf';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

// =======================================================================
//  Sortable Image Item Component
// =======================================================================
const SortableImageItem = ({ image, handleRemoveImage, loading, isMobile }) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} ref={setNodeRef} style={style} {...attributes}>
      <Paper 
        elevation={isDragging ? 6 : 2}
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          '& .MuiIconButton-root': {
            transition: 'opacity 0.2s',
          },
          '&:hover .MuiIconButton-root': {
            opacity: 1,
          },
        }}
        {...listeners}
      >
        <img
          src={image.preview}
          alt={image.name}
          style={{
            width: '100%',
            height: 150,
            objectFit: 'contain',
            marginBottom: '8px',
            borderRadius: '4px',
          }}
        />
        <Tooltip title={image.name}>
          <Typography noWrap variant="body2" sx={{ width: '100%', textAlign: 'center' }}>
            {image.name}
          </Typography>
        </Tooltip>
        <Typography variant="caption" color="textSecondary">
          {`${image.width} x ${image.height}`}
        </Typography>
        <IconButton
          size="small"
          onClick={() => handleRemoveImage(image.id)}
          disabled={loading}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: 'rgba(255,255,255,0.7)',
            opacity: { xs: 1, sm: 0 },
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Grid>
  );
};

// =======================================================================
//  Main Page Component
// =======================================================================
export default function ImageToPdfPage() {
  const { t, i18n } = useTranslation();
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
    handleImageReorder,
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
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const imageIds = useMemo(() => images.map(img => img.id), [images]);
  
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
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('imageToPdf.seoTitle', '图片转PDF转换器 - JPG/PNG转PDF | 免费在线工具')}</title>
        <meta name="description" content={t('imageToPdf.seoDescription', '免费在线图片转PDF工具，支持JPG、PNG、GIF等多种图片格式。可调整排序、质量和页面设置，浏览器本地处理保护隐私，无需上传文件。')} />
        <meta name="keywords" content={t('imageToPdf.seoKeywords', '图片转PDF,JPG转PDF,PNG转PDF,图片合并为PDF,图片排序转PDF,多图转PDF,免费图片转换器,在线PDF工具')} />
        <meta property="og:title" content={t('imageToPdf.seoTitle', '图片转PDF转换器 - JPG/PNG转PDF | 免费在线工具')} />
        <meta property="og:description" content={t('imageToPdf.seoDescription', '免费在线图片转PDF工具，支持JPG、PNG、GIF等多种图片格式。可调整排序、质量和页面设置，浏览器本地处理保护隐私，无需上传文件。')} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={t('imageToPdf.seoTitle', '图片转PDF转换器 - JPG/PNG转PDF | 免费在线工具')} />
        <meta name="twitter:description" content={t('imageToPdf.seoDescription', '免费在线图片转PDF工具，支持JPG、PNG、GIF等多种图片格式。可调整排序、质量和页面设置，浏览器本地处理保护隐私，无需上传文件。')} />
        <link rel="canonical" href={window.location.href.split('?')[0]} />
        
        {/* JSON-LD structured data for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': t('imageToPdf.seoTitle', '图片转PDF转换器 - JPG/PNG转PDF'),
            'description': t('imageToPdf.seoDescription', '免费在线图片转PDF工具，支持JPG、PNG、GIF等多种图片格式。可调整排序、质量和页面设置，浏览器本地处理保护隐私，无需上传文件。'),
            'applicationCategory': 'UtilitiesApplication',
            'operatingSystem': 'Any',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'CNY'
            },
            'supportedFileFormats': [
              'JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP'
            ]
          })}
        </script>
      </Helmet>
      
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
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageReorder}>
                  <SortableContext items={imageIds} strategy={rectSortingStrategy}>
                    <Grid container spacing={2}>
                      {images.map((image) => (
                        <SortableImageItem
                          key={image.id}
                          image={image}
                          handleRemoveImage={handleRemoveImage}
                          loading={loading}
                          isMobile={isMobile}
                        />
                      ))}
                    </Grid>
                  </SortableContext>
                </DndContext>
                
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