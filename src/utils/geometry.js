export function getRotatedBounds(width, height, rotation) {
  // 将角度转换为弧度（取绝对值，不考虑旋转方向）
  const radian = Math.abs(rotation * Math.PI / 180);
  
  // 计算旋转后完全包围图片的边界尺寸
  const newWidth = Math.abs(width * Math.cos(radian)) + Math.abs(height * Math.sin(radian));
  const newHeight = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
  
  // 计算偏移量用于居中显示
  const offsetX = (newWidth - width) / 2;
  const offsetY = (newHeight - height) / 2;
  
  
  return {
    width: newWidth,
    height: newHeight,
    offsetX,
    offsetY,
  };
} 