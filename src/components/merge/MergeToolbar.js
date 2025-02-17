import React, { useRef } from 'react';
import { Button, CircularProgress, Alert, Stack, Snackbar } from '@mui/material';
import { Upload, FileUpload } from '@mui/icons-material';
import { useMergeContext } from '../../contexts/MergeContext';
import { useTranslation } from 'react-i18next';

function MergeToolbar() {
  const { 
    loading, 
    error, 
    files,
    message,
    setMessage,
    handleFileSelect, 
    handleMerge,
  } = useMergeContext();
  
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  console.log('MergeToolbar render:', { 
    loading,
    error,
    message,
    filesCount: files.length
  });

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <input
          ref={fileInputRef}
          type="file"
          id="pdf-file-input"
          multiple
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          startIcon={<Upload />}
          sx={{ 
            borderColor: '#00BFFF',
            color: '#00BFFF',
            '&:hover': {
              borderColor: '#0090E0',
              backgroundColor: 'rgba(233, 30, 99, 0.04)'
            }
          }}
        >
          {t('merge.addFile')}
        </Button>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <FileUpload />}
          onClick={handleMerge}
          disabled={loading || files.length < 2}
          sx={{ 
            bgcolor: '#00BFFF',
            '&:hover': {
              bgcolor: '#0090E0'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(233, 30, 99, 0.12)'
            }
          }}
        >
          {loading ? t('merge.merging') : t('merge.merge')}
        </Button>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              flex: 1,
              py: 0
            }}
          >
            {error}
          </Alert>
        )}
      </Stack>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2000}
        onClose={() => {
          console.log('Closing snackbar');
          setMessage(null);
        }}
        anchorOrigin={{ 
          vertical: 'top',
          horizontal: 'center'
        }}
        sx={{
          marginTop: '24px'
        }}
      >
        <Alert 
          onClose={() => setMessage(null)} 
          severity="success"
          variant="filled"
          elevation={6}
          sx={{ 
            width: '100%',
            minWidth: '200px',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default MergeToolbar; 