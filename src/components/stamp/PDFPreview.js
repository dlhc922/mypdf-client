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
  Upload
} from '@mui/icons-material';
import { Document, Page } from 'react-pdf';
import { useStampContext } from '../../contexts/StampContext';
import { calculateStraddlePosition, shouldShowStraddleStamp, mmToPx, pxToMm } from '../../utils/stampUtils';

function PDFPreview() {
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

  // 添加页面点击处理
  const handlePageClick = (pageNumber) => {
    if (!stampConfig?.selectedPages.includes(pageNumber)) return;
    handlePageSelect(pageNumber);
  };

  // 修改页面加载处理函数
  const handlePageLoadSuccess = useCallback(({ width, height }) => {
    const PT_TO_MM = 25.4 / 72;
    setPageSize({ 
      width: width * PT_TO_MM,
      height: height * PT_TO_MM 
    });
  }, []);

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
            alt="印章预览"
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

  // 添加骑缝章渲染函数
  const renderStraddleStamp = (pageNumber) => {
    if (!stampConfig?.imageUrl || !stampConfig.isStraddle) {
      return null;
    }

    const pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
    if (!pageElement) return null;
    const pageRect = pageElement.getBoundingClientRect();

    const mmToPixelRatio = pageRect.width / 210;
    const stampSizeInPixels = stampConfig.size * mmToPixelRatio;

    const position = calculateStraddlePosition(pageNumber, numPages, stampConfig.size);
    const straddleY = stampConfig.straddleY || 50; // 使用骑缝章纵向位置

    return (
      <Box
        sx={{
          position: 'absolute',
          width: `${stampSizeInPixels}px`,
          height: `${stampSizeInPixels}px`,
          right: 0,
          top: straddleY * mmToPixelRatio, // 使用骑缝章纵向位置
          transform: `translateX(50%) ${position.transform}`,
          pointerEvents: 'none'
        }}
      >
        <img
          src={stampConfig.imageUrl}
          alt="骑缝章"
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
            选择 PDF 文件
          </Button>

          {file && (
            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
              {file.name}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="放大">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="缩小">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="重置缩放">
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
                        onLoadSuccess={handlePageLoadSuccess}
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
            请选择一个 PDF 文件
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default PDFPreview; 