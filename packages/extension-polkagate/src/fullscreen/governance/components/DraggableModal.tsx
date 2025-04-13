// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Close } from '@mui/icons-material';
import { Box, IconButton, Modal, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { modalEffect } from '@polkadot/extension-polkagate/src/assets/img/index';

interface Props {
  width?: number;
  maxHeight?: number;
  minHeight?: number;
  children: React.ReactElement;
  open: boolean;
  onClose: () => void
  blurBackdrop?: boolean;
  style?: React.CSSProperties;
}

export function DraggableModal ({ blurBackdrop, children, maxHeight = 740, minHeight = 615, onClose, open, style = {}, width = 415 }: Props): React.ReactElement<Props> {
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

  const _style = {
    '&:focus': {
      outline: 'none' // Remove outline when Box is focused
    },
    bgcolor: '#1B133C',
    border: isDarkMode ? '0.5px solid' : 'none',
    borderColor: '#FFFFFF0D',
    borderRadius: '32px',
    cursor: isDragging ? 'grabbing' : 'grab',
    left: modalPosition.x,
    maxHeight: `${maxHeight}px`,
    minHeight: `${minHeight}px`,
    padding: '20px 0 20px',
    position: 'absolute',
    top: modalPosition.y,
    width: `${width}px`,
    ...style
  };

  return (
    <Modal
      onClose={_onClose}
      open={open}
      slotProps={{
        backdrop: {
          style: blurBackdrop
            ? {
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }
            : {}
        }
      }}
    >
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        sx={{ ..._style,
          backgroundImage: `url(${modalEffect})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover' }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            background: '#BFA1FF26',
            borderRadius: '10px',
            height: '36px',
            left: '20px',
            position: 'absolute',
            width: '36px',
            zIndex: 1
          }}
        >
          <Close sx={{ color: '#AA83DC', fontSize: 20, stroke: '#AA83DC' }} />
        </IconButton>
        {children}
      </Box>
    </Modal>
  );
}
