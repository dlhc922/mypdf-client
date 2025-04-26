export const convertToMarkdown = async (file, fileType, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType || 'auto');
  
  // 严格检查布尔值并转换为字符串
  const useOcr = options && options.useOcr === true ? 'true' : 'false';
  const preserveTables = options && options.preserveTables === true ? 'true' : 'false';
  
  formData.append('useOcr', useOcr);
  formData.append('preserveTables', preserveTables);
  
  console.log(`最终请求参数 - OCR: ${useOcr}, 保留表格: ${preserveTables}`);

  const apiUrl = `${process.env.REACT_APP_API_URL}/api/convert/convert-to-markdown`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Conversion to Markdown failed');
  }

  return response.json();
};

// 根据fileId下载Markdown文件
export const downloadMarkdownFile = async (fileId) => {
  if (!fileId) {
    throw new Error('No file ID provided for download');
  }
  
  const downloadUrl = `${process.env.REACT_APP_API_URL}/api/download/markdown/${fileId}`;
  
  const response = await fetch(downloadUrl);
  
  if (!response.ok) {
    throw new Error('Failed to download Markdown file');
  }
  
  return response.blob();
};