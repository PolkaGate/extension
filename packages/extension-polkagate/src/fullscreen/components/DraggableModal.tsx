// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChevronLeft, Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Modal, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { modalEffect } from '@polkadot/extension-polkagate/src/assets/img/index';

export interface DraggableModalProps {
  blurBackdrop?: boolean;
  children: React.ReactElement;
  dividerStyle?: React.CSSProperties;
  draggable?: boolean;
  maxHeight?: number;
  minHeight?: number | string;
  noDivider?: boolean;
  open: boolean;
  onClose: () => void
  showBackIconAsClose?: boolean;
  style?: React.CSSProperties;
  title?: string;
  TitleLogo?: React.ReactNode;
  width?: number;
  RightItem?: React.ReactNode;
  rightItemStyle?: React.CSSProperties;
  noCloseButton?: boolean;
  closeOnAnyWhereClick?: boolean;
}

export function DraggableModal ({ RightItem, TitleLogo, blurBackdrop = true, children, closeOnAnyWhereClick = false, dividerStyle, draggable = false, maxHeight = 740, minHeight = 615, noCloseButton, noDivider, onClose, open, rightItemStyle, showBackIconAsClose, style = {}, title, width = 415 }: DraggableModalProps): React.ReactElement<DraggableModalProps> {
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
    if (reason && reason === 'backdropClick' && closeOnAnyWhereClick === false) {
      return;
    }

    onClose();
  }, [closeOnAnyWhereClick, onClose]);

  const handleMouseMove = useCallback((e: { clientX: number; clientY: number; }) => {
    if (isDragging && draggable) {
      const dx = e.clientX - dragStartPosition.x;
      const dy = e.clientY - dragStartPosition.y;

      setModalPosition((prevPosition) => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy
      }));
      setDragStartPosition({ x: e.clientX, y: e.clientY });
    }
  }, [draggable, dragStartPosition, isDragging]);

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
    cursor: draggable
      ? isDragging ? 'grabbing' : 'grab'
      : 'default',
    left: modalPosition.x,
    maxHeight: `${maxHeight}px`,
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    padding: '20px 0 20px',
    position: 'absolute',
    top: modalPosition.y,
    width: `${width}px`,
    ...style
  };

  const CLoseIcon = showBackIconAsClose ? ChevronLeft : Close;

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
        sx={{
          ..._style,
          backgroundImage: `url(${modalEffect})`,
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% auto'
        }}
      >
        <Grid alignItems='center' container item>
          <IconButton
            onClick={onClose}
            sx={{
              background: '#BFA1FF26',
              borderRadius: '10px',
              height: '36px',
              left: '20px',
              position: 'absolute',
              top: noDivider ? '20px' : 'inherit',
              visibility: noCloseButton ? 'hidden' : 'visible',
              width: '36px',
              zIndex: 2
            }}
          >
            <CLoseIcon sx={{ color: '#AA83DC', fontSize: 20, stroke: '#AA83DC' }} />
          </IconButton>
          <Stack alignItems='center' direction='row' justifyContent='center' sx={{ width: '100%' }}>
            {TitleLogo &&
              <span style={{ margin: '0px 8px 0 44px' }}>
                {TitleLogo}
              </span>
            }
            <Typography color='#EAEBF1' sx={{ ml: RightItem ? '60px' : 0, textAlign: RightItem || TitleLogo ? 'left' : 'center', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
              {title}
            </Typography>
            {
              RightItem &&
              <Grid alignItems='center' container item sx={{ position: 'absolute', right: '15px', top: '25px', width: 'fit-content', zIndex: 2, ...rightItemStyle }}>
                {RightItem}
              </Grid>
            }
          </Stack>
        </Grid>
        {
          !noDivider &&
          <Box sx={{
            background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
            height: '1px',
            justifySelf: 'center',
            m: '5px 0 15px',
            width: '90%',
            ...dividerStyle
          }}
          />
        }
        {children}
      </Box>
    </Modal>
  );
}
