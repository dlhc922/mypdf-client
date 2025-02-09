// 毫米到像素的转换常量和函数
export const MM_TO_PX = 3.7795275591; // 1毫米 = 3.7795275591像素 (96 DPI)
export const A4_WIDTH_MM = 210;  // A4 纸张宽度（毫米）
export const A4_HEIGHT_MM = 297; // A4 纸张高度（毫米）
export const PT_TO_MM = 25.4 / 72;  // 1 pt = 25.4/72 mm

// 转换函数
export const mmToPx = (mm) => mm * MM_TO_PX;
export const pxToMm = (px) => px / MM_TO_PX;

// 印章尺寸常量
export const MIN_STAMP_SIZE = 30;  // 最小印章尺寸（毫米）
export const MAX_STAMP_SIZE = 75;  // 最大印章尺寸（毫米）
export const DEFAULT_STAMP_SIZE = 40;  // 默认印章尺寸（毫米）

// 页面尺寸常量（单位：毫米）
export const PAGE_SIZES = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  B4: { width: 250, height: 353 },
  B5: { width: 176, height: 250 },
  '16K': { width: 184, height: 260 },
  'Letter': { width: 216, height: 279 },
  'Legal': { width: 216, height: 356 },
  'Tabloid': { width: 279, height: 432 }
};

// 默认页面尺寸
export const DEFAULT_PAGE_SIZE = 'A4';

// 获取页面尺寸列表
export const PAGE_SIZE_LIST = Object.keys(PAGE_SIZES);

// 获取页面尺寸的辅助函数
export const getPageSize = (pageSize = DEFAULT_PAGE_SIZE) => {
  return PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
};

// 获取页面尺寸的显示文本
export const getPageSizeDisplay = (pageSize) => {
  const size = PAGE_SIZES[pageSize];
  if (!size) return '';
  return `${pageSize} (${size.width}×${size.height}mm)`;
};

// 检查页面是否为横向
export const isLandscape = (pageSize) => {
  const size = PAGE_SIZES[pageSize];
  return size ? size.width > size.height : false;
};

// 获取页面尺寸（考虑方向）
export const getPageDimensions = (pageSize, landscape = false) => {
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  return landscape ? 
    { width: size.height, height: size.width } : 
    { width: size.width, height: size.height };
};

// 添加 getScaleFactor 函数
export const getScaleFactor = (displayWidth) => {
  if (!displayWidth) return 1;
  return displayWidth / A4_WIDTH_MM;
};

// 计算骑缝章的位置和显示部分
export const calculateStraddlePosition = (pageNumber, totalPages, stampSize, straddleY = null) => {
  const pageHeight = 297; // A4纸高度（毫米）
  const pageWidth = 210;  // A4纸宽度（毫米）
  
  // 使用指定的纵向位置，如果没有指定则居中
  const y = straddleY !== null ? straddleY : (pageHeight / 2 - stampSize / 2);
  
  // 计算每页显示的印章部分宽度
  const partWidth = stampSize / totalPages;
  
  // 计算裁剪区域：从左到右依次显示印章的不同部分
  const clipStart = ((pageNumber - 1) / totalPages) * 100;
  const clipEnd = (1 - pageNumber / totalPages) * 100;
  
  return {
    x: pageWidth, // 印章位于页面右边缘
    y: y,
    clipPath: `inset(0 ${clipEnd}% 0 ${clipStart}%)`,
    transform: `translateX(${50 - (pageNumber / totalPages) * 100}%)`
  };
};

// 判断页面是否需要显示骑缝章
export const shouldShowStraddleStamp = (pageNumber, totalPages) => {
  // 所有页面都显示骑缝章
  return true;
};
  