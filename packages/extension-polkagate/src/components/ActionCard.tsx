// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2, type Icon as IconType } from 'iconsax-react';
import React, { useRef } from 'react';

import { logoTransparent } from '../assets/logos';
import { useIsDark, useIsHovered } from '../hooks';

interface Props {
  Icon?: IconType;
  description?: string;
  iconColor?: string;
  iconSize?: number;
  iconWithBackground?: boolean;
  iconWithoutTransform?: boolean;
  logoIcon?: boolean;
  onClick: () => void;
  style?: SxProps<Theme>;
  title: string;
  children?: React.ReactNode;
  showColorBall?: boolean;
  showChevron?: boolean;
}

function ActionCard({ Icon, children, description, iconColor = '#AA83DC', iconSize = 30, iconWithBackground, iconWithoutTransform, logoIcon, onClick, showChevron = true, showColorBall = true, style, title }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);

  const actionCardStyle = {
    bgcolor: isDark ? '#05091C' : '#FFFF',
    border: '4px solid',
    borderColor: isDark ? '#1B133C' : '#F5F4FF',
    borderRadius: '14px',
    columnGap: '10px',
    cursor: 'pointer',
    display: 'flex',
    overflow: 'hidden',
    p: '10px',
    position: 'relative',
    ...style
  } as SxProps<Theme>;

  const colorBallStyle: React.CSSProperties = {
    backgroundColor: '#CC429D',
    borderRadius: '50%',
    display: showColorBall ? 'initial' : 'none',
    filter: 'blur(28px)', // Glow effect
    height: '42px',
    left: '1px',
    opacity: 1,
    position: 'absolute',
    top: '1px',
    width: '42px'
  };

  const chevronStyle: React.CSSProperties = {
    transform: hovered ? 'translateX(5px)' : '',
    transition: 'all 250ms ease-out'
  };

  const IconStyle: React.CSSProperties = {
    background: iconWithBackground
      ? isDark
        ? 'linear-gradient(180deg, rgba(103, 67, 148, 0.5) 0%, rgba(75, 42, 117, 0.5) 50%, rgba(23, 23, 57, 0.5) 100%)'
        : 'linear-gradient(180deg, rgba(228, 169, 255, 0.5) 0%, rgba(199, 129, 255, 0.5) 50%, rgba(191, 186, 255, 0.5) 100%)'
      : '',
    borderRadius: '12px',
    height: 'fit-content',
    padding: '5px',
    transform: iconWithoutTransform ? undefined : hovered ? 'rotate(-12deg)' : 'rotate(12deg)',
    transition: 'all 250ms ease-out',
    width: 'fit-content'
  };

  return (
    <Container
      disableGutters
      onClick={onClick}
      ref={containerRef}
      sx={actionCardStyle}
    >
      {Icon && <Icon color={isDark ? iconColor : '#291443'} size={iconSize} style={IconStyle} variant='Bulk' />}
      {logoIcon &&
        <Box
          component='img'
          src={logoTransparent as string}
          sx={{ ...IconStyle, height: '34px', p: '2px', width: '34px' }}
        />
      }
      <Grid container item xs>
        <Grid alignItems='center' container item>
          <Typography color={hovered ? '#AA83DC' : theme.palette.text.primary} sx={{ transition: 'all 250ms ease-out' }} variant='B-2'>
            {title}
          </Typography>
          {showChevron && <ArrowRight2 color={hovered ? '#AA83DC' : theme.palette.text.primary} size='12' style={chevronStyle} />}
        </Grid>
        <Typography color={theme.palette.text.secondary} textAlign='left' variant='B-4'>
          {description}
        </Typography>
      </Grid>
      {children}
      <div style={colorBallStyle} />
    </Container>
  );
}

export default ActionCard;
