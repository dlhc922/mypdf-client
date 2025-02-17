import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, Box } from '@mui/material';
import { Delete, DragHandle } from '@mui/icons-material';
import { Draggable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

function MergeItem({ file, index, onRemove }) {
  const { t } = useTranslation();

  return (
    <Draggable draggableId={file.id} index={index}>
      {(provided) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          divider
        >
          <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
            <DragHandle />
          </Box>
          <ListItemText 
            primary={file.name}
            secondary={t('merge.fileOrder', { order: index + 1 })}
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => onRemove(file.id)}
              sx={{ color: '#00BFFF' }}
            >
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      )}
    </Draggable>
  );
}

MergeItem.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired
};

export default MergeItem; 