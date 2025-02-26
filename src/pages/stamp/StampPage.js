import React from 'react';
import { Box } from '@mui/material';
import PDFPreview from '../../components/stamp/PDFPreview';
import StampTools from '../../components/stamp/StampTools';
import { StampProvider } from '../../contexts/StampContext';
import { useTranslation } from 'react-i18next';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

function StampPage() {
  const { t } = useTranslation();
  
  return (
      <StampProvider>
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 左侧预览区域 - 独立滚动 */}
          <Box
            sx={{
              flex: 1,
              height: '100vh',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <PDFPreview />
          </Box>
          <DeviceCompatibilityAlert mobileCompatible={false} toolName="PDF盖章"></DeviceCompatibilityAlert>
          
        {/* 右侧工具栏 */}
        <Box
          sx={{
            width: 280,
            height: '100vh',
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}
        >
          <StampTools />
        </Box>
      </Box>
    </StampProvider>
  );
}

export default StampPage; 