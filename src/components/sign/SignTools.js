import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Slider,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit,
  AddPhotoAlternate,
  RotateRight,
  AspectRatio,
  Pages,
  Save as SaveIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSignContext } from '../../contexts/SignContext';
import SignMakerDialog from './SignMakerDialog';
import FileDownload from '../common/FileDownload';
import WorkflowIndicator from '../common/WorkflowIndicator';

function SignTools() {
  const { t } = useTranslation();
  const {
    signConfigs,
    currentSignIndex,
    setCurrentSignIndex,
    updateSignature,
    setSignConfigs,
    addSignatureToPage,
    generateSignedPdf,
    
    // 新增用于签名实例联动的上下文内容：
    signatureInstances,
    updateSignatureInstance,
    // currentEditingElement 的格式：
    // { type: 'config', id: <index> } 或 { type: 'instance', id: <instanceId> }
    currentEditingElement,
    setCurrentEditingElement,
    
    // 以下是下载PDF相关控制（与StampTools类似）
    signedFileUrl,
    downloadOpen,
    handleDownloadClose,
    loading,
    error,
    handleContinueToStamp,
    hasFile
  } = useSignContext();

  const [signMakerOpen, setSignMakerOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && currentSignIndex !== -1) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.naturalHeight / img.naturalWidth || 1;
          updateSignature(currentSignIndex, {
            imageUrl: e.target.result,
            aspectRatio: ratio,
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureCreate = (imageUrl) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth || 1;
      if (isCreatingNew) {
        const newIndex = signConfigs.length;
        setSignConfigs([
          ...signConfigs,
          {
            id: Date.now(),
            imageUrl,
            aspectRatio: ratio,
            size: 40,
            position: { x: 120, y: 190 },
            rotation: 0,
            selectedPages: [],
          },
        ]);
        setCurrentSignIndex(newIndex);
        setCurrentEditingElement({ type: 'config', id: newIndex });
      } else {
        updateSignature(currentSignIndex, { imageUrl, aspectRatio: ratio });
      }
      setSignMakerOpen(false);
    };
    img.src = imageUrl;
  };

  // 原有的签名列表和配置区域代码保持不变
  const currentSign = currentSignIndex !== -1 ? signConfigs[currentSignIndex] : null;

  console.log('Current signConfigs:', signConfigs);

  const handleSignatureUpdate = (index, updates) => {
    updateSignature(index, updates);
  };

  // -------------------------------
  // 以下为重构后的"当前签名设置"区域
  // 根据当前编辑对象（currentEditingElement）选择操作签名配置或签名实例
  // -------------------------------
  let currentElement = null;
  let updateCurrentElement = (updates) => {};
  // 如果当前编辑对象存在，且类型为 'instance'，则取 signatureInstances 中对应数据，
  // 否则取 signConfigs 中 currentSignIndex 对应的数据
  if (currentEditingElement && currentEditingElement.type === 'instance') {
    currentElement = signatureInstances.find(
      (instance) => instance.id === currentEditingElement.id
    );
    updateCurrentElement = (updates) => {
      updateSignatureInstance(currentEditingElement.id, updates);
    };
  } else {
    currentElement = currentSign;
    updateCurrentElement = (updates) => {
      if (currentSign) {
        updateSignature(currentSignIndex, updates);
      }
    };
  }
  // 读取尺寸、旋转、位置信息时区别两种数据结构：
  const sizeValue =
    currentEditingElement && currentEditingElement.type === 'instance'
      ? currentElement?.settings?.size
      : currentElement?.size;
  const rotationValue =
    currentEditingElement && currentEditingElement.type === 'instance'
      ? currentElement?.settings?.rotation
      : currentElement?.rotation || 0;
  const positionX =
    currentEditingElement && currentEditingElement.type === 'instance'
      ? currentElement?.settings?.position?.x
      : currentElement?.position?.x;
  const positionY =
    currentEditingElement && currentEditingElement.type === 'instance'
      ? currentElement?.settings?.position?.y
      : currentElement?.position?.y;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('sign.settings')}
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setIsCreatingNew(true);
          setSignMakerOpen(true);
          // 新建签名配置时，同时设为编辑配置
          setCurrentEditingElement({ type: 'config', id: currentSignIndex + 1 });
        }}
        sx={{ mb: 1 }}
      >
        {t('sign.addNewSignature')}
      </Button>

      {/* 原有签名列表部分，不做调整 */}
      <List dense sx={{ flex: 0.75, overflow: 'auto', mb: 1 }}>
        {signConfigs.map((config, index) => {
          return (
            <ListItem
              dense
              key={config.id}
              selected={currentSignIndex === index}
              onClick={() => {
                setCurrentSignIndex(index);
                // 切换至编辑签名配置
                setCurrentEditingElement({ type: 'config', id: index });
              }}
              sx={{
                cursor: 'pointer',
                mb: 0.5,      // 缩小列表项之间的间隔
                py: 0.5,      // 缩小垂直内边距
                border: '1px solid',
                borderColor: theme =>
                  currentSignIndex === index ? 'primary.main' : 'divider',
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar sx={{ minWidth: 60 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={config.imageUrl}
                    alt={`${t('sign.signature')} ${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      console.log('Failed URL:', config.imageUrl);
                    }}
                  />
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={`${t('sign.signature')} ${index + 1}`}
                secondary={
                  config.imageUrl ? t('sign.signatureAdded') : t('sign.noSignature')
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newConfigs = signConfigs.filter((_, i) => i !== index);
                    setSignConfigs(newConfigs);
                    if (currentSignIndex === index) {
                      setCurrentSignIndex(-1);
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      {/* 当前（编辑）签名设置区域：既适用于签名配置，也适用于签名实例 */}
      {currentElement && (
        <Box sx={{ mt: 1 }}>
          <Stack spacing={2}>
            {/* 签名大小设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('sign.size')}
              </Typography>
              <Slider
                value={sizeValue || 0}
                onChange={(_, value) => {
                  updateCurrentElement({ size: value });
                }}
                min={20}
                max={100}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}mm`}
              />
            </Stack>

            {/* 位置设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('sign.position')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="X"
                  type="number"
                  size="small"
                  value={positionX || 0}
                  onChange={(e) =>
                    updateCurrentElement({
                      position:
                        currentEditingElement && currentEditingElement.type === 'instance'
                          ? { ...currentElement.settings.position, x: Number(e.target.value) }
                          : { ...currentElement.position, x: Number(e.target.value) }
                    })
                  }
                  InputProps={{ inputProps: { min: 0, max: 210 } }}
                />
                <TextField
                  label="Y"
                  type="number"
                  size="small"
                  value={positionY || 0}
                  onChange={(e) =>
                    updateCurrentElement({
                      position:
                        currentEditingElement && currentEditingElement.type === 'instance'
                          ? { ...currentElement.settings.position, y: Number(e.target.value) }
                          : { ...currentElement.position, y: Number(e.target.value) }
                    })
                  }
                  InputProps={{ inputProps: { min: 0, max: 297 } }}
                />
              </Stack>
            </Stack>

            {/* 旋转角度设置 */}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">
                {t('sign.rotation')}
              </Typography>
              <Slider
                value={rotationValue || 0}
                onChange={(_, value) => {
                  updateCurrentElement({ rotation: value });
                }}
                min={-180}
                max={180}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}°`}
              />
            </Stack>

            {/* 操作按钮组 */}
            <Box>
              {/* 主要操作按钮 */}
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                size="medium"
                onClick={generateSignedPdf}
                fullWidth
                sx={{ 
                  height: 40,
                  mb: 2
                }}
              >
                {t('sign.addSignatureToPdf')}
              </Button>
              
            </Box>
          </Stack>
        </Box>
      )}

      <SignMakerDialog
        open={signMakerOpen}
        onClose={() => setSignMakerOpen(false)}
        onConfirm={handleSignatureCreate}
      />

      {/* 在这里使用 FileDownload 对话框组件——风格与盖章功能一致 */}
      <FileDownload
        open={downloadOpen}
        fileUrl={signedFileUrl}
        fileName="signed.pdf"
        loading={loading}
        error={error}
        successMessage={t('sign.pdfSuccessMessage')}
        loadingMessage={t('sign.pdfLoadingMessage')}
        onClose={handleDownloadClose}
        showContinueButton={true}
        onContinueToSign={handleContinueToStamp}
        continueButtonText={t('sign.continueToStamp', '← 继续盖章')}
        allowCustomFilename={true}
      />
    </Paper>
  );
}

export default SignTools; 