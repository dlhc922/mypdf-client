import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { pdfjs } from 'react-pdf';

// 使用相对路径
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

console.log('PDF.js worker configured:', {
  version: pdfjs.version,
  workerSrc: pdfjs.GlobalWorkerOptions.workerSrc
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
