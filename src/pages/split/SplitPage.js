import React, { useState } from 'react';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';
import { 
  Container, 
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  Chip
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ZoomIn, ZoomOut, Close as CloseIcon } from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useSplit } from '../../hooks/split/useSplit';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// 自定义样式的 Tab
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  fontWeight: 500,
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

export default function SplitPage() {
  const {
    file,
    splitFiles,
    loading,
    error,
    message,
    handleFileSelect,
    handleSplit,
    handleDownload,
    setFile,
    setSplitFiles,
    setError,
    setMessage
  } = useSplit();

  const { t } = useTranslation();

  // 状态管理
  const [ranges, setRanges] = useState([{ start: '', end: '' }]);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(0.4); // 初始比例设为 40%
  const [tabValue, setTabValue] = useState(0);
  const [customSelections, setCustomSelections] = useState(['']); // 存储多个自定义选择

  // 缩放控制 - 范围从 0.1 (10%) 到 3.0 (300%)
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));

  // 范围控制
  const addRange = () => {
    setRanges([...ranges, { start: '', end: '' }]);
  };

  const removeRange = (index) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // 处理 tab 切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 处理自定义选择的更新
  const handleCustomSelectionChange = (index, value) => {
    const newSelections = [...customSelections];
    newSelections[index] = value;
    setCustomSelections(newSelections);
  };

  // 添加新的自定义选择
  const addCustomSelection = () => {
    setCustomSelections([...customSelections, '']);
  };

  // 删除自定义选择
  const removeCustomSelection = (index) => {
    setCustomSelections(customSelections.filter((_, i) => i !== index));
  };

  // 关闭或重置 PDF
  const handleClosePDF = () => {
    setFile(null);
    setNumPages(null);
    setScale(0.4); // 重置为初始缩放比例
    setSplitFiles([]);
    setError(null);
    setMessage(null);
    // 重置范围和自定义选择
    setRanges([{ start: '', end: '' }]);
    setCustomSelections(['']);
  };

  // 根据缩放比例计算每行显示的列数
  const getGridColumns = () => {
    if (scale >= 1.5) return 2;        // 放大 150% 以上时每行显示 2 页
    if (scale >= 2.0) return 1;        // 放大 200% 以上时每行显示 1 页
    return 3;                          // 默认每行显示 3 页
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: 4, 
        mb: 4,
        height: 'calc(100vh - 140px)', // 减去顶部导航和边距的高度
        display: 'flex'
      }}
    >
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          height: '100%',
          margin: 0,
          width: '100%'
        }}
      >
        {/* 左侧预览区域 */}
        <Grid 
          item 
          xs={12} 
          md={8}
          sx={{ 
            height: '100%',
            paddingTop: '0 !important',
            paddingLeft: '0 !important'
          }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden' // 防止内容溢出
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{t('split.previewTitle')}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {file && (
                  <>
                    <IconButton 
                      onClick={handleZoomOut} 
                      size="small"
                      disabled={scale <= 0.1}
                      sx={{
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <ZoomOut />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 45, textAlign: 'center' }}>
                      {Math.round(scale * 100)}%
                    </Typography>
                    <IconButton 
                      onClick={handleZoomIn} 
                      size="small"
                      disabled={scale >= 3.0}
                      sx={{
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <ZoomIn />
                    </IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Tooltip title={t('split.closeFile')}>
                      <IconButton 
                        onClick={handleClosePDF}
                        size="small"
                        sx={{
                          color: 'error.main',
                          '&:hover': { 
                            bgcolor: 'error.lighter',
                            color: 'error.dark'
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>

            {!file ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: 3
                }}
              >
                <Button 
                  variant="contained" 
                  component="label"
                  sx={{
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  {t('split.selectFile')}
                  <input 
                    type="file" 
                    hidden 
                    accept="application/pdf" 
                    onChange={handleFileSelect}
                    onClick={(e) => e.target.value = null} // 允许重新选择相同文件
                  />
                </Button>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  overflow: 'auto', 
                  flex: 1,
                  bgcolor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ddd',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#ccc',
                    },
                  },
                }}
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Grid 
                    container 
                    spacing={2}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start', // 从左开始排列
                      padding: 2
                    }}
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <Grid 
                        item
                        key={index}
                        sx={{
                          width: 'auto', // 移除固定宽度限制
                          flexGrow: 0,   // 防止自动拉伸
                          padding: 1
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            bgcolor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            borderRadius: 1,
                            overflow: 'hidden',
                            display: 'inline-block',
                            '& .react-pdf__Page': {
                              display: 'block',
                              '& canvas': {
                                display: 'block',
                                width: 'auto',
                                height: 'auto'
                              }
                            }
                          }}
                        >
                          <Page
                            key={`page_${index + 1}_${scale}`}
                            pageNumber={index + 1}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              minWidth: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Document>
              </Box>
            )}
          </Paper>
        </Grid>
        <DeviceCompatibilityAlert mobileCompatible={false} toolName="PDF拆分"></DeviceCompatibilityAlert>
        {/* 右侧工具栏 */}
        <Grid 
          item 
          xs={12} 
          md={4}
          sx={{ 
            height: '100%',
            paddingTop: '0 !important',
            paddingLeft: '24px !important',
            paddingRight: '0 !important'
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              overflow: 'hidden' // 防止内容溢出
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
              {t('split.settingTitle')}
            </Typography>

            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                mb: 3,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <StyledTab label={t('split.rangeSelection')} />
              <StyledTab label={t('split.customSelection')} />
            </Tabs>

            {/* 选项内容区域 - 添加独立滚动 */}
            <Box 
              sx={{ 
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f8f9fa',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#ddd',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#ccc',
                  },
                },
              }}
            >
              {tabValue === 0 ? (
                // 范围选择界面
                <Box sx={{ mb: 3 }}>
                  <Stack spacing={2}>
                    {ranges.map((range, index) => (
                      <Card 
                        key={index} 
                        variant="outlined"
                        sx={{ 
                          bgcolor: 'white',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={`${t('split.range')} ${index + 1}`} 
                              size="small" 
                              sx={{ mb: 1 }}
                            />
                            <Box sx={{ flex: 1 }} />
                            <Tooltip title={t('split.deleteRange')}>
                              <IconButton 
                                size="small"
                                onClick={() => removeRange(index)}
                                disabled={ranges.length === 1}
                                sx={{ opacity: ranges.length === 1 ? 0.5 : 1 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              label={t('split.startPage')}
                              size="small"
                              value={range.start}
                              onChange={(e) => updateRange(index, 'start', e.target.value)}
                              type="number"
                              inputProps={{ min: 1, max: numPages }}
                              sx={{ width: '45%' }}
                            />
                            <Typography color="text.secondary">{t('split.to')}</Typography>
                            <TextField
                              label={t('split.endPage')}
                              size="small"
                              value={range.end}
                              onChange={(e) => updateRange(index, 'end', e.target.value)}
                              type="number"
                              inputProps={{ min: 1, max: numPages }}
                              sx={{ width: '45%' }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addRange}
                      sx={{ 
                        alignSelf: 'flex-start',
                        mt: 1,
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.lighter'
                        }
                      }}
                    >
                      {t('split.addRange')}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                // 自定义选择界面
                <Box sx={{ mb: 3 }}>
                  <Stack spacing={2}>
                    {customSelections.map((selection, index) => (
                      <Card 
                        key={index}
                        variant="outlined"
                        sx={{ 
                          bgcolor: 'white',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip 
                              label={`${t('split.selection')} ${index + 1}`} 
                              size="small"
                            />
                            <Box sx={{ flex: 1 }} />
                            <Tooltip title={t('split.deleteSelection')}>
                              <IconButton 
                                size="small"
                                onClick={() => removeCustomSelection(index)}
                                disabled={customSelections.length === 1}
                                sx={{ opacity: customSelections.length === 1 ? 0.5 : 1 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <TextField
                            fullWidth
                            size="small"
                            value={selection}
                            onChange={(e) => handleCustomSelectionChange(index, e.target.value)}
                            placeholder={t('split.customPlaceholder')}
                            helperText={t('split.customHelper')}
                            multiline
                            rows={2}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.paper'
                              }
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addCustomSelection}
                      sx={{ 
                        alignSelf: 'flex-start',
                        mt: 1,
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.lighter'
                        }
                      }}
                    >
                      {t('split.addSelection')}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* 底部操作区域 - 固定在底部 */}
            <Box 
              sx={{ 
                pt: 2,
                mt: 2,
                borderTop: 1, 
                borderColor: 'divider',
                bgcolor: '#f8f9fa',
              }}
            >
              <Button
                variant="contained"
                onClick={() => handleSplit(tabValue === 0 ? ranges : customSelections)}
                disabled={loading || !file}
                fullWidth
                sx={{ 
                  py: 1,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                {t('split.startSplit')}
              </Button>

              {/* 状态提示 */}
              {error && (
                <Typography 
                  color="error" 
                  sx={{ 
                    mt: 2,
                    p: 1,
                    bgcolor: 'error.lighter',
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </Typography>
              )}
              {message && (
                <Typography 
                  color="success.main"
                  sx={{ 
                    mt: 2,
                    p: 1,
                    bgcolor: 'success.lighter',
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  {message}
                </Typography>
              )}

              {/* 拆分结果列表 */}
              {splitFiles.length > 0 && (
                <>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ mt: 3, mb: 1, fontWeight: 500 }}
                  >
                    {t('split.resultTitle')}
                  </Typography>
                  <List 
                    sx={{ 
                      bgcolor: 'background.paper', 
                      borderRadius: 1,
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    {splitFiles.map(({ pageNumber, url }) => (
                      <ListItem
                        key={pageNumber}
                        button
                        onClick={() => handleDownload(url, pageNumber)}
                        sx={{
                          cursor: 'pointer',  // 添加手型指针
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            transition: 'background-color 0.2s'
                          }
                        }}
                      >
                        <ListItemText 
                          primary={t('split.page', { number: pageNumber })}
                          secondary={t('split.clickToDownload')}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}