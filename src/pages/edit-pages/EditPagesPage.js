import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Document } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { useEditPages } from '../../hooks/edit-pages/useEditPages';
import EditPagesToolbar from '../../components/edit-pages/EditPagesToolbar';
import EditablePageItem from '../../components/edit-pages/EditablePageItem';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';
import '../../styles/EditPages.css';

const EditPagesPage = () => {
  console.log('EditPagesPage rendered');
  const { t } = useTranslation();
  const {
    file,
    pages,
    selectedPages,
    loading,
    error,
    message,
    zoom,
    numPages,
    editedFile,
    hasChanges,
    fileInputRef,
    handleFileSelect,
    handleDocumentLoadSuccess,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitWidth,
    handlePageSelect,
    handleSelectAll,
    handleClearSelection,
    handlePageReorder,
    handleDeletePages,
    handlePageReplace,
    handleGenerateEditedPDF,
    handleReset,
  } = useEditPages();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);

  return (
    <>
      <Helmet>
        <title>{t('editPages.title')} - {t('appName')}</title>
        <meta name="description" content={t('editPages.subtitle')} />
      </Helmet>

      <Container maxWidth="xl" className="edit-pages-container" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('editPages.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('editPages.subtitle')}
          </Typography>
        </Box>

        {console.log('Rendering EditPagesToolbar', { file, numPages, selectedPages, hasChanges, editedFile, loading, zoom })}
        <EditPagesToolbar
          file={file}
          numPages={numPages}
          selectedPages={selectedPages}
          hasChanges={hasChanges}
          editedFile={editedFile}
          loading={loading}
          zoom={zoom}
          onFileSelect={handleFileSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onDeletePages={handleDeletePages}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onFitWidth={handleFitWidth}
          onGenerateEditedPDF={handleGenerateEditedPDF}
          onReset={handleReset}
          fileInputRef={fileInputRef}
        />

        <DeviceCompatibilityAlert 
          mobileCompatible={false} 
          toolName={t('editPages.title')}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Paper elevation={1} sx={{ p: 3, minHeight: 400 }}>
          {!file ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t('editPages.noFileSelected')}
              </Typography>
              <Typography variant="body2">
                {t('editPages.dragToReorder')}
              </Typography>
            </Box>
          ) : (
            <Document
              file={file}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>
                    {t('editPages.loadingDocument')}
                  </Typography>
                </Box>
              }
              error={<Alert severity="error">{t('common.loadError')}</Alert>}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePageReorder}
              >
                <SortableContext items={pageIds} strategy={rectSortingStrategy}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      p: 1,
                    }}
                  >
                    {pages.map((page, index) => (
                      <Box
                        key={page.id}
                        sx={{
                          width: {
                            xs: '100%',
                            sm: 'calc(50% - 8px)',
                            md: 'calc(33.33% - 11px)',
                            lg: 'calc(25% - 12px)',
                            xl: 'calc(20% - 10px)',
                          },
                          height: 'auto',
                        }}
                      >
                        <EditablePageItem
                          page={{ ...page, originalFile: file }}
                          index={index}
                          isSelected={selectedPages.has(page.id)}
                          onSelect={handlePageSelect}
                          onReplace={handlePageReplace}
                          zoom={zoom}
                          file={file}
                          isDragDisabled={loading}
                        />
                      </Box>
                    ))}
                  </Box>
                </SortableContext>
              </DndContext>
            </Document>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default EditPagesPage; 