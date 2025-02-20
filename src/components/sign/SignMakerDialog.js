import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Box,
  IconButton,
  Slider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete,
  Create,
  TextFields,
  Palette,
  Image as ImageIcon,
  Save,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function SignMakerDialog({ open, onClose, onConfirm }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [threshold, setThreshold] = useState(127);
  const [originalImage, setOriginalImage] = useState(null);

  // 初始化画布
  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // 提高像素密度，适配高分辨率显示。
      // 获取当前设备像素比，默认为1
      const dpr = window.devicePixelRatio || 1;
      // 获取canvas的实际显示尺寸（通过 DOM 获取）
      const rect = canvas.getBoundingClientRect();
      
      // 设置canvas的实际像素尺寸（比CSS尺寸更大）
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // 缩放绘图上下文，使绘制时使用原来的逻辑
      ctx.scale(dpr, dpr);
      
      // 开启高质量平滑渲染
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      clearCanvas();
    }
  }, [open]);

  // 获取正确的坐标
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // 处理图片上传
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // 清除画布
          clearCanvas();
          
          // 计算图片缩放比例以适应画布
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          ) * 0.8; // 留出一些边距
          
          // 计算居中位置
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          
          // 保存原始图片和位置信息
          setOriginalImage({
            img,
            x,
            y,
            width: img.width * scale,
            height: img.height * scale
          });
          
          // 绘制图片并立即应用阈值处理
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          applyThreshold();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 改进阈值处理函数
  const applyThreshold = () => {
    if (!originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 清除画布
    clearCanvas();

    // 重新绘制原始图片
    ctx.drawImage(
      originalImage.img,
      originalImage.x,
      originalImage.y,
      originalImage.width,
      originalImage.height
    );

    // 获取图片数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 应用改进的阈值处理
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      // 计算亮度
      const brightness = (r + g + b) / 3;

      // 如果是完全透明的像素，保持透明
      if (alpha === 0) {
        data[i + 3] = 0;
        continue;
      }

      // 应用阈值，将暗色部分保留，亮色部分变透明
      if (brightness > threshold) {
        // 亮色部分变透明
        data[i + 3] = 0;
      } else {
        // 暗色部分变黑色
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // 绘画相关函数
  const startDrawing = (e) => {
    if (mode !== 'draw') return;
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setLastPoint(coords);

    // 立即开始绘制点
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawing || mode !== 'draw') return;
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setLastPoint(coords);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 修改清除画布函数
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 清除整个画布，包括透明度
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 创建一个全透明的ImageData
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    // 将所有像素的alpha值设为0（完全透明）
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = 0;
    }
    // 将透明ImageData绘制到画布上
    ctx.putImageData(imageData, 0, 0);

    if (mode === 'image') {
      setOriginalImage(null);
    }
  };

  // 添加文字
  const addText = () => {
    if (!text) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    
    // 居中显示文字
    const textMetrics = ctx.measureText(text);
    const x = (canvas.width - textMetrics.width) / 2;
    const y = (canvas.height + fontSize / 2) / 2;
    
    ctx.fillText(text, x, y);
  };

  // 获取有内容区域的边界
  const getContentBounds = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    // 扫描画布上所有非透明像素
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // 如果没有找到任何内容，返回null
    if (maxX < 0) return null;

    // 添加一些内边距
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    };
  };

  // 生成签名图片
  const generateSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 获取内容边界
    const bounds = getContentBounds(ctx, canvas.width, canvas.height);
    
    if (!bounds) {
      alert(t('sign.noContent'));
      return;
    }

    // 创建新画布来存储裁剪后的内容
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = bounds.width;
    croppedCanvas.height = bounds.height;
    const croppedCtx = croppedCanvas.getContext('2d');

    // 复制内容区域到新画布
    croppedCtx.drawImage(
      canvas,
      bounds.x, bounds.y, bounds.width, bounds.height,
      0, 0, bounds.width, bounds.height
    );

    // 直接使用 base64 数据
    const imageData = croppedCanvas.toDataURL('image/png');
    onConfirm(imageData);
  };

  // 添加保存图片函数
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 获取内容边界
    const bounds = getContentBounds(ctx, canvas.width, canvas.height);
    
    if (!bounds) {
      alert(t('sign.noContent'));
      return;
    }

    // 创建新画布来存储裁剪后的内容
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = bounds.width;
    croppedCanvas.height = bounds.height;
    const croppedCtx = croppedCanvas.getContext('2d');

    // 复制内容区域到新画布
    croppedCtx.drawImage(
      canvas,
      bounds.x, bounds.y, bounds.width, bounds.height,
      0, 0, bounds.width, bounds.height
    );

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `signature_${new Date().getTime()}.png`; // 文件名带时间戳
    
    // 转换为PNG并触发下载
    croppedCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      URL.revokeObjectURL(url); // 清理URL
    }, 'image/png');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      PaperProps={{
        sx: {
          width: '800px',
          height: '650px',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {t('sign.createSignature')}
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Stack spacing={2}>
          <Tabs 
            value={mode} 
            onChange={(_, newValue) => setMode(newValue)}
            sx={{ 
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                py: 0
              }
            }}
          >
            <Tab value="draw" icon={<Create />} label={t('sign.draw')} />
            <Tab value="text" icon={<TextFields />} label={t('sign.text')} />
            <Tab value="image" icon={<ImageIcon />} label={t('sign.image')} />
          </Tabs>

          {/* 画布区域 */}
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              overflow: 'hidden',
              touchAction: 'none',
              height: mode === 'text' ? '200px' : '300px',
              width: '100%',
              position: 'relative',
            }}
          >
            {/* 透明背景网格 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                  linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                  linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
                `,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: '#ffffff',
                zIndex: 0
              }}
            />
            <canvas
              ref={canvasRef}
              width={800}
              height={mode === 'text' ? 200 : 300}
              style={{ 
                width: '100%', 
                height: '100%',
                cursor: mode === 'draw' ? 'crosshair' : 'default',
                position: 'relative',
                zIndex: 1
              }}
              onMouseDown={mode === 'draw' ? startDrawing : undefined}
              onMouseMove={mode === 'draw' ? draw : undefined}
              onMouseUp={mode === 'draw' ? stopDrawing : undefined}
              onMouseOut={mode === 'draw' ? stopDrawing : undefined}
              onTouchStart={mode === 'draw' ? startDrawing : undefined}
              onTouchMove={mode === 'draw' ? draw : undefined}
              onTouchEnd={mode === 'draw' ? stopDrawing : undefined}
            />
          </Box>

          {/* 工具栏和模式特定控件容器 */}
          <Box sx={{ height: mode === 'text' ? '150px' : '180px' }}>
            {/* 文字模式的工具栏 */}
            {mode === 'text' ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton 
                    onClick={clearCanvas} 
                    size="small"
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Palette sx={{ color }} />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: 30, height: 30 }}
                    />
                  </Stack>
                  <Box sx={{ width: 200 }}>
                    <Typography variant="caption" gutterBottom display="block">
                      {t('sign.fontSize')}
                    </Typography>
                    <Slider
                      value={fontSize}
                      onChange={(_, value) => setFontSize(value)}
                      min={12}
                      max={72}
                      size="small"
                    />
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label={t('sign.text')}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    size="small"
                    sx={{ width: '60%' }}
                  />
                  <Button 
                    onClick={addText} 
                    variant="outlined" 
                    size="small"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {t('sign.addText')}
                  </Button>
                </Stack>
              </Stack>
            ) : (
              // 其他模式的工具栏
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton 
                    onClick={clearCanvas} 
                    size="small"
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                  {mode !== 'image' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Palette sx={{ color }} />
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ width: 30, height: 30 }}
                      />
                    </Stack>
                  )}
                  {mode === 'draw' && (
                    <Box sx={{ width: 200 }}>
                      <Typography variant="caption" gutterBottom display="block">
                        {t('sign.lineWidth')}
                      </Typography>
                      <Slider
                        value={lineWidth}
                        onChange={(_, value) => setLineWidth(value)}
                        min={1}
                        max={10}
                        step={0.5}
                        size="small"
                      />
                    </Box>
                  )}
                </Stack>

                {/* 图片模式的特定控件 */}
                {mode === 'image' && (
                  <>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<ImageIcon />}
                        size="small"
                      >
                        {t('sign.selectImage')}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {t('sign.imageSupport')}
                      </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                      <Typography variant="caption" gutterBottom display="block">
                        {t('sign.threshold')}
                      </Typography>
                      <Slider
                        value={threshold}
                        onChange={(_, value) => {
                          setThreshold(value);
                          applyThreshold();
                        }}
                        min={0}
                        max={255}
                        size="small"
                      />
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleSaveImage}
          startIcon={<Save />}
        >
          {t('sign.saveImage')}
        </Button>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={generateSignature} variant="contained">
          {t('sign.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SignMakerDialog; 