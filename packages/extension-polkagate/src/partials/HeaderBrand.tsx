// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowBackIos as ArrowBackIosIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Box, Container, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import { logoWhite } from '../assets/logos';
import useOutsideClick from '../hooks/useOutsideClick';
import Menu from './Menu';

interface Props {
  showBackArrow?: boolean;
  showSettings?: boolean;
  text?: React.ReactNode;
  onBackClick?: () => void;
}

function HeaderBrand ({ onBackClick, showBackArrow, showSettings, text }: Props): React.ReactElement<Props> {
  const [isAddOpen, setShowAdd] = useState(false);
  const [isMenuOpen, setShowMenu] = useState(false);
  const addIconRef = useRef(null);
  const addMenuRef = useRef(null);
  const setIconRef = useRef(null);
  const setMenuRef = useRef(null);
  const theme = useTheme();

  useOutsideClick([addIconRef, addMenuRef], (): void => {
    isAddOpen && setShowAdd(!isAddOpen);
  });

  useOutsideClick([setIconRef, setMenuRef], (): void => {
    isMenuOpen && setShowMenu(!isMenuOpen);
  });

  const _handleMenuClick = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    []
  );

  return (
    <>
      {
        isMenuOpen &&
        <Menu
          isMenuOpen={isMenuOpen}
          reference={setMenuRef}
          setShowMenu={setShowMenu}
          theme={theme}
        />
      }
      <Container sx={{
        background: showBackArrow ? 'transparent' : 'radial-gradient(88.81% 88.81% at 50% 50.75%, #99004F 0%, rgba(153, 0, 79, 0) 100%)',
        borderBottom: '0.5px solid',
        borderColor: 'secondary.light',
        lineHeight: 0,
        p: '18px 30px 11px'
      }}
      >
        <Grid
          alignItems='center'
          container
          justifyContent='space-between'
        >
          <Grid item>
            {showBackArrow
              ? <ArrowBackIosIcon
                onClick={onBackClick}
                sx={{
                  color: 'secondary.light',
                  cursor: 'pointer',
                  fontSize: 25,
                  stroke: theme.palette.secondary.light,
                  strokeWidth: 1.5
                }}
                />
              : <Box
                component='img'
                src={logoWhite}
                sx={{ height: 38, width: 38 }}
                />
            }
          </Grid>
          <Grid item>
            <Typography
              color={showBackArrow ? 'text.primary' : '#ffffff'}
              fontFamily={showBackArrow ? 'inherit' : 'Eras'}
              sx={{ fontSize: showBackArrow ? '20px' : '30px', letterSpacing: '-0.015em' }}
            >
              {text}
            </Typography>
          </Grid>
          <Grid
            item
            sx={{ height: '38px', visibility: !showSettings ? 'hidden' : 'visible' }}
          >
            <IconButton
              aria-label='menu'
              color='inherit'
              edge='start'
              onClick={_handleMenuClick}
              size='small'
              sx={{ p: 0 }}
            >
              <MenuIcon sx={{ color: showBackArrow ? 'secondary.light' : '#fff', fontSize: 38 }} />
            </IconButton>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default React.memo(HeaderBrand);
