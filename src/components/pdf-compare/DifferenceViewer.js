import React, { useState } from 'react';
import { Box, Typography, Paper, Pagination, Chip, Stack, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Info as InfoIcon
} from '@mui/icons-material';

function DifferenceViewer({ comparisonResult, zoom = 1.0 }) {
  const [pageNumber, setPageNumber] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 页面变化处理
  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };
  
  // 获取当前页面的差异
  const currentPageDiff = comparisonResult.pageDiffs.find(
    diff => diff.pageNumber === pageNumber
  ) || comparisonResult.pageDiffs[0];
  
  // 检查当前页是否有差异
  const hasDifferences = currentPageDiff && currentPageDiff.diff.some(([type]) => type !== 0);
  
  // 渲染差异文本
  const renderDiffText = (diff) => {
    return diff.map((part, index) => {
      const [type, text] = part;
      
      if (type === 0) {
        // 无变化
        return <span key={index}>{text}</span>;
      } else if (type === 1) {
        // 添加
        return (
          <span 
            key={index} 
            style={{ 
              backgroundColor: 'rgba(0, 255, 0, 0.2)', 
              textDecoration: 'none',
              padding: '0 2px',
              borderRadius: '2px',
              border: '1px solid rgba(0, 200, 0, 0.4)'
            }}
          >
            {text}
          </span>
        );
      } else if (type === -1) {
        // 删除
        return (
          <span 
            key={index} 
            style={{ 
              backgroundColor: 'rgba(255, 0, 0, 0.2)', 
              textDecoration: 'line-through',
              padding: '0 2px',
              borderRadius: '2px',
              border: '1px solid rgba(200, 0, 0, 0.4)'
            }}
          >
            {text}
          </span>
        );
      }
      
      return null;
    });
  };
  
  // 计算当前页面的差异统计
  const calculatePageStats = (diff) => {
    let added = 0;
    let removed = 0;
    
    diff.forEach(([type, text]) => {
      if (type === 1) {
        added += text.length;
      } else if (type === -1) {
        removed += text.length;
      }
    });
    
    return {
      added,
      removed,
      changed: Math.min(added, removed)
    };
  };
  
  const pageStats = currentPageDiff ? calculatePageStats(currentPageDiff.diff) : { added: 0, removed: 0, changed: 0 };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 2,
      minHeight: '100%'
    }}>
      {/* 比较结果摘要 */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 3, 
          width: '100%', 
          maxWidth: 800,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6" gutterBottom>
          比较结果摘要
        </Typography>
        
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={2} 
          divider={<Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem />}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              原始文件
            </Typography>
            <Typography variant="body1" noWrap sx={{ maxWidth: isMobile ? '100%' : 250 }}>
              {comparisonResult.originalName}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              修改后文件
            </Typography>
            <Typography variant="body1" noWrap sx={{ maxWidth: isMobile ? '100%' : 250 }}>
              {comparisonResult.modifiedName}
            </Typography>
          </Box>
        </Stack>
        
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={2} 
          sx={{ mb: 1 }}
          justifyContent="space-around"
        >
          <Chip 
            icon={<AddIcon />} 
            label={`添加: ${comparisonResult.stats.addedCount} 字符`} 
            color="success" 
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<RemoveIcon />} 
            label={`删除: ${comparisonResult.stats.removedCount} 字符`} 
            color="error" 
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          />
          <Chip 
            icon={<EditIcon />} 
            label={`修改: ${comparisonResult.stats.changedCount} 字符`} 
            color="primary" 
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          />
        </Stack>
      </Paper>
      
      {/* 当前页面差异 */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          width: '100%', 
          maxWidth: 800,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            第 {currentPageDiff?.pageNumber || 1} 页
          </Typography>
          
          <Stack direction="row" spacing={1}>
            {currentPageDiff?.imageChanged && (
              <Chip 
                icon={<ImageIcon />} 
                label="图像变化" 
                color="warning" 
                size="small"
              />
            )}
            
            {hasDifferences ? (
              <Chip 
                label="有差异" 
                color="error" 
                size="small"
              />
            ) : (
              <Chip 
                label="无差异" 
                color="success" 
                size="small"
              />
            )}
          </Stack>
        </Box>
        
        {hasDifferences && (
          <Box sx={{ mb: 2 }}>
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ mb: 1 }}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip 
                icon={<AddIcon />} 
                label={`添加: ${pageStats.added}`} 
                color="success" 
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<RemoveIcon />} 
                label={`删除: ${pageStats.removed}`} 
                color="error" 
                variant="outlined"
                size="small"
              />
              <Chip 
                icon={<EditIcon />} 
                label={`修改: ${pageStats.changed}`} 
                color="primary" 
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
        )}
        
        <Divider sx={{ mb: 2 }} />
        
        {hasDifferences ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default',
              maxHeight: '400px',
              overflow: 'auto',
              lineHeight: 1.6,
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          >
            {renderDiffText(currentPageDiff.diff)}
          </Paper>
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              color: 'text.secondary',
              bgcolor: 'background.default',
              borderRadius: 1
            }}
          >
            <InfoIcon sx={{ fontSize: 40, mb: 1, opacity: 0.6 }} />
            <Typography>
              此页面没有文本差异
            </Typography>
            {currentPageDiff?.imageChanged && (
              <Typography sx={{ mt: 1 }}>
                但检测到图像有变化
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      
      {/* 页面导航 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        width: 'auto'
      }}>
        <Pagination 
          count={comparisonResult.pageDiffs.length} 
          page={pageNumber} 
          onChange={handlePageChange} 
          color="primary"
          size={isMobile ? "medium" : "large"}
          showFirstButton
          showLastButton
        />
        <Typography variant="body2" sx={{ ml: 2 }}>
          第 {pageNumber} 页，共 {comparisonResult.pageDiffs.length} 页
        </Typography>
      </Box>
      
      {/* 图例 */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mt: 3, 
          width: '100%', 
          maxWidth: 800,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="body2">
          <span style={{ backgroundColor: 'rgba(0, 255, 0, 0.2)', padding: '2px 4px', borderRadius: '2px', border: '1px solid rgba(0, 200, 0, 0.4)' }}>
            添加的内容
          </span>
        </Typography>
        
        <Typography variant="body2">
          <span style={{ backgroundColor: 'rgba(255, 0, 0, 0.2)', textDecoration: 'line-through', padding: '2px 4px', borderRadius: '2px', border: '1px solid rgba(200, 0, 0, 0.4)' }}>
            删除的内容
          </span>
        </Typography>
        
        <Typography variant="body2">
          <Chip 
            icon={<ImageIcon />} 
            label="图像变化" 
            color="warning" 
            size="small"
          />
          表示图像有变化
        </Typography>
      </Paper>
    </Box>
  );
}

export default DifferenceViewer; 