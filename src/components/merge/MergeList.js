import React from 'react';
import { Box, Typography } from '@mui/material';
import PDFPreviewCard from './PDFPreviewCard';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { useMergeContext } from '../../contexts/MergeContext';

// 重排数组的辅助函数
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function MergeList() {
  const { files, updateFilesOrder, handleRemoveFile } = useMergeContext();

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const reorderedFiles = reorder(files, result.source.index, result.destination.index);
    // 更新 context 中的文件顺序
    updateFilesOrder(reorderedFiles);
    console.log('新顺序：', reorderedFiles);
  };

  if (files.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>请选择要合并的 PDF 文件</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ mb: 2 }}>
        选择 {files.length} 个文件（可拖动调整顺序）
      </Typography>
      <Droppable 
        droppableId="pdf-list" 
        direction="horizontal"
      >
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              minHeight: 200,
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
              p: 1,
              transition: 'background-color 0.2s ease',
              position: 'relative',
              '& > div': {
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 8px)',
                  md: 'calc(33.33% - 11px)',
                  lg: 'calc(25% - 12px)',
                },
                marginBottom: 2,
              }
            }}
          >
            {files.map((file, index) => (
              <Draggable 
                key={file.id} 
                draggableId={String(file.id)}
                index={index}
              >
                {(provided, snapshot) => {
                  // 只在拖动时应用 transform，其他时候使用 CSS transform: none!
                  const style = {
                    ...provided.draggableProps.style,
                    transform: snapshot.isDragging 
                      ? provided.draggableProps.style.transform
                      : 'none',
                    transition: snapshot.isDragging 
                      ? provided.draggableProps.style.transition
                      : 'none'
                  };

                  return (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={style}
                      sx={{
                        height: 'auto',
                        position: 'relative',
                        '& > *': {
                          height: '100%',
                        }
                      }}
                    >
                      <PDFPreviewCard
                        file={file}
                        index={index}
                        onRemove={handleRemoveFile}
                        isDragging={snapshot.isDragging}
                      />
                    </Box>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}

export default React.memo(MergeList);