// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2, type Icon as IconType } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { logoTransparent } from '../assets/logos';

interface Props {
  title: string;
  description?: string;
  Icon?: IconType;
  iconWithBackground?: boolean;
  logoIcon?: boolean;
  style?: SxProps<Theme>;
  onClick: () => void;
}

function ActionCard ({ Icon, description, iconWithBackground, logoIcon, onClick, style, title }: Props): React.ReactElement {
  const theme = useTheme();

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHover = useCallback(() => setHovered((isHovered) => !isHovered), []);

  const ActionCardStyle = {
    bgcolor: '#05091C',
    border: '4px solid',
    borderColor: '#1B133C',
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
    background: iconWithBackground ? 'linear-gradient(180deg, rgba(103, 67, 148, 0.5) 0%, rgba(75, 42, 117, 0.5) 50%, rgba(23, 23, 57, 0.5) 100%)' : '',
    borderRadius: '12px',
    height: 'fit-content',
    padding: '5px',
    transform: hovered ? 'rotate(-12deg)' : 'rotate(12deg)',
    transition: 'all 250ms ease-out',
    width: 'fit-content'
  };

  return (
    <Container
      disableGutters
      onClick={onClick}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
      sx={ActionCardStyle}
    >
      {Icon && <Icon color='#AA83DC' size={30} style={IconStyle} variant='Bulk' />}
      {logoIcon &&
        <Box
          component='img'
          src={logoTransparent as string}
          sx={{ ...IconStyle, height: '34px', p: '2px', width: '34px' }}
        />
      }
      <Grid container item>
        <Grid alignItems='center' container item>
          <Typography color={hovered ? '#AA83DC' : theme.palette.text.primary} fontFamily='Inter' fontSize='14px' fontWeight={600} sx={{ transition: 'all 250ms ease-out' }}>
            {title}
          </Typography>
          <ArrowRight2 color={hovered ? '#AA83DC' : theme.palette.text.primary} size='12' style={chevronStyle} />
        </Grid>
        <Typography color={theme.palette.text.secondary} fontFamily='Inter' fontSize='12px' fontWeight={500}>
          {description}
        </Typography>
      </Grid>
      <div style={colorBallStyle} />
    </Container>
  );
}

export default ActionCard;
