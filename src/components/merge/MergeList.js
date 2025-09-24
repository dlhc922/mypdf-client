import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import PDFPreviewCard from './PDFPreviewCard';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useMergeContext } from '../../contexts/MergeContext';
import { useTranslation } from 'react-i18next';

function MergeList() {
  const { t } = useTranslation();
  const { files, handlePageReorder, handleRemoveFile } = useMergeContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fileIds = useMemo(() => files.map(f => f.id), [files]);

  if (files.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>{t('merge.selectFiles')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ mb: 2 }}>
        {t('merge.selectedFiles', { count: files.length })}
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handlePageReorder}
      >
        <SortableContext items={fileIds} strategy={rectSortingStrategy}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              p: 1,
            }}
          >
            {files.map((file, index) => (
              <Box
                key={file.id}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'calc(50% - 8px)',
                    md: 'calc(33.33% - 11px)',
                    lg: 'calc(25% - 12px)',
                  },
                  height: 'auto',
                }}
              >
                <PDFPreviewCard
                  file={file}
                  index={index}
                  onRemove={handleRemoveFile}
                />
              </Box>
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}

export default React.memo(MergeList);