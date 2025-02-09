import React, { useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Button,
  Typography, 
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const FileDownload = ({
  fileUrl,
  loading,
  error,
  fileName = 'merged.pdf',
  successMessage = '处理完成',
  loadingMessage = '正在处理...',
  onClose,
  open
}) => {
  // 生成带时间戳的文件名
  const downloadFileName = useMemo(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = fileName.replace(/\.pdf$/, '');
    return `${baseName}-${timestamp}.pdf`;
  }, [fileName]);

  const handleDownload = useCallback(() => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl, downloadFileName]);

  // 处理对话框关闭
  const handleClose = useCallback((event, reason) => {
    // 如果正在加载，阻止关闭
    if (loading) return;
    
    // 调用父组件的 onClose
    if (onClose) {
      onClose();
    }
  }, [loading, onClose]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // 计算对话框是否应该显示
  const showDialog = loading || error || Boolean(fileUrl);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6">
          PDF 处理状态
        </Typography>
        {!loading && (
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            py: 4
          }}>
            <CircularProgress size={24} />
            <Typography variant="h6">
              {loadingMessage}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ my: 2 }}
          >
            {error}
          </Alert>
        )}

        {fileUrl && !loading && !error && (
          <Box sx={{ 
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <CheckCircleIcon 
                color="success" 
                sx={{ fontSize: 32 }}
              />
              <Typography 
                variant="h6" 
                color="success.main"
                fontWeight="medium"
              >
                {successMessage}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              文件名：{downloadFileName}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {fileUrl && !loading && !error && (
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={handleClose}
            color="inherit"
          >
            关闭
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ 
              minWidth: 140,
              py: 1
            }}
          >
            下载文件
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

FileDownload.propTypes = {
  fileUrl: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  fileName: PropTypes.string,
  successMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired
};

export default FileDownload; 