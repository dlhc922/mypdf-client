import React, { useState, useCallback, useEffect } from 'react';
import Draggable from 'react-draggable';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Tooltip,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RestartAlt,
  Upload,
  Close
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useStampContext } from '../../contexts/StampContext';
import { calculateStraddlePosition, shouldShowStraddleStamp, mmToPx, pxToMm } from '../../utils/stampUtils';
import { useTranslation } from 'react-i18next';

function PDFPreview() {
  const { t } = useTranslation();
  const {
    file,
    zoom,
    stampConfig,
    handleFileSelect,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handlePageSelect,
    handleStampPositionChange,
    handleStampRotationChange,
    handleCleanup,  // 从 context 中获取 handleCleanup
  } = useStampContext();

  const fileInputRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const handleDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

   // 添加关闭处理函数
   const handleClose = useCallback(() => {
    // 先清理文件输入框的值
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 清理组件内部状态
    setNumPages(null);
    setLoading(false);
    setForceUpdate(false);
    setIsDragging(false);
    setCurrentRotation(0);
    setPageSize({ width: 0, height: 0 });
    setOriginalOrientations({});
    setPageRotations({});
    
    // 最后调用 handleCleanup 来清理上下文状态
    handleCleanup();
  }, [handleCleanup]);

  // 添加页面点击处理
  const handlePageClick = (pageNumber) => {
    if (!stampConfig?.selectedPages.includes(pageNumber)) return;
    handlePageSelect(pageNumber);
  };

  // 在组件顶部添加状态来存储页面原始方向
  const [originalOrientations, setOriginalOrientations] = useState({});
  const [pageRotations, setPageRotations] = useState({});

  // 修改 onLoadSuccess 回调，接收页面数据并传入页面编号
  const handlePageLoadSuccess = useCallback((pageData, pageNum) => {
    const { width, height } = pageData;
    // 用 PDF 数据中的尺寸判断方向，不受缩放影响
    const orientation = width > height ? 'landscape' : 'portrait';
    // 保存原始方向（只记录一次，不随缩放而更新）
    setOriginalOrientations(prev => ({ ...prev, [pageNum]: orientation }));

    // 预留设置页面大小等（如有需要转换单位）
    const PT_TO_MM = 25.4 / 72;
    setPageSize({
      width: width * PT_TO_MM,
      height: height * PT_TO_MM,
    });

    // 如果启用了骑缝章且当前页面为横向，则设定旋转 -90°
    if (stampConfig?.isStraddle && orientation === 'landscape') {
      setPageRotations(prev => ({ ...prev, [pageNum]: -90 }));
    }
  }, [stampConfig?.isStraddle]);





  // 在 PDFPreview 组件内部，渲染 PDF 页面之前添加判断逻辑
  const shouldRotate = (pageNumber) => {
    const pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
    if (!pageElement) return false;

    const pageRect = pageElement.getBoundingClientRect();
    const isLandscape = pageRect.width > pageRect.height;

    // 检查是否存在纵向页面
    const allPages = Array.from(document.querySelectorAll("[data-page]"));
    const hasPortrait = allPages.some((el) => {
      const r = el.getBoundingClientRect();
      return r.width < r.height;
    });

    return hasPortrait && isLandscape && stampConfig?.isStraddle;
  };

  // 修改印章渲染函数
  const renderNormalStamp = (pageNumber) => {
    if (!stampConfig?.imageUrl || !stampConfig.selectedPages.includes(pageNumber)) {
      return null;
    }

    const pageSettings = stampConfig.pageSettings?.[pageNumber] || {
      position: { x: 50, y: 50 },
      rotation: 0,
    };
    const isSelected = pageNumber === stampConfig.currentPage;

    const pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
    if (!pageElement) return null;
    const pageRect = pageElement.getBoundingClientRect();

    // 判断当前页面是否为横向（宽大于高）
    const isLandscape = pageRect.width > pageRect.height;

    // 检查所有页面中是否存在纵向页面
    const allPages = Array.from(document.querySelectorAll("[data-page]"));
    const hasPortrait = allPages.some((el) => {
      const r = el.getBoundingClientRect();
      return r.width < r.height;
    });
    // 如果存在纵向页面且当前页面为横向，则认为为混合模式
    const mixOrientation = hasPortrait && isLandscape;

    let mmToPixelRatio, finalPosition;
    if (mixOrientation) {
      // 混合模式下，对于横向页面采用转换：
      // 候选转换：新 x = 原 position.y
      //                新 y = 210 - 原 position.x - stampConfig.size
      finalPosition = {
        x: pageSettings.position.y,
        y: 210 - pageSettings.position.x - stampConfig.size,
      };
      // 横向页面参考较小的尺寸，用页面高度除以210
      mmToPixelRatio = pageRect.height / 210;
      console.log(`Page ${pageNumber} [MIXED]:`);
      console.log("Page rect:", pageRect);
      console.log("Original position (mm):", pageSettings.position);
      console.log("Converted position (mm):", finalPosition);
      console.log("Using page height as reference: mmToPixelRatio =", mmToPixelRatio);
    } else {
      // 全横向或全纵向页，不做转换，按实际录入数值来计算位置
      if (isLandscape) {
        // 全横向时，以页面高度（较小的尺寸）除以210得到转换比率
        mmToPixelRatio = pageRect.height / 210;
      } else {
        mmToPixelRatio = pageRect.width / 210;
      }
      finalPosition = { ...pageSettings.position };
      console.log(`Page ${pageNumber} [UNIFORM]:`);
      console.log("Page rect:", pageRect);
      console.log("isLandscape:", isLandscape);
      console.log("Using original position (mm):", finalPosition);
      console.log("mmToPixelRatio =", mmToPixelRatio);
    }

    const stampSizeInPixels = stampConfig.size * mmToPixelRatio;
    const rotation = pageSettings.rotation || 0;

    console.log(`Rendering stamp on page ${pageNumber}:`);
    console.log("mmToPixelRatio:", mmToPixelRatio);
    console.log("Final computed position (mm):", finalPosition);
    console.log("Stamp size (pixels):", stampSizeInPixels);
    console.log("Rotation (deg):", rotation);

    return (
      <Draggable
        disabled={!isSelected}
        onStart={() => setIsDragging(true)}
        onStop={(e, data) => {
          setIsDragging(false);
          // 将拖拽后的像素坐标转换为毫米
          const draggedX = Number((data.x / mmToPixelRatio).toFixed(1));
          const draggedY = Number((data.y / mmToPixelRatio).toFixed(1));
          let finalX, finalY;
          if (mixOrientation) {
            // 对于混合模式下已转换的横向页面，逆转换为原始纵向坐标：
            // 原 x = 210 - stampConfig.size - (拖拽后的 y)
            // 原 y = 拖拽后的 x
            finalX = 210 - stampConfig.size - draggedY;
            finalY = draggedX;
          } else {
            finalX = Math.max(0, Math.min(draggedX, 210 - stampConfig.size));
            finalY = Math.max(0, Math.min(draggedY, 297 - stampConfig.size));
          }
          console.log(`Stamp drag stopped on page ${pageNumber}:`);
          console.log("Dragged pixel position:", { x: data.x, y: data.y });
          console.log("Converted dragged position (mm):", { draggedX, draggedY });
          console.log("Final stamp position (mm):", { finalX, finalY });
          handleStampPositionChange(finalX, finalY);
        }}
        position={{
          x: finalPosition.x * mmToPixelRatio,
          y: finalPosition.y * mmToPixelRatio,
        }}
        bounds={{
          left: 0,
          top: 0,
          right: pageRect.width - stampSizeInPixels,
          bottom: pageRect.height - stampSizeInPixels,
        }}
        scale={1}
      >
        <Box
          sx={{
            position: "absolute",
            width: `${stampSizeInPixels}px`,
            height: `${stampSizeInPixels}px`,
            transform: `rotate(${rotation}deg)`,
            cursor: isSelected ? "move" : "pointer",
            border: isSelected ? "2px solid #1976d2" : "none",
            borderRadius: "50%",
            "&:hover": {
              border: "2px solid #1976d2",
            },
            transformOrigin: "center center",
            top: 0,
            left: 0,
          }}
        >
          <img
            src={stampConfig.imageUrl}
            alt={t('stamp.stampPreviewText')}
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.8,
              pointerEvents: "none",
              transform: `rotate(${rotation}deg)`,
            }}
          />
        </Box>
      </Draggable>
    );
  };

  // 修改骑缝章渲染函数
  const renderStraddleStamp = (pageNumber) => {
    if (!stampConfig?.imageUrl || !stampConfig.isStraddle) {
      return null;
    }

    const pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
    if (!pageElement) return null;
    const pageRect = pageElement.getBoundingClientRect();

    // 判断当前页面是否为横向
    const isLandscape = pageRect.width > pageRect.height;

    // 检查所有页面中是否存在纵向页面
    const allPages = Array.from(document.querySelectorAll("[data-page]"));
    const hasPortrait = allPages.some((el) => {
      const r = el.getBoundingClientRect();
      return r.width < r.height;
    });

    // 如果存在纵向页面且当前页面为横向，需要将页面逆时针旋转90度
    const shouldRotate = hasPortrait && isLandscape;

    // 计算 mmToPixelRatio（使用较小的尺寸作为参考）
    const mmToPixelRatio = shouldRotate ? pageRect.height / 210 : pageRect.width / 210;
    const stampSizeInPixels = stampConfig.size * mmToPixelRatio;

    const position = calculateStraddlePosition(pageNumber, numPages, stampConfig.size);
    const straddleY = stampConfig.straddleY || 50;

    return (
      <Box
        sx={{
          position: 'absolute',
          width: `${stampSizeInPixels}px`,
          height: `${stampSizeInPixels}px`,
          right: 0,
          top: straddleY * mmToPixelRatio,
          transform: `translateX(50%) ${position.transform}`,
          pointerEvents: 'none'
        }}
      >
        <img
          src={stampConfig.imageUrl}
          alt={t('stamp.stampPreviewText')}
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.8,
            clipPath: position.clipPath
          }}
        />
      </Box>
    );
  };

  // 监听骑缝章状态变化
