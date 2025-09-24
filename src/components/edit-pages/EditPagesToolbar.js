import React, { useState } from 'react';
import {
  Paper,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearAllIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
  FitScreen as FitWidthIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import FileDownload from '../common/FileDownload';

const EditPagesToolbar = ({
  file,
  numPages,
  selectedPages,
  hasChanges,
  editedFile,
  loading,
  zoom,
  onFileSelect,
  onSelectAll,
  onClearSelection,
  onDeletePages,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onGenerateEditedPDF,
  onReset,
  fileInputRef,
}) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    if (selectedPages.size === 0) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDeletePages();
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDownloadClick = () => {
    if (editedFile) {
      // 如果已有编辑后的文件，直接打开下载对话框
      setDownloadDialogOpen(true);
    } else if (hasChanges) {
      // 如果有更改但还没生成文件，先生成PDF，同时打开对话框显示loading
      onGenerateEditedPDF();
      setDownloadDialogOpen(true);
    }
  };

  const selectedCount = selectedPages.size;

  return (
    <>
      <Paper elevation={1} className="edit-pages-toolbar" sx={{ mb: 2 }}>
        <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
          {/* 左侧 - 文件操作 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={onFileSelect}
            />
            
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{ minWidth: '150px' }} 
            >
              {t('editPages.selectFile', '选择PDF文件')}
            </Button>

            {file && (
              <>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {file.name}
                </Typography>
                <Chip
                  label={t('editPages.pageCount', { count: numPages })}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {selectedCount > 0 && (
                  <Chip
                    label={t('editPages.selectedCount', { count: selectedCount })}
                    size="small"
                    color="secondary"
                  />
                )}
              </>
            )}
          </Box>

          {/* 中间 - 页面操作 */}
          {file && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={t('editPages.selectAll')}>
                <IconButton
                  onClick={onSelectAll}
                  disabled={loading}
                  size="small"
                >
                  <SelectAllIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('editPages.clearSelection')}>
                <IconButton
                  onClick={onClearSelection}
                  disabled={loading || selectedCount === 0}
                  size="small"
                >
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('editPages.deleteSelected')}>
                <IconButton
                  onClick={handleDeleteClick}
                  disabled={loading || selectedCount === 0}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              {/* 缩放控制 */}
              <Tooltip title={t('editPages.zoomOut')}>
                <IconButton
                  onClick={onZoomOut}
                  disabled={loading}
                  size="small"
                >
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>

              <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </Typography>

              <Tooltip title={t('editPages.zoomIn')}>
                <IconButton
                  onClick={onZoomIn}
                  disabled={loading}
                  size="small"
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('editPages.resetZoom')}>
                <IconButton
                  onClick={onResetZoom}
                  disabled={loading}
                  size="small"
                >
                  <ResetZoomIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('editPages.fitWidth')}>
                <IconButton
                  onClick={onFitWidth}
                  disabled={loading}
                  size="small"
                >
                  <FitWidthIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* 右侧 - 下载和重置 */}
          {file && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadClick}
                disabled={loading || !hasChanges}
                color="primary"
              >
                {t('editPages.downloadEdited')}
              </Button>

              <Tooltip title={t('common.reset')}>
                <IconButton
                  onClick={onReset}
                  disabled={loading}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </Paper>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('editPages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('editPages.deleteConfirmMessage', { count: selectedCount })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            {t('editPages.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {t('editPages.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 下载对话框 */}
      <FileDownload
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        fileUrl={editedFile}
        fileName={file && file.name ? `edited_${file.name.replace(/\.[^/.]+$/, '')}.pdf` : 'edited_document.pdf'}
        loading={loading && !editedFile}
      />
    </>
  );
};

export default EditPagesToolbar; 