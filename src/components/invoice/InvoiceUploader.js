import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paper, Typography, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useInvoiceRecognitionContext } from '../../contexts/InvoiceRecognitionContext';
import { useTranslation } from 'react-i18next';

export const InvoiceUploader = () => {
  const { addFiles } = useInvoiceRecognitionContext();
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length) {
      addFiles(pdfFiles);
    }
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        '&:hover': {
          borderColor: 'primary.light',
        },
      }}
    >
      <input {...getInputProps()} />
      <UploadFileIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
      <Typography variant="h6">{t('invoice.dragDrop')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t('invoice.multiUpload')}
      </Typography>
    </Paper>
  );
}; 