useEffect(() => {
  if (!stampConfig?.isStraddle) {
    // 当关闭骑缝章时，清除所有旋转
    setPageRotations({});
  } else {
    // 当启用骑缝章时，重新检查并设置旋转
    const allPages = Array.from(document.querySelectorAll("[data-page]"));
    const hasPortrait = allPages.some((el) => {
      const r = el.getBoundingClientRect();
      return r.width < r.height;
    });
    if (hasPortrait) {
      allPages.forEach((page, index) => {
        const rect = page.getBoundingClientRect();
        const isLandscape = rect.width > rect.height;
        if (isLandscape) {
          setPageRotations(prev => ({
            ...prev,
            [index + 1]: -90
          }));
        }
      });
    }
  }
}, [stampConfig?.isStraddle]);

  // 添加滚动和缩放监听
  useEffect(() => {
    const container = document.querySelector('.pdf-container');
    if (!container) return;

    const handleScroll = () => {
      setForceUpdate(prev => !prev);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);



  // 监听 pageSettings 的变化
  useEffect(() => {
    if (stampConfig?.currentPage) {
      const currentPageSettings = stampConfig.pageSettings?.[stampConfig.currentPage];
      setCurrentRotation(currentPageSettings?.rotation || 0);
    }
  }, [stampConfig?.currentPage, stampConfig?.pageSettings]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
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
          zIndex: 1,
          flexShrink: 0
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
            sx={{
              borderColor: '#00BFFF',
              color: '#00BFFF',
              '&:hover': {
                borderColor: '#0090E0',
                backgroundColor: 'rgba(233, 30, 99, 0.04)'
              }
            }}
          >
            {t('stamp.selectFile')}
          </Button>

          {file && (
            <>
              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                {file.name}
              </Typography>
              
            </>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={t('stamp.zoomIn')}>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('stamp.zoomOut')}>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('stamp.resetZoom')}>
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
          overflowX: 'hidden'
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
              {Array.from(new Array(numPages), (_, index) => (
                <Grid item key={index + 1}>
                  <Paper
                    elevation={2}
                    sx={{
                      position: 'relative',
                      bgcolor: 'white',
                      cursor: stampConfig?.selectedPages.includes(index + 1) ? 'pointer' : 'default',
                      outline: stampConfig?.currentPage === (index + 1) ? '2px solid #1976d2' : 'none'
                    }}
                    data-page={index + 1}
                    onClick={() => handlePageClick(index + 1)}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Page
                        pageNumber={index + 1}
                        scale={zoom * 0.6}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        onLoadSuccess={(pageData) => handlePageLoadSuccess(pageData, index + 1)}
                        // 根据原始方向决定是否旋转（不会受缩放影响）
                        rotate={stampConfig?.isStraddle && originalOrientations[index + 1] === 'landscape' ? -90 : 0}

                      />
                      {/* 普通印章预览 */}
                      {renderNormalStamp(index + 1)}
                      {/* 骑缝章预览 */}
                      {renderStraddleStamp(index + 1)}
                      {/* 页码标签 */}
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
                          textAlign: 'center'
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Document>
        ) : (
          
          <Typography color="text.secondary">
            {t('stamp.noFileSelected')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default PDFPreview; 