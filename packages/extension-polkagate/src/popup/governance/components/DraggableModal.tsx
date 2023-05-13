// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface Props {
  width?: number;
  maxHeight?: number;
  children: React.ReactElement;
  open: boolean;
  onClose: () => void
}

export function DraggableModal({ children, onClose, open, width = 500, maxHeight = 700 }: Props): React.ReactElement<Props> {
  const [isDragging, setIsDragging] = useState(false);
  const initialX = (window.innerWidth - width) / 2;
  const initialY = (window.innerHeight - maxHeight) / 2;

  const [modalPosition, setModalPosition] = useState({ x: initialX, y: initialY });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStartPosition.x;
      const dy = e.clientY - dragStartPosition.y;

      setModalPosition((prevPosition) => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy,
      }));
      setDragStartPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const style = {
    bgcolor: 'background.default',
    border: '2px solid #000',
    borderRadius: '10px',
    boxShadow: 24,
    cursor: isDragging ? 'grabbing' : 'grab',
    left: modalPosition.x,
    maxHeight: `${maxHeight}x`,
    pb: 3,
    position: 'absolute',
    pt: 2,
    px: 4,
    top: modalPosition.y,
    // transform: 'translate(-50%, -50%)',
    width: `${width}px`
  };

  return (
    <Modal onClose={onClose} open={open}>
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        sx={{ ...style }}
      >
        {children}
      </Box>
    </Modal>
  );
}
