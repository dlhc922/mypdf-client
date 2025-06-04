import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { pdfjs } from 'react-pdf';

// 动态配置 PDF.js worker，绕过 MIME 类型问题
const setupPdfWorker = async () => {
  const pdfVersion = pdfjs.version;
  console.log('设置 PDF.js worker, 版本:', pdfVersion);

  try {
    // 尝试通过 fetch 获取本地 worker 文件
    const response = await fetch('/pdf.worker.mjs');
    
    if (response.ok) {
      // 获取文件内容
      const workerBlob = await response.blob();
      
      // 创建一个新的 Blob，设置正确的 MIME 类型
      const correctedBlob = new Blob([workerBlob], { 
        type: 'application/javascript' 
      });
      
      // 创建 Object URL
      const workerUrl = URL.createObjectURL(correctedBlob);
      
      // 设置 worker
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      
      console.log('PDF.js worker 配置成功 (动态加载):', {
        version: pdfVersion,
        workerSrc: 'blob:// (本地文件)',
        type: 'dynamic-local'
      });
      
      return true;
    }
  } catch (error) {
    console.warn('本地 worker 动态加载失败:', error);
  }
  
  // 回退到 CDN
  const cdnWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.js`;
  pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc;
  
  console.log('PDF.js worker 回退到 CDN:', {
    version: pdfVersion,
    workerSrc: cdnWorkerSrc,
    type: 'cdn-fallback'
  });
  
  return false;
};

// 初始化 worker
setupPdfWorker().catch(error => {
  console.error('Worker 设置失败:', error);
  // 最终备用方案
  const backupWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  pdfjs.GlobalWorkerOptions.workerSrc = backupWorkerSrc;
  console.log('使用最终备用 worker:', backupWorkerSrc);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
