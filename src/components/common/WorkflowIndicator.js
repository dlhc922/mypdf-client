import React from 'react';
import { 
  Box, 
  Chip, 
  Button, 
  Stack, 
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { 
  ArrowForward, 
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  Edit,
  Draw
} from '@mui/icons-material';
import { usePDFWorkflow } from '../../contexts/PDFWorkflowContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function WorkflowIndicator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    workflowHistory, 
    currentMode, 
    hasFile,
    clearWorkflow 
  } = usePDFWorkflow();

  // 检查是否完成了盖章
  const hasStamped = workflowHistory.some(entry => entry.operation === 'stamp');
  // 检查是否完成了签名
  const hasSigned = workflowHistory.some(entry => entry.operation === 'sign');

  const handleSwitchToStamp = () => {
    console.log('工作流指示器：导航到盖章页面');
    navigate('/stamp');
  };

  const handleSwitchToSign = () => {
    console.log('工作流指示器：导航到签名页面');
    navigate('/sign');
  };

  const handleClearWorkflow = () => {
    clearWorkflow();
  };

  // 只在有工作流历史或当前有文件时显示
  if (!hasFile() && workflowHistory.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
      {/* 工作流步骤指示器 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* 盖章步骤 */}
        <Chip
          icon={hasStamped ? <CheckCircle /> : <Edit />}
          label={t('workflow.stamp', '盖章')}
          color={hasStamped ? 'success' : (currentMode === 'stamp' ? 'primary' : 'default')}
          variant={currentMode === 'stamp' ? 'filled' : 'outlined'}
          onClick={handleSwitchToStamp}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        
        <ArrowForward sx={{ color: 'text.secondary', fontSize: 16 }} />
        
        {/* 签名步骤 */}
        <Chip
          icon={hasSigned ? <CheckCircle /> : <Draw />}
          label={t('workflow.sign', '签名')}
          color={hasSigned ? 'success' : (currentMode === 'sign' ? 'primary' : 'default')}
          variant={currentMode === 'sign' ? 'filled' : 'outlined'}
          onClick={handleSwitchToSign}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      </Box>
      
      {/* 处理历史 - 只在有历史时显示 */}
      {workflowHistory.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('workflow.history', '历史')}:
          </Typography>
          {workflowHistory.slice(-2).map((entry, index) => (
            <Chip
              key={entry.id}
              size="small"
              label={`${entry.operation === 'stamp' ? t('workflow.stamp', '盖章') : t('workflow.sign', '签名')} ${new Date(entry.timestamp).toLocaleTimeString()}`}
              color={entry.operation === 'stamp' ? 'primary' : 'secondary'}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      )}

      {/* 清理按钮 - 紧挨着处理历史 */}
      {hasFile() && (
        <Button 
          size="small" 
          onClick={handleClearWorkflow}
          color="error"
          variant="outlined"
          sx={{ 
            minWidth: 'auto', 
            px: 1.5, 
            borderColor: 'error.main',
            color: 'error.main',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'white',
              borderColor: 'error.main'
            }
          }}
        >
          {t('workflow.clear', '清理工作流')}
        </Button>
      )}
    </Box>
  );
}

export default WorkflowIndicator;
