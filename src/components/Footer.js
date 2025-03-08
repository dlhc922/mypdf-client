import { Box, Link, Typography, Stack } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 3,  // 上下内边距
        mt: 'auto',  // 自动上边距，使 footer 保持在内容区域下方
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'none',
            color: 'primary.dark'
          }
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <Link href="/guides">使用指南</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/faq">常见问题</Link>
          </Typography>
        </Stack>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          Powered by{' '}
          <Link 
            href="https://wsbn.tech" 
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 600,
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            WSBN.tech
          </Link>
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Contact: <Link href="mailto:dlhc922@gmail.com">dlhc922@gmail.com</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/privacy">Privacy Policy</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/disclaimer">Disclaimer</Link>
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
} 