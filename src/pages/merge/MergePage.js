   // client/src/pages/merge/MergePage.js
   import React, { useState, useCallback } from 'react';
   import MergeList from '../../components/merge/MergeList';
   import MergeToolbar from '../../components/merge/MergeToolbar';
   import { Box, Paper, Typography } from '@mui/material';
   import { MergeProvider, useMergeContext } from '../../contexts/MergeContext';
   import { DragDropContext } from 'react-beautiful-dnd';
   import FileDownload from '../../components/common/FileDownload';
   import { useTranslation } from 'react-i18next';
   import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';


   // 将需要使用 context 的内容抽离到内部组件中
   function MergePageContent() {
     const { t } = useTranslation();
     const { 
       handleDragEnd,
       loading,
       error,
       mergedFileUrl,
       handleFileSelect
     } = useMergeContext();


     // 控制对话框的显示
     const [dialogOpen, setDialogOpen] = useState(false);
     const [isDragging, setIsDragging] = useState(false);

     // 处理文件拖放
     const handleDragOver = useCallback((e) => {
       e.preventDefault();
       e.stopPropagation();
       setIsDragging(true);
     }, []);

     const handleDragLeave = useCallback((e) => {
       e.preventDefault();
       e.stopPropagation();
       setIsDragging(false);
     }, []);

     const handleDrop = useCallback((e) => {
       e.preventDefault();
       e.stopPropagation();
       setIsDragging(false);

       const files = Array.from(e.dataTransfer.files);
       // 检查是否都是 PDF 文件
       const pdfFiles = files.filter(file => file.type === 'application/pdf');
       
       if (pdfFiles.length !== files.length) {
         // 如果有非 PDF 文件，则显示警告提示
         alert(t('merge.onlyPDF'));
         return;
       }

       // 创建一个模拟的 event 对象
       const mockEvent = {
         target: {
           files: pdfFiles
         }
       };
       handleFileSelect(mockEvent);
     }, [handleFileSelect, t]);

     // 当有文件 URL、加载状态或错误时，打开对话框
     React.useEffect(() => {
       if (loading || error || mergedFileUrl) {
         setDialogOpen(true);
       }
     }, [loading, error, mergedFileUrl]);

     const handleDialogClose = () => {
       if (!loading) {  // 确保不在加载状态时才能关闭
         setDialogOpen(false);
       }
     };

     return (
       <DragDropContext onDragEnd={handleDragEnd}>
         <Box 
           sx={{ 
             flex: 1, 
             display: 'flex', 
             flexDirection: 'column', 
             p: 2,
             position: 'relative'
           }}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}
         >
           {isDragging && (
             <Box
               sx={{
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 bgcolor: 'rgba(25, 118, 210, 0.08)',
                 border: '2px dashed #1976d2',
                 borderRadius: 2,
                 zIndex: 1,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <Typography 
                 variant="h5" 
                 color="primary"
                 sx={{ 
                   bgcolor: 'background.paper',
                   px: 4,
                   py: 2,
                   borderRadius: 1,
                   boxShadow: 1
                 }}
               >
                 {t('merge.dropToAdd')}
               </Typography>
             </Box>
           )}
           <DeviceCompatibilityAlert mobileCompatible={true} toolName="PDF合并"></DeviceCompatibilityAlert>

           <Paper
             elevation={3}
             sx={{
               p: 3,
               flex: 1,
               display: 'flex',
               flexDirection: 'column',
               overflow: 'hidden',
               position: 'relative',
               zIndex: 0
             }}
           >
             <Box
               sx={{
                 mb: 2,
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center'
               }}
             >
               <Typography variant="h5">{t('merge.mergeTitle')}</Typography>
               <MergeToolbar />
             </Box>
             
             <Box sx={{ flex: 1, overflow: 'auto' }}>
               <MergeList />
             </Box>
           </Paper>

           <FileDownload
             fileUrl={mergedFileUrl}
             loading={loading}
             error={error}
             fileName="merged.pdf"
             successMessage={t('merge.successMessage')}
             loadingMessage={t('merge.loadingMessage')}
             onClose={handleDialogClose}
             open={dialogOpen}
           />
         </Box>
       </DragDropContext>
     );
   }

   function MergePage() {
     return (
       <MergeProvider>
         <MergePageContent />
       </MergeProvider>
     );
   }

   export default MergePage;