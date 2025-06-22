import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { InvoiceRecognitionProvider, useInvoiceRecognitionContext } from '../../contexts/InvoiceRecognitionContext';
import { InvoiceUploader } from '../../components/invoice/InvoiceUploader';
import { InvoiceFileList } from '../../components/invoice/InvoiceFileList';
import { InvoiceToolbar } from '../../components/invoice/InvoiceToolbar';
import { InvoiceResultsTable } from '../../components/invoice/InvoiceResultsTable';
import { useInvoiceRecognition } from '../../hooks/invoice/useInvoiceRecognition';
import { useTranslation } from 'react-i18next';

const InvoiceRecognitionContent = () => {
  const { status } = useInvoiceRecognitionContext();
  const { exportToExcel } = useInvoiceRecognition();
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>{t('invoice.title')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('invoice.description')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InvoiceToolbar onExport={exportToExcel} />
        </Grid>

        {status !== 'completed' && (
          <Grid item xs={12} md={5}>
            <InvoiceUploader />
            <InvoiceFileList />
          </Grid>
        )}
        
        <Grid item xs={12} md={status !== 'completed' ? 7 : 12}>
          <InvoiceResultsTable />
        </Grid>
      </Grid>
    </Container>
  );
}

const InvoiceRecognitionPage = () => {
  return (
    <InvoiceRecognitionProvider>
      <InvoiceRecognitionContent />
    </InvoiceRecognitionProvider>
  );
};

export default InvoiceRecognitionPage; 