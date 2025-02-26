import React from 'react';
import { Box } from '@mui/material';
import SignPreview from '../../components/sign/SignPreview';
import SignTools from '../../components/sign/SignTools';
import { SignProvider } from '../../contexts/SignContext';
import { useTranslation } from 'react-i18next';
import DeviceCompatibilityAlert from '../../components/common/DeviceCompatibilityAlert';

function SignPage() {
  const { t } = useTranslation();
  
  return (
      <SignProvider>
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
            <SignPreview />
          </Box>

        {/* 右侧工具栏：使用紧凑的垂直排列 */}
        <DeviceCompatibilityAlert mobileCompatible={false} toolName="PDF签名"></DeviceCompatibilityAlert>
        <Box
          sx={{
            width: 280,
            height: '100vh',
            display: 'flex',          // 设为 flex 布局
            flexDirection: 'column',   // 垂直排列
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            p: 1                     // 根据需要可以适当减少内边距
          }}
        >
          <SignTools />
        </Box>
      </Box>
    </SignProvider>
  );
}

export default SignPage; 