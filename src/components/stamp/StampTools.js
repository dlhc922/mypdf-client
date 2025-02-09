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
  CircularProgress
} from '@mui/material';
import { 
  AddPhotoAlternate,
  Delete,
  Rotate90DegreesCcw
} from '@mui/icons-material';
import { useStampContext } from '../../contexts/StampContext';
import PageSelectDialog from './PageSelectDialog';
import FileDownload from '../common/FileDownload';

function StampTools() {
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
          alt="印章预览"
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
        印章设置
      </Typography>

      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {file ? (
          <Stack spacing={1.5}>
            {/* 印章图片上传 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                印章图片
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
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="stamp-image-input"
                  startIcon={<AddPhotoAlternate />}
                  size="small"
                >
                  选择印章图片
                </Button>
              ) : renderStampPreview()}
              <Typography variant="caption" color="text.secondary">
                请选择透明背景的PNG图片
              </Typography>
            </Stack>

            <Divider />

            {/* 印章尺寸设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                印章尺寸 (mm)
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
                helperText="建议骑缝章尺寸：30-50mm"
                sx={{ width: '100%', maxWidth: 200 }}
              />
            </Stack>

            <Divider />

            {/* 印章位置和角度 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                印章位置和角度
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
                    onChange={handleRotationChange}
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
                  选择页面后可以调整印章角度
                </Typography>
              )}
            </Stack>

            <Divider />

            {/* 页面选择 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                印章页面
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setPageSelectOpen(true)}
                size="small"
              >
                选择盖章页面
              </Button>
              <Typography variant="caption">
                已选择 {stampConfig.selectedPages.length} 页
              </Typography>
            </Stack>

            <Divider />

            {/* 骑缝章设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                骑缝章
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
                      }
                    }}
                    size="small"
                  />
                }
                label="启用骑缝章"
              />
              {stampConfig.isStraddle && (
                <>
                  <TextField
                    label="纵向位置 (mm)"
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
                    helperText="0-297之间的数值，表示距离页面顶部的距离"
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    印章将均匀分布在所有页面的右侧边缘
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
              {loading ? '处理中...' : '添加印章'}
            </Button>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            请先选择 PDF 文件
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
        successMessage="PDF 盖章完成！"
        loadingMessage="正在处理盖章..."
        onClose={handleDownloadClose}
        open={downloadOpen}
      />
    </Paper>
  );
}

export default StampTools; 