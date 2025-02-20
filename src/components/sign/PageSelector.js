import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { useSignContext } from '../../contexts/SignContext';
import { useTranslation } from 'react-i18next';
import SignatureInstance from './SignatureInstance';

function PageSelector({ pageNumber, pageImage, instances }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { signConfigs, addSignatureToPage } = useSignContext();
  const [isHovered, setIsHovered] = React.useState(false);

  const handlePageClick = (event) => {
    if (signConfigs.length === 0) {
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignatureSelect = (signatureId) => {
    addSignatureToPage(pageNumber);
    handleClose();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        transition: 'transform 0.2s',
        mb: 2,
        '&:hover': {
          transform: 'scale(1.01)',
          '& .page-overlay': {
            opacity: 1
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 页面预览 */}
      <Paper
        elevation={isHovered ? 4 : 1}
        sx={{
          position: 'relative',
          transition: 'box-shadow 0.2s',
          bgcolor: 'background.paper',
        }}
      >
        {/* 页码标识 */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
            zIndex: 1,
          }}
        >
          {t('sign.pageNumber', { number: pageNumber })}
        </Box>

        {/* PDF 页面预览 */}
        <img
          src={pageImage}
          alt={t('sign.pagePreview', { number: pageNumber })}
          style={{ 
            width: '100%', 
            display: 'block',
            userSelect: 'none'
          }}
        />
        
        {/* 该页面上的所有签名实例 */}
        {instances?.map(instance => (
          <SignatureInstance
            key={instance.id}
            instance={instance}
            pageScale={1} // TODO: 根据实际页面缩放比例调整
          />
        ))}
        
        {/* 点击添加签名的遮罩层 */}
        <Box
          className="page-overlay"
          onClick={handlePageClick}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.15)',
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: signConfigs.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              px: 2,
              py: 1,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.primary">
              {signConfigs.length > 0 
                ? t('sign.clickToAdd')
                : t('sign.noSignatures')}
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* 签名选择弹出框 */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              boxShadow: theme => theme.shadows[8],
              borderRadius: 2,
            }
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {t('sign.selectSignature')}
          </Typography>
        </Box>
        <Divider />
        <List sx={{ py: 1 }}>
          {signConfigs.map((signature, index) => (
            <ListItem
              key={signature.id}
              onClick={() => handleSignatureSelect(signature.id)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemAvatar>
                <Box
                  sx={{
                    width: 50,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                  }}
                >
                  <img
                    src={signature.imageUrl}
                    alt={t('sign.signaturePreview', { number: index + 1 })}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </ListItemAvatar>
              <ListItemText 
                primary={t('sign.signatureName', { number: index + 1 })}
                secondary={t('sign.signatureInfo', { 
                  size: signature.size,
                  rotation: signature.rotation 
                })}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  );
}

export default PageSelector; 