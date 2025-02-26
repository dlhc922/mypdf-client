import React, { useState, useCallback, useEffect } from 'react';
import { Rnd } from "react-rnd";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Tooltip,
  CircularProgress,
  Grid,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RestartAlt,
  Upload,
  Delete,
  RotateRight
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useSignContext } from '../../contexts/SignContext';
import { useTranslation } from 'react-i18next';

import { getRotatedBounds } from '../../utils/geometry';

function SignPreview() {
  const { t } = useTranslation();
  const {
    file,
    zoom,
    signConfigs,
    currentSignIndex,
    setFile,
    setCurrentSignIndex,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handlePageSelect,
    updateSignature,
    handleCleanup,
    addSignatureToPage,
    signatureInstances,
    getPageInstances,
    updateSignatureInstance,
    removeSignatureInstance,
    handleInstanceSelect,
    updateSignatureRotation,
  } = useSignContext();

  const fileInputRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [dragPositions, setDragPositions] = useState({});

  // 添加 useEffect，当文件存在且尚未选中页面时，默认选中第一页
  useEffect(() => {
    if (file && selectedPage === null) {
      setSelectedPage(1);
    }
  }, [file, selectedPage]);

  // 增加全局监听 mouseup，确保拖动结束后释放签名实例
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, []);

  const handleDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  /**
   * 将毫米转换为像素：
   * 基于公式：1 inch = 25.4 mm，1 inch ≈ 96 px
   * PDF 页面使用 scale = zoom * 0.6，所以在转换时乘以该因子
   */
  const convertMmToPx = (mm) => {
    const factor = (72 / 25.4) * zoom * 0.6; // 1 mm 在当前 PDF 页面（72dpi）下的像素值
    return mm * factor;
  };



  /**
   * 渲染页面上已添加的签名，采用 react-rnd 实现拖动、缩放、旋转与删除功能：
   * - 拖动：onDragStart 设置 isDragging 为 true，onDragStop 更新位置信息并重置状态
   * - 缩放：onResizeStart 设置 isDragging 为 true，onResizeStop 根据新的宽度更新签名尺寸（单位 mm）及其位置
   * - 旋转：点击旋转按钮，每次增加 5°
   * - 删除：点击删除按钮，从上下文中移除该签名实例
   */
  const renderSignature = (pageNumber, signature, index) => {
    const instances = getPageInstances?.(pageNumber)?.filter(
      instance => instance.signatureId === signature.id
    );

    return instances?.map(instance => {
      const baseWidth = convertMmToPx(instance.settings.size);
      const baseHeight = baseWidth * 0.6;

      // 计算旋转后的边界框
      const rotatedBounds = getRotatedBounds(
        baseWidth,
        baseHeight,
        instance.settings.rotation
      );

      // 当前页面的放缩因子
      const scaleFactor = zoom * 0.6;
      const widthPx = rotatedBounds.width;
      const heightPx = rotatedBounds.height;

      return (
        <Rnd
          key={`${instance.id}_${instance.settings.position.x}_${instance.settings.position.y}_${zoom}`}
          default={{
            x: (instance.settings.position.x - rotatedBounds.offsetX) * scaleFactor,
            y: (instance.settings.position.y - rotatedBounds.offsetY) * scaleFactor,
          }}
          size={{
            width: widthPx,
            height: heightPx,
          }}
          style={{
            border: '1px dashed rgba(0,0,0,0.5)',
            backgroundColor: 'transparent'
          }}
          onDragStart={() => {
            setIsDragging(true);
          }}
          onDragStop={(e, d) => {
            setIsDragging(false);
            // 将拖动后的屏幕坐标转换为未放缩的原始坐标
            const newUnscaledPosition = {
              x: d.x / scaleFactor + rotatedBounds.offsetX,
              y: d.y / scaleFactor + rotatedBounds.offsetY,
            };
            updateSignatureInstance(instance.id, { position: newUnscaledPosition });
          }}
          onResizeStart={() => {
            setIsDragging(true);
          }}
          onResizeStop={(e, direction, ref, delta, newPosition) => {
            setIsDragging(false);
            const factor = (72 / 25.4) * zoom * 0.6;
            const newWidth = ref.offsetWidth;
            const newMm = newWidth / factor;
            const newUnscaledPosition = {
              x: newPosition.x / scaleFactor + rotatedBounds.offsetX,
              y: newPosition.y / scaleFactor + rotatedBounds.offsetY,
            };
            updateSignatureInstance(instance.id, {
              size: newMm,
              position: newUnscaledPosition
            });
          }}
          enableResizing={{ bottomRight: true }}
          onClick={(e) => {
            e.stopPropagation();
            handleInstanceClick(instance);
          }}
        >
          <div
            style={{
              width: widthPx,
              height: heightPx,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <img
              draggable={false}
              style={{
                pointerEvents: 'none',
                width: baseWidth,
                height: baseHeight,
                position: 'absolute',
                left: rotatedBounds.offsetX * scaleFactor,
                top: rotatedBounds.offsetY * scaleFactor,
                transform: `rotate(${instance.settings.rotation}deg)`,
                transformOrigin: 'center center'
              }}
              src={signature.imageUrl}
              alt={t('sign.signaturePreview', { number: index + 1 })}
            />
            {/* 操作控件层：旋转和删除按钮 */}
            <Box
              sx={{
                position: 'absolute',
                top: -24,
                right: 0,
                display: 'flex',
                gap: 0.5,
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 1,
                p: 0.25,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSignatureRotation(instance.id, (instance.settings.rotation + 5) % 360);
                }}
              >
                <RotateRight fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSignatureInstance(instance.id);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </div>
        </Rnd>
      );
    });
  };

  const handlePageClick = (event, pageNumber) => {
    setSelectedPage(pageNumber);
  };

  const handlePersistentAddSignature = (signatureIndex) => {
    addSignatureToPage(selectedPage, signatureIndex);
  };

  const handleInstanceClick = (instance) => {
    handleInstanceSelect(instance.id);
  };

  return (
  
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {/* 顶部工具栏 */}
      <Paper
        elevation={1}
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0,
          zIndex: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            size="small"
          >
            {t('sign.selectFile')}
          </Button>
          {file && (
            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
              {file.name}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography 
            variant="subtitle2" 
            color="primary" 
            sx={{ fontWeight: 'bold', mr: 1 }}
          >
            {t('sign.addSignatureTip')}
          </Typography>
          <Tooltip title={t('sign.zoomIn')}>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('sign.zoomOut')}>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('sign.resetZoom')}>
            <IconButton onClick={handleResetZoom} size="small">
              <RestartAlt />
            </IconButton>
          </Tooltip>
          <Typography variant="body2">
            {Math.round(zoom * 100)}%
          </Typography>
        </Stack>
      </Paper>

      {/* PDF 预览区域 */}
      <Box
        className="pdf-container"
        sx={{
          flex: 1,
          p: 2,
          bgcolor: '#f5f5f5',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        {file ? (
          <Document
            file={file}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={<CircularProgress />}
          >
            <Grid
              container
              spacing={2}
              justifyContent="center"
              sx={{ width: 'fit-content', margin: '0 auto' }}
            >
              {Array.from(new Array(numPages), (_, index) => {
                const pageNumber = index + 1;
                return (
                  <Grid item key={pageNumber}>
                    <Paper
                      elevation={2}
                      sx={{
                        position: 'relative',
                        bgcolor: 'white',
                        cursor: 'pointer',
                        border: selectedPage === pageNumber ? '2px solid' : 'none',
                        borderColor: selectedPage === pageNumber ? 'primary.main' : 'transparent',
                      }}
                      data-page={pageNumber}
                      onClick={(e) => handlePageClick(e, pageNumber)}
                    >
                      {selectedPage === pageNumber && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 5,
                            pointerEvents: 'auto',
                          }}
                        >
                          <Paper
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              bgcolor: 'primary.light',
                              borderBottom: '1px solid',
                              borderColor: 'primary.main',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ mr: 2, color: 'white' }}>
                              {t('sign.selectAddSignature')}
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value=""
                                displayEmpty
                                onChange={(e) => {
                                  handlePersistentAddSignature(e.target.value);
                                }}
                                renderValue={() => (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                      src={signConfigs[0]?.imageUrl || ''}
                                      alt=""
                                      style={{ width: 30, height: 'auto', marginRight: 8 }}
                                    />
                                    <Typography variant="body2" color="white">
                                      {t('sign.choosePreview')}
                                    </Typography>
                                  </Box>
                                )}
                              >
                                {signConfigs.map((signature, idx) => (
                                  <MenuItem key={signature.id} value={idx}>
                                    <Box
                                      sx={{
                                        width: 50,
                                        height: 50,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <img
                                        src={signature.imageUrl}
                                        alt={t('sign.signaturePreview', { number: idx + 1 })}
                                        style={{ width: '100%', height: 'auto' }}
                                      />
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Paper>
                        </Box>
                      )}
                      <Box sx={{ position: 'relative' }}>
                        <Page
                          pageNumber={pageNumber}
                          scale={zoom * 0.6}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                        {signConfigs.map((config, idx) =>
                          renderSignature(pageNumber, config, idx)
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            lineHeight: 1,
                            minWidth: '20px',
                            textAlign: 'center',
                          }}
                        >
                          {pageNumber}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Document>
        ) : (
          <Typography color="text.secondary" align="center">
            {t('sign.noFileSelected')}
          </Typography>
        )}
      </Box>
    </Box>

  );
}

export default SignPreview;