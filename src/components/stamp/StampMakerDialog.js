import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  AddPhotoAlternate,
  Crop,
  Save,
  Undo,
  TuneRounded,
  ChangeCircle
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function StampMakerDialog({ open, onClose, onStampMade }) {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState();
  const [threshold, setThreshold] = useState(127);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const imageRef = useRef(null);
  const [scaledDimensions, setScaledDimensions] = useState({ width: 0, height: 0 });

  const handleImageSelect = (e) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // 计算缩放尺寸，保持比例，最大300px
          const maxSize = 300;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          setScaledDimensions({
            width: img.width * scale,
            height: img.height * scale
          });
        };
        img.src = reader.result;
        setImage(reader.result);
        setPreviewUrl(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const processImage = async () => {
    if (!imageRef.current) return;
    setProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (crop) {
        // 使用高分辨率处理
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        // 启用高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          imageRef.current,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        canvas.width = imageRef.current.naturalWidth;
        canvas.height = imageRef.current.naturalHeight;
        
        // 启用高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(imageRef.current, 0, 0);
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 改进的阈值处理算法
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        // 使用加权平均计算亮度，更符合人眼感知
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        if (brightness > threshold) {
          data[i + 3] = 0; // 完全透明
        } else {
          // 保持原始颜色，但确保不透明
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      // 使用最高质量PNG格式
      const processedImageUrl = canvas.toDataURL('image/png', 1.0);
      setPreviewUrl(processedImageUrl);
    } catch (error) {
      console.error('Image processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  // 实时预览效果
  useEffect(() => {
    if (image && !processing) {
      processImage();
    }
  }, [threshold, crop]);

  const handleSave = () => {
    if (previewUrl) {
      onStampMade(previewUrl);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.download = 'transparent-stamp.png';
      link.href = previewUrl;
      link.click();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: '1000px',
          height: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 1.5
      }}>
        {t('stamp.makeTransparentStamp')}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex' }}>
        {/* 左侧编辑区 */}
        <Box sx={{ 
          width: '50%', 
          borderRight: 1, 
          borderColor: 'divider',
          p: 3,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!image ? (
            <Paper
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default'
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="stamp-maker-input"
                onChange={handleImageSelect}
              />
              <Button
                variant="outlined"
                component="label"
                htmlFor="stamp-maker-input"
                startIcon={<AddPhotoAlternate />}
                sx={{ mb: 2 }}
              >
                {t('stamp.selectImage')}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {t('stamp.dragImageHint')}
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={{ 
                flex: 1, 
                overflow: 'hidden', 
                mb: 2,
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="stamp-maker-change-input"
                  onChange={handleImageSelect}
                />
                <Button
                  variant="contained"
                  component="label"
                  htmlFor="stamp-maker-change-input"
                  startIcon={<ChangeCircle />}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                    minWidth: 'auto',
                    padding: '4px 12px',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    boxShadow: 1
                  }}
                >
                  {t('stamp.changeImage')}
                </Button>
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imageRef}
                    src={image}
                    style={{ 
                      width: scaledDimensions.width,
                      height: scaledDimensions.height,
                      objectFit: 'contain'
                    }}
                    alt="Source"
                  />
                </ReactCrop>
                <Typography 
                  variant="caption" 
                  color="primary"
                  sx={{ 
                    display: 'block', 
                    mt: 1,
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}
                >
                  {t('stamp.cropHint')}
                </Typography>
              </Box>
              <Paper sx={{ p: 2 }} elevation={0} variant="outlined">
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TuneRounded sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="primary">
                      {t('stamp.threshold')}
                    </Typography>
                  </Box>
                  <Slider
                    value={threshold}
                    onChange={(e, v) => setThreshold(v)}
                    min={0}
                    max={255}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Stack>
              </Paper>
            </>
          )}
        </Box>

        {/* 右侧预览区 */}
        <Box sx={{ 
          width: '50%',
          p: 3,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {processing ? (
            <CircularProgress />
          ) : previewUrl ? (
            <Paper
              sx={{
                bgcolor: '#f0f0f0',
                backgroundImage: 'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 'fit-content',
                margin: 'auto'
              }}
            >
              <img
                src={previewUrl}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  display: 'block'
                }}
                alt="Preview"
              />
            </Paper>
          ) : (
            <Typography color="text.secondary">
              {t('stamp.previewHint')}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: 1, 
        borderColor: 'divider',
        px: 3,
        py: 1.5
      }}>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        {previewUrl && (
          <>
            <Button
              onClick={() => {
                setPreviewUrl(null);
                setCrop(undefined);
              }}
              startIcon={<Undo />}
            >
              {t('stamp.reprocess')}
            </Button>
            <Button
              onClick={handleDownload}
              startIcon={<Save />}
            >
              {t('stamp.save')}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
            >
              {t('stamp.useAsStamp')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default StampMakerDialog; 