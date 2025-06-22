import React from 'react';
import { Box, Button, CircularProgress, LinearProgress } from '@mui/material';
import { useInvoiceRecognitionContext } from '../../contexts/InvoiceRecognitionContext';
import { useInvoiceRecognition } from '../../hooks/invoice/useInvoiceRecognition';
import { useTranslation } from 'react-i18next';

export const InvoiceToolbar = ({ onExport }) => {
    const { t } = useTranslation();
    const { files, status, progress, invoiceData } = useInvoiceRecognitionContext();
    const { processInvoices, isProcessing, reset } = useInvoiceRecognition();

    const handleProcessClick = () => {
        if (files.length > 0) {
            processInvoices();
        }
    };

    return (
        <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: status === 'processing' ? 2 : 0 }}>
                <Button
                    variant="contained"
                    onClick={handleProcessClick}
                    disabled={files.length === 0 || isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isProcessing
                        ? t('invoice.processing', { progress })
                        : t('invoice.start')}
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onExport}
                    disabled={invoiceData.length === 0 || isProcessing}
                >
                    {t('invoice.exportExcel')}
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={reset}
                    disabled={isProcessing}
                >
                    {t('invoice.reset')}
                </Button>
            </Box>
            {status === 'processing' && (
                <LinearProgress variant="determinate" value={progress} />
            )}
        </Box>
    );
}; 