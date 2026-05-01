// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChevronLeft, Close } from '@mui/icons-material';
import { Box, Container, Grid, IconButton, Modal, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

import { modalEffect } from '../assets/img';

interface LeftColumnProps {
  onClose: () => void;
  showBackIconAsClose?: boolean;
  noCloseButton?: boolean;
  TitleLogo?: React.ReactNode;
  RightItem?: React.ReactNode;
  LeftItem?: React.ReactNode;
  title?: string;
  dividerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  noDivider?: boolean;
  children: React.ReactElement;
}

function LeftColumn({ LeftItem, RightItem, TitleLogo, children, dividerStyle, noCloseButton, noDivider, onClose, showBackIconAsClose, style = {}, title }: LeftColumnProps) {
  const CLoseIcon = showBackIconAsClose ? ChevronLeft : Close;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const BoxStyle: SxProps<Theme> = useMemo(() => ({
    backgroundImage: isDark ? `url(${modalEffect})` : 'none',
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% auto',
    bgcolor: isDark ? '#1B133C' : theme.palette.background.paper,
    border: isDark ? 'none' : '1px solid #DDE3F4',
    borderRadius: '32px',
    boxShadow: isDark ? 'none' : '0 18px 48px rgba(133, 140, 176, 0.22)',
    position: 'relative',
    py: '20px',
    width: '451px',
    ...style
  }), [isDark, style, theme.palette.background.paper]);

  return (
    <Box sx={BoxStyle}>
      <Grid alignItems='center' container item>
        <IconButton
          onClick={onClose}
          sx={{ background: isDark ? '#BFA1FF26' : '#EEF1FF', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '10px', height: '36px', left: '20px', position: 'absolute', top: noDivider ? '20px' : 'inherit', visibility: noCloseButton ? 'hidden' : 'visible', width: '36px', zIndex: 2 }}
        >
          <CLoseIcon sx={{ color: isDark ? '#AA83DC' : theme.palette.text.highlight, fontSize: 20, stroke: isDark ? '#AA83DC' : theme.palette.text.highlight }} />
        </IconButton>
        <Stack alignItems='center' direction='row' justifyContent='center' sx={{ width: '100%' }}>
          {TitleLogo &&
            <span style={{ margin: '0px 8px 0 44px' }}>
              {TitleLogo}
            </span>
          }
          <Typography color='text.primary' sx={{ ml: RightItem ? '53px' : 0, textAlign: RightItem || TitleLogo ? 'left' : 'center', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
            {title}
          </Typography>
        </Stack>
        {RightItem &&
          <Grid alignItems='center' container item sx={{ position: 'absolute', right: '15px', top: '25px', width: 'fit-content', zIndex: 2 }}>
            {RightItem}
          </Grid>
        }
        {LeftItem &&
          <Grid alignItems='center' container item sx={{ left: '70px', position: 'absolute', top: '20px', width: 'fit-content', zIndex: 2 }}>
            {LeftItem}
          </Grid>
        }
      </Grid>
      {
        !noDivider &&
        <Box sx={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)'
            : 'linear-gradient(90deg, rgba(221, 227, 244, 0) 0%, #DDE3F4 50.06%, rgba(221, 227, 244, 0) 100%)',
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
  );
}

interface Props {
  onClose: () => void;
  leftColumnContent: React.ReactNode;
  rightColumnContent: React.ReactNode;
  maxHeight?: number;
  minHeight?: number;
  width?: number;
  style?: SxProps<Theme>;
  showBackIconAsClose?: boolean;
  noCloseButton?: boolean;
  TitleLogo?: React.ReactNode;
  RightItem?: React.ReactNode;
  LeftItem?: React.ReactNode;
  title?: string;
  dividerStyle?: React.CSSProperties;
  leftColumnStyle?: React.CSSProperties;
  noDivider?: boolean;
}

function DetailPanel({ LeftItem,
  RightItem,
  TitleLogo,
  dividerStyle,
  leftColumnContent,
  leftColumnStyle,
  maxHeight = 615,
  minHeight = 450,
  noCloseButton,
  noDivider,
  onClose,
  rightColumnContent,
  showBackIconAsClose,
  style,
  title }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const ModalWidth = 623;

  const initialX = useMemo(() => (window.innerWidth - ModalWidth) / 2, [ModalWidth]);
  const initialY = useMemo(() => (window.innerHeight - maxHeight) / 2, [maxHeight]);

  const containerStyle: SxProps<Theme> = useMemo(() => ({
    '&:focus': {
      outline: 'none' // Remove outline when Box is focused
    },
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    height: 'fit-content',
    left: initialX,
    maxHeight: `${maxHeight}px`,
    minHeight: `${minHeight}px`,
    overflow: 'hidden',
    position: 'absolute',
    top: initialY,
    ...style
  }), [initialX, initialY, maxHeight, minHeight, style]);

  const _onClose = useCallback((_event: unknown, reason: string) => {
    if (reason && reason === 'backdropClick') {
      return;
    }

    onClose();
  }, [onClose]);

  return (
    <Modal onClose={_onClose} open={true} slotProps={{ backdrop: { style: { backdropFilter: 'blur(5px)', backgroundColor: isDark ? 'rgba(0, 0, 0, 0.73)' : 'rgba(49, 40, 90, 0.18)' } } }}>
      <Container disableGutters sx={containerStyle}>
        <LeftColumn
          LeftItem={LeftItem}
          RightItem={RightItem}
          TitleLogo={TitleLogo}
          dividerStyle={dividerStyle}
          noCloseButton={noCloseButton}
          noDivider={noDivider}
          onClose={onClose}
          showBackIconAsClose={showBackIconAsClose}
          style={leftColumnStyle}
          title={title}
        >
          <>
            {leftColumnContent}
          </>
        </LeftColumn>
        {rightColumnContent}
      </Container>
    </Modal>
  );
}

export default memo(DetailPanel);
