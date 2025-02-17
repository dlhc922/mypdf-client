import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00BFFF',      // 主色：例如按钮背景、标题颜色等
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0090E0',      // 副色：例如悬停时的颜色
      contrastText: '#ffffff'
    },
    error: {
      main: '#f44336'       // 错误色
    },
    background: {
      default: '#f9f9f9'    // 默认背景色
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});

export default theme; 