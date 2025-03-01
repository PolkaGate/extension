// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { Box, Modal, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import ModalTitleWithDrag from '../../partials/ModalTitleWithDrag';

interface Props {
  width?: number;
  maxHeight?: number;
  minHeight?: number;
  children: React.ReactElement;
  open: boolean;
  onClose: () => void
  title: string;
  icon?: string | IconDefinition;
}

export function DraggableModalWithTitle({ children, icon, maxHeight = 740, minHeight = 615, onClose, open, title, width = 500 }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const [isDragging, setIsDragging] = useState(false);
  const initialX = (window.innerWidth - width) / 2;
  const initialY = (window.innerHeight - maxHeight) / 2;

  const [modalPosition, setModalPosition] = useState({ x: initialX, y: initialY });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: { clientX: number; clientY: number; }) => {
    setIsDragging(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const _onClose = useCallback((_event: unknown, reason: string) => {
    if (reason && reason === 'backdropClick') {
      return;
    }

    onClose();
  }, [onClose]);

  const handleMouseMove = useCallback((e: { clientX: number; clientY: number; }) => {
    if (isDragging) {
      const dx = e.clientX - dragStartPosition.x;
      const dy = e.clientY - dragStartPosition.y;

      setModalPosition((prevPosition) => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy
      }));
      setDragStartPosition({ x: e.clientX, y: e.clientY });
    }
  }, [dragStartPosition, isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const style = {
    '&:focus': {
      outline: 'none' // Remove outline when Box is focused
    },
    bgcolor: 'background.default',
    border: isDarkMode ? '0.5px solid' : 'none',
    borderColor: 'secondary.light',
    borderRadius: '10px',
    boxShadow: 24,
    left: modalPosition.x,
    maxHeight: `${maxHeight}px`,
    minHeight: `${minHeight}px`,
    pb: 3,
    position: 'absolute',
    pt: 2,
    px: 4,
    top: modalPosition.y,
    width: `${width}px`
  };

  return (
    <Modal onClose={_onClose} open={open}>
      <Box
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        sx={{ ...style }}

      >
        <ModalTitleWithDrag
          icon={icon}
          isDragging={isDragging}
          onClose={onClose}
          onMouseDown={handleMouseDown}
          title={title}
        />
        {children}
      </Box>
    </Modal>
  );
}
