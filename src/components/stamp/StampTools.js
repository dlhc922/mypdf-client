import React, { useState, useEffect } from 'react';
import { 
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  AddPhotoAlternate,
  Delete,
  Rotate90DegreesCcw,
  Create
} from '@mui/icons-material';
import { useStampContext } from '../../contexts/StampContext';
import PageSelectDialog from './PageSelectDialog';
import FileDownload from '../common/FileDownload';
import { useTranslation } from 'react-i18next';
import StampMakerDialog from './StampMakerDialog';

function StampTools() {
  const { t } = useTranslation();
  const { 
    file,
    numPages,
    stampConfig,
    handleStampConfigChange,
    handleStampImageSelect,
    handleClearStampImage,
    handleStampPositionChange,
    handleStampRotationChange,
    toggleRandomAngle,
    handleSubmit,
    loading,
    error,
    stampedFileUrl
  } = useStampContext();

  // 页面选择对话框
  const [pageSelectOpen, setPageSelectOpen] = useState(false);
  // 下载对话框控制
  const [downloadOpen, setDownloadOpen] = useState(false);
  // 添加状态控制制作印章对话框
  const [stampMakerOpen, setStampMakerOpen] = useState(false);

  // 监听处理状态，显示下载对话框
  useEffect(() => {
    if (loading || error || stampedFileUrl) {
      setDownloadOpen(true);
    }
  }, [loading, error, stampedFileUrl]);

  const handleDownloadClose = () => {
    if (!loading) {
      setDownloadOpen(false);
    }
  };

  // 处理生成按钮点击
  const handleGenerateClick = async () => {
    await handleSubmit();
    // 不需要自动下载，让用户通过对话框下载
  };

  // 预览图片
  const renderStampPreview = () => {
    if (!stampConfig?.imageUrl) return null;
    
    return (
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        height: 150,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <img 
          src={stampConfig.imageUrl}
          alt={t('stamp.stampPreviewText')}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `rotate(${stampConfig?.rotation || 0}deg)`
          }}
        />
        <IconButton
          size="small"
          sx={{ position: 'absolute', top: 4, right: 4 }}
          onClick={handleClearStampImage}
        >
          <Delete />
        </IconButton>
      </Box>
    );
  };

  const handlePagesChange = (newPages) => {
    handleStampConfigChange('selectedPages', newPages);
  };

  // 确保当前页面设置存在，如果不存在则使用默认值或全局位置设置
  const currentPageSettings = stampConfig.currentPage ? 
    (stampConfig.pageSettings?.[stampConfig.currentPage] || {
      position: stampConfig.position || { x: 120, y: 190 },
      rotation: 0
    }) : {
      position: stampConfig.position || { x: 120, y: 190 },
      rotation: 0
    };

  useEffect(() => {
    // 初始化所有印章的默认位置和角度
    if (stampConfig && !stampConfig.pageSettings) {
      const initialSettings = {};
      for (let i = 1; i <= stampConfig.numPages; i++) {
        initialSettings[i] = { position: { x: 50, y: 50 }, rotation: 0 };
      }
      handleStampConfigChange('pageSettings', initialSettings);
    }
  }, [stampConfig, handleStampConfigChange]);

  const handlePositionChange = (axis) => (event) => {
    const newValue = Number(event.target.value);
    if (stampConfig.currentPage) {
      // 如果有选中页面，更新该页面的设置
      handleStampConfigChange('pageSettings', {
        ...stampConfig.pageSettings,
        [stampConfig.currentPage]: {
          ...(stampConfig.pageSettings?.[stampConfig.currentPage] || { rotation: 0 }),
          position: { 
            ...currentPageSettings.position, 
            [axis]: newValue 
          }
        }
      });
    } else {
      // 如果没有选中页面，更新默认位置
      handleStampConfigChange('position', { 
        ...currentPageSettings.position, 
        [axis]: newValue 
      });
    }
  };

  const handleRotationChange = (event, newValue) => {
    if (stampConfig.currentPage) {
      // 更新当前页面的印章旋转角度
      handleStampConfigChange('pageSettings', {
        ...stampConfig.pageSettings,
        [stampConfig.currentPage]: {
          ...(stampConfig.pageSettings?.[stampConfig.currentPage] || { position: stampConfig.position || { x: 120, y: 190 } }),
          rotation: newValue
        }
      });
    }
  };

  const handleStraddleYChange = (event, newValue) => {
    handleStampConfigChange('straddleY', newValue);
  };

  // 处理制作的印章图片
  const handleStampMade = (processedImageUrl) => {
    // 可以直接用作印章图片
    handleStampConfigChange('imageUrl', processedImageUrl);
    setStampMakerOpen(false);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: 280,
        height: '100%',
        p: 1.5,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '& .MuiTextField-root': {
          boxSizing: 'border-box',
          width: '90%',
          maxWidth: '90%'
        },
        '& .MuiStack-root': {
          width: '90%',
          margin: '0 auto'
        },
        '& .MuiButton-root': {
          width: '90%',
          margin: '0 auto'
        },
        '& .MuiSlider-root': {
          width: '90%',
          margin: '0 auto'
        }
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>
        {t('stamp.stampSettings')}
      </Typography>

      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {file ? (
          <Stack spacing={1.5}>
            {/* 印章图片上传 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('stamp.image')}
              </Typography>
              <input
                type="file"
                accept="image/png"
                style={{ display: 'none' }}
                id="stamp-image-input"
                onChange={handleStampImageSelect}
                key={stampConfig?.imageUrl || 'no-image'}
              />
              {!stampConfig.imageUrl ? (
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{ 
                    ml: 0  // 移除负边距
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="stamp-image-input"
                    startIcon={<AddPhotoAlternate />}
                    size="small"
                  >
                    {t('stamp.selectStampImage')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setStampMakerOpen(true)}
                    startIcon={<Create />}
                    size="small"
                  >
                    {t('stamp.makeTransparentStamp')}
                  </Button>
                </Stack>
              ) : renderStampPreview()}
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ ml: 0 }}  // 确保提示文字也没有额外的边距
              >
                {t('stamp.transparentPngHint')}
              </Typography>
            </Stack>

            <Divider />

            {/* 印章尺寸设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('stamp.size')}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={stampConfig?.size || 40}
                onChange={(e) => {
                  const newSize = Math.max(10, Math.min(100, Number(e.target.value)));
                  handleStampConfigChange('size', newSize);
                }}
                inputProps={{ 
                  min: 10, 
                  max: 100,
                  step: 1
                }}
                helperText={t('stamp.sizeHelper')}
                sx={{ width: '100%', maxWidth: 200 }}
              />
            </Stack>

            <Divider />

            {/* 印章位置和角度 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('stamp.positionAndAngle')}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ width: '90%' }}>
                <TextField
                  label="X"
                  type="number"
                  size="small"
                  value={currentPageSettings?.position?.x ?? 50}
                  onChange={handlePositionChange('x')}
                  disabled={!stampConfig.imageUrl}
                  sx={{ width: '50% !important' }}
                />
                <TextField
                  label="Y"
                  type="number"
                  size="small"
                  value={currentPageSettings?.position?.y ?? 50}
                  onChange={handlePositionChange('y')}
                  disabled={!stampConfig.imageUrl}
                  sx={{ width: '50% !important' }}
                />
              </Stack>
              {stampConfig.currentPage ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Slider
                    value={currentPageSettings?.rotation ?? 0}
                    onChange={(event, newValue) => handleStampRotationChange(newValue)}
                    min={0}
                    max={360}
                    valueLabelDisplay="auto"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <IconButton 
                    size="small"
                    onClick={() => handleStampRotationChange(0)}
                  >
                    <Rotate90DegreesCcw />
                  </IconButton>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {t('stamp.positionHint')}
                </Typography>
              )}
            </Stack>

            <Divider />

            {/* 页面选择 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('stamp.pages')}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setPageSelectOpen(true)}
                size="small"
              >
                {t('stamp.selectPages')}
              </Button>
              <Typography variant="caption">
                {t('stamp.selectedPages', { count: stampConfig.selectedPages.length })}
              </Typography>
            </Stack>

            <Divider />

            {/* 骑缝章设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('stamp.straddle')}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={stampConfig.isStraddle}
                    onChange={(e) => {
                      const isStraddle = e.target.checked;
                      handleStampConfigChange('isStraddle', isStraddle);
                      if (isStraddle) {
                        handleStampConfigChange('straddleY', 140);
                        handleStampConfigChange('position', { x: 120, y: 190 });
                        handleStampConfigChange('straddleY', 141);
                        handleStampConfigChange('straddleY', 140);
                      }
                    }}
                    size="small"
                  />
                }
                label={t('stamp.enableStraddle')}
              />
              {stampConfig.isStraddle && (
                <>
                  <TextField
                    label={t('stamp.verticalPosition')}
                    type="number"
                    size="small"
                    value={stampConfig.straddleY || 140}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(297, Number(e.target.value)));
                      handleStampConfigChange('straddleY', value);
                    }}
                    inputProps={{
                      min: 0,
                      max: 297,
                      step: 1
                    }}
                    helperText={t('stamp.verticalPositionHint')}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t('stamp.straddleDistribution')}
                  </Typography>
                </>
              )}
            </Stack>

            <Divider />

            {/* 修改生成按钮 */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateClick}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? t('stamp.processing') : t('stamp.addStamp')}
            </Button>

            {/* 删除图像质量设置部分 */}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            {t('stamp.noFileSelected')}
          </Typography>
        )}
      </Box>

      {/* 页面选择对话框 */}
      <PageSelectDialog
        open={pageSelectOpen}
        onClose={() => setPageSelectOpen(false)}
        file={file}
        numPages={numPages}
        selectedPages={stampConfig?.selectedPages || []}
        onPagesChange={handlePagesChange}
      />

      {/* 文件下载对话框 */}
      <FileDownload
        fileUrl={stampedFileUrl}
        loading={loading}
        error={error}
        fileName="stamped.pdf"
        successMessage={t('stamp.successMessage')}
        loadingMessage={t('stamp.loadingMessage')}
        onClose={handleDownloadClose}
        open={downloadOpen}
      />

      {/* 添加制作印章对话框 */}
      <StampMakerDialog
        open={stampMakerOpen}
        onClose={() => setStampMakerOpen(false)}
        onStampMade={handleStampMade}
      />
    </Paper>
  );
}

export default StampTools; 