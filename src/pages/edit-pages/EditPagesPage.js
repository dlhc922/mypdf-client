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
        <title>{t('editPages.pageTitle')} - {t('appName')}</title>
        <meta name="description" content={t('editPages.pageDescription')} />
        <meta name="keywords" content={t('editPages.keywords')} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/edit-pages`} />
        <meta property="og:title" content={t('editPages.ogTitle')} />
        <meta property="og:description" content={t('editPages.ogDescription')} />
        <meta property="og:image" content={t('meta.ogImage')} />
        <meta property="og:site_name" content={t('appName')} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${window.location.origin}/edit-pages`} />
        <meta property="twitter:title" content={t('editPages.ogTitle')} />
        <meta property="twitter:description" content={t('editPages.ogDescription')} />
        <meta property="twitter:image" content={t('meta.ogImage')} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="WSBN.tech" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={`${window.location.origin}/edit-pages`} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t('editPages.title'),
            "description": t('editPages.pageDescription'),
            "url": `${window.location.origin}/edit-pages`,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              t('editPages.feature1'),
              t('editPages.feature2'),
              t('editPages.feature3'),
              t('editPages.feature4')
            ]
          })}
        </script>
      </Helmet>

      <Container maxWidth="xl" className="edit-pages-container" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('editPages.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {t('editPages.subtitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
            {t('editPages.pageDescription')}
          </Typography>
          
          {/* SEO友好的功能特性列表 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              fontWeight: 'medium'
            }}>
              ✓ {t('editPages.feature1')}
            </Typography>
            <Typography variant="body2" sx={{ 
              bgcolor: 'secondary.light', 
              color: 'secondary.contrastText', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              fontWeight: 'medium'
            }}>
              ✓ {t('editPages.feature2')}
            </Typography>
            <Typography variant="body2" sx={{ 
              bgcolor: 'success.light', 
              color: 'success.contrastText', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              fontWeight: 'medium'
            }}>
              ✓ {t('editPages.feature3')}
            </Typography>
            <Typography variant="body2" sx={{ 
              bgcolor: 'info.light', 
              color: 'info.contrastText', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              fontWeight: 'medium'
            }}>
              ✓ {t('editPages.feature4')}
            </Typography>
          </Box>
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
        
        {/* SEO友好的使用说明和FAQ */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            {t('editPages.howToUse', '如何使用PDF页面编辑器')}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('editPages.step1', '步骤1：上传PDF文件')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('editPages.step1Desc', '选择需要编辑的PDF文件，支持拖拽上传或点击选择文件。文件将在浏览器中本地处理，不会上传到服务器。')}
              </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('editPages.step2', '步骤2：编辑页面')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('editPages.step2Desc', '选择要删除的页面，拖拽重排页面顺序，或替换指定页面。所有操作都支持实时预览。')}
              </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('editPages.step3', '步骤3：下载结果')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('editPages.step3Desc', '完成编辑后，点击下载按钮获取编辑后的PDF文件。支持自定义文件名。')}
              </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('editPages.features', '主要功能')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('editPages.featuresDesc', '支持删除页面、重排顺序、替换页面、批量操作等。所有操作都在本地完成，保护您的隐私安全。')}
              </Typography>
            </Paper>
          </Box>
          
          {/* FAQ部分 */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
              {t('editPages.faqTitle', '常见问题')}
            </Typography>
            
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('editPages.faq1', 'Q: 编辑后的PDF质量会下降吗？')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('editPages.faq1Ans', 'A: 不会。我们的工具保持原始PDF的质量，编辑后的文件质量与原始文件相同。')}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('editPages.faq2', 'Q: 支持哪些文件格式？')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('editPages.faq2Ans', 'A: 支持PDF文件，替换页面时也支持图片文件（JPG、PNG等）。')}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('editPages.faq3', 'Q: 文件大小有限制吗？')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('editPages.faq3Ans', 'A: 由于在浏览器中处理，建议文件大小不超过100MB，以确保最佳性能。')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default EditPagesPage; 