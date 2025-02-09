export const mergePDFs = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file.file);
  });

  const response = await fetch('/api/merge', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('PDF 合并失败');
  }

  return response.blob();
}; 