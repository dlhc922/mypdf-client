import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Checkbox,
  Divider,
  Box,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  SelectAll,
  ClearAll
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useStampContext } from '../../contexts/StampContext';

function PageSelectDialog({ 
  open, 
  onClose,
  file,
  numPages,
  selectedPages,
  onPagesChange
}) {
  const { stampConfig, toggleRandomAngle, handleStampConfigChange } = useStampContext();
  const [pageInput, setPageInput] = useState('');
  const [documentNumPages, setDocumentNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  // 处理文档加载成功
  const handleDocumentLoadSuccess = useCallback(({ numPages }) => {
    setDocumentNumPages(numPages);
    setLoading(false);
  }, []);

  // 处理页面选择
  const handlePageToggle = (pageNum) => {
    const newSelected = selectedPages.includes(pageNum)
      ? selectedPages.filter(p => p !== pageNum)
      : [...selectedPages, pageNum].sort((a, b) => a - b);
    
    // 如果是添加新页面，使用当前的默认位置设置
    if (!selectedPages.includes(pageNum)) {
      const defaultPosition = stampConfig.position || { x: 50, y: 50 };
      const defaultRotation = stampConfig.randomAngle ? Math.floor(Math.random() * 360) : 0;
      
      handleStampConfigChange('pageSettings', {
        ...stampConfig.pageSettings,
        [pageNum]: {
          position: { ...defaultPosition },
          rotation: defaultRotation
        }
      });
    }
    
    onPagesChange(newSelected);
  };

  const handleSelectAll = () => {
    onPagesChange(Array.from({ length: documentNumPages }, (_, i) => i + 1));
  };

  const handleClearAll = () => {
    onPagesChange([]);
  };

  const handleQuickSelect = () => {
    try {
      const pages = new Set();
      pageInput.split(',').forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= documentNumPages) pages.add(i);
          }
        } else {
          const num = Number(part);
          if (num > 0 && num <= documentNumPages) pages.add(num);
        }
      });
      onPagesChange([...pages].sort((a, b) => a - b));
    } catch (error) {
      // 输入格式错误时不做任何操作
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>选择盖章页面</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {/* 快速选择工具栏 */}
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title="全选">
                  <IconButton onClick={handleSelectAll} disabled={!documentNumPages}>
                    <SelectAll />
                  </IconButton>
                </Tooltip>
                <Tooltip title="清除">
                  <IconButton onClick={handleClearAll} disabled={selectedPages.length === 0}>
                    <ClearAll />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <TextField
                  size="small"
                  placeholder="例如: 1,3-5,8"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="outlined"
                  onClick={handleQuickSelect}
                  disabled={!pageInput.trim() || !documentNumPages}
                >
                  应用
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                提示：可以输入页码范围（如1-5）或单页（如1,3,8），用逗号分隔
              </Typography>
            </Stack>
          </Paper>

          {/* 页面预览网格 */}
          <Box sx={{ height: '60vh', overflow: 'auto' }}>
            <Document 
              file={file}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={
                <Box sx={{ 
                  p: 4, 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <CircularProgress />
                </Box>
              }
            >
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {Array.from(new Array(documentNumPages), (_, index) => (
                    <Grid item xs={4} sm={3} md={2} key={index + 1}>
                      <Paper
                        elevation={selectedPages.includes(index + 1) ? 8 : 1}
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          position: 'relative',
                          border: theme => selectedPages.includes(index + 1) 
                            ? `2px solid ${theme.palette.primary.main}`
                            : 'none'
                        }}
                        onClick={() => handlePageToggle(index + 1)}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <Page
                            pageNumber={index + 1}
                            width={150}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            loading={
                              <Box sx={{ 
                                width: 150, 
                                height: 200, 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <CircularProgress size={20} />
                              </Box>
                            }
                          />
                          <Checkbox
                            checked={selectedPages.includes(index + 1)}
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'rgba(255,255,255,0.8)',
                              borderRadius: 1
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              textAlign: 'center',
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              py: 0.5
                            }}
                          >
                            第 {index + 1} 页
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Document>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <FormControlLabel
            control={
              <Switch
                checked={stampConfig.randomAngle}
                onChange={toggleRandomAngle}
                color="primary"
              />
            }
            label="每个印章采用随机的角度"
          />
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2">
            已选择 {selectedPages.length} 页
          </Typography>
          <Button onClick={onClose}>取消</Button>
          <Button 
            variant="contained"
            onClick={onClose}
            disabled={selectedPages.length === 0}
          >
            确定
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default PageSelectDialog; 