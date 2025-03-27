import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  useTheme 
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function FileUploadArea({
  accept,
  onFileSelected,
  icon,
  text,
  buttonText,
  inputRef,
  maxSize = 50 // Default max size in MB
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setErrorMessage(t('fileUpload.fileTooLarge', { maxSize }));
      return false;
    }
    
    // 检查文件类型
    if (accept && !file.type.match(accept.replace('.', 'application/'))) {
      setErrorMessage(t('fileUpload.wrongFileType'));
      return false;
    }
    
    setErrorMessage('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleClick = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '600px' }}>
      <Paper
        elevation={0}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'rgba(0, 0, 0, 0.04)' : 'background.paper',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: theme.transitions.create(['border-color', 'background-color']),
          '&:hover': {
            borderColor: 'primary.light',
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          {icon || <CloudUpload sx={{ fontSize: 60, opacity: 0.7 }} />}
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {text || t('fileUpload.dropFileHere')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('fileUpload.dragDropOr')}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          component="span"
          sx={{ mt: 1 }}
        >
          {buttonText || t('fileUpload.browse')}
        </Button>
        
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default FileUploadArea; 