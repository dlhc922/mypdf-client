import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Paper, 
  Typography,
  ListItemSecondaryAction
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  HourglassEmpty as HourglassEmptyIcon 
} from '@mui/icons-material';
import { useInvoiceRecognitionContext } from '../../contexts/InvoiceRecognitionContext';
import { useTranslation } from 'react-i18next';

export const InvoiceFileList = () => {
  const { files, fileStatuses } = useInvoiceRecognitionContext();
  const { t } = useTranslation();

  if (files.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ mt: 2, p: 2, maxHeight: 300, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('invoice.fileList')}
      </Typography>
      <List>
        {files.map((fileObj) => {
          const status = fileStatuses[fileObj.file.name] || fileObj.status;  // pending / processing / success / failure

          const StatusIcon = (() => {
            switch (status) {
              case 'success':     return <CheckCircleIcon  color="success" />;
              case 'failure':     return <ErrorIcon        color="error"   />;
              case 'processing':  return <HourglassEmptyIcon color="info" />;
              default:            return <HourglassEmptyIcon color="disabled" />;
            }
          })();

          return (
            <ListItem key={fileObj.id}>
              <ListItemAvatar>
                <Avatar>
                  <PictureAsPdfIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={fileObj.file.name}
                secondary={`${(fileObj.file.size / 1024).toFixed(2)} KB`}
              />
              <ListItemSecondaryAction>
                {StatusIcon}
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}; 