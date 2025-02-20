import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Popover,
  Stack,
  Slider,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ZoomIn as ZoomInIcon,
  RotateRight as RotateIcon,
} from '@mui/icons-material';
import { useSignContext } from '../../contexts/SignContext';
import { useTranslation } from 'react-i18next';

function SignatureInstance({ instance, pageScale = 1 }) {
  const { t } = useTranslation();
  const { updateSignatureInstance, removeSignatureInstance } = useSignContext();
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 处理拖拽开始
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // 只响应左键
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  // 处理拖拽移动
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = (e.clientX - parentRect.left - dragOffset.x) / pageScale;
    const y = (e.clientY - parentRect.top - dragOffset.y) / pageScale;

    updateSignatureInstance(instance.id, {
      position: {
        x: Math.max(0, Math.min(x, parentRect.width / pageScale - 20)),
        y: Math.max(0, Math.min(y, parentRect.height / pageScale - 20)),
      }
    });
  };

  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 编辑弹出框
  const handleEditClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEditClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: `${instance.settings.position.x}px`,
          top: `${instance.settings.position.y}px`,
          transform: `rotate(${instance.settings.rotation}deg)`,
          width: `${instance.settings.size}mm`,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isHovered || isDragging ? 2 : 1,
          '&:hover': {
            '& .controls': {
              opacity: 1,
            },
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleMouseDown}
      >
        {/* 签名图片 */}
        <Box
          component="img"
          src={instance.imageUrl}
          alt={t('sign.signature')}
          sx={{
            width: '100%',
            height: 'auto',
            userSelect: 'none',
            filter: isHovered ? 'brightness(0.95)' : 'none',
            transition: 'filter 0.2s',
          }}
        />

        {/* 控制按钮 */}
        <Stack
          className="controls"
          direction="row"
          spacing={0.5}
          sx={{
            position: 'absolute',
            top: -36,
            right: 0,
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={handleEditClick}
            sx={{ color: 'white' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => removeSignatureInstance(instance.id)}
            sx={{ color: 'white' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* 编辑弹出框 */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleEditClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2, width: 250 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">
              {t('sign.size')}
            </Typography>
            <Slider
              value={instance.settings.size}
              onChange={(_, value) => 
                updateSignatureInstance(instance.id, { size: value })}
              min={20}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${value}mm`}
            />

            <Typography variant="subtitle2">
              {t('sign.rotation')}
            </Typography>
            <Slider
              value={instance.settings.rotation}
              onChange={(_, value) => 
                updateSignatureInstance(instance.id, { rotation: value })}
              min={-180}
              max={180}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${value}°`}
            />
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}

export default SignatureInstance; 