// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowBackIos as ArrowBackIosIcon, Close as CloseIcon, Menu as MenuIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useRef, useState } from 'react';

import { logoBlack, logoWhite } from '../assets/logos';
import { ActionContext, Steps } from '../components';
import useOutsideClick from '../hooks/useOutsideClick';
import { Step } from '../util/types';
import Menu from './Menu';
import { AccountMenu } from '.';

interface Props {
  address?: string;
  showBackArrow?: boolean;
  showBrand?: boolean;
  showMenu?: boolean;
  showAccountMenu?: boolean;
  withSteps?: Step | null;
  text?: React.ReactNode;
  onBackClick?: () => void;
  onRefresh?: () => void;
  showClose?: boolean;
  showCloseX?: boolean;
  isRefreshing?: boolean;
  _centerItem?: JSX.Element;
  noBorder?: boolean;
  shortBorder?: boolean;
  paddingBottom?: number;
  onClose?: () => void;
  backgroundDefault?: boolean;
}

function HeaderBrand({ _centerItem, address, backgroundDefault, isRefreshing, noBorder = false, onBackClick, onClose, onRefresh, paddingBottom = 11, shortBorder, showAccountMenu, showBackArrow, showBrand, showClose, showCloseX, showMenu, text, withSteps = null }: Props): React.ReactElement<Props> {
  const [isMenuOpen, setOpenMenu] = useState(false);
  const [isAccountMenuOpen, setShowAccountMenu] = useState(false);
  const setIconRef = useRef(null);
  const setMenuRef = useRef(null);
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  useOutsideClick([setIconRef, setMenuRef], (): void => {
    isMenuOpen && setOpenMenu(!isMenuOpen);
  });

  const _handleMenuClick = useCallback(() => {
    if (address) {
      setShowAccountMenu((open) => !open);
    } else {
      setOpenMenu((open) => !open);
    }
  }, [address]);

  const _onClose = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const LeftIcon = () => (
    <Grid item xs={1.4}>
      {!showBrand &&
        <ArrowBackIosIcon
          onClick={onBackClick}
          sx={{
            color: 'secondary.light',
            cursor: 'pointer',
            fontSize: 25,
            stroke: theme.palette.secondary.light,
            strokeWidth: 1.5,
            visibility: showBackArrow ? 'visible' : 'hidden'
          }}
        />}
      {!showBackArrow && showBrand &&
        <Box
          component='img'
          src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
          sx={{ height: 52, width: 52 }}
        />
      }
    </Grid>
  );

  const CenterItem = () => (
    <Grid display='inline-flex' item>
      <Typography color='text.primary' fontFamily={showBrand ? 'Eras' : 'inherit'} fontWeight={400} sx={{ fontSize: showBrand ? '30px' : '20px', lineHeight: showBrand ? 'inherit' : 1.9 }}>
        {text}
      </Typography>
      {
        withSteps &&
        <Steps
          current={withSteps.current}
          total={withSteps.total}
        />
      }
    </Grid>
  );

  const RightItem = () => (
    <Grid item textAlign='right' xs={1.4}>
      {!onRefresh && !showClose &&
        <IconButton aria-label='menu' color='inherit' edge='start' onClick={_handleMenuClick} size='small' sx={{ p: 0, visibility: showMenu || showAccountMenu ? 'visible' : 'hidden' }}>
          {showMenu &&
            <MenuIcon
              sx={{ color: showBrand ? theme.palette.mode === 'dark' ? 'text.primary' : 'secondary.light' : 'secondary.light', fontSize: 39 }}
            />
          }
          {showAccountMenu &&
            <MoreVertIcon
              sx={{ color: 'secondary.light', fontSize: '33px' }}
            />
          }
        </IconButton>
      }
      {!!onRefresh &&
        <IconButton aria-label='menu' color='inherit' edge='start' onClick={onRefresh} size='small' sx={{ p: 0 }}>
          <FontAwesomeIcon
            color={theme.palette.secondary.light}
            icon={faRefresh}
            size='lg'
            spin={isRefreshing}
          />
        </IconButton>
      }
      {showClose &&
        <IconButton aria-label='menu' color='inherit' edge='start' onClick={onClose || _onClose} size='small' sx={{ p: 0 }}>
          {showCloseX
            ? <CloseIcon sx={{ fontSize: 40 }} />
            : <vaadin-icon icon={`vaadin:home${theme.palette.mode === 'light' ? '-o' : ''}`} style={{ height: '22px', width: '22px', color: `${theme.palette.secondary.light}` }} />
          }
        </IconButton>
      }
    </Grid>
  );

  return (
    <>
      <Container
        disableGutters
        sx={{
          bgcolor: (backgroundDefault && 'background.default') || (showBrand && 'background.paper'),
          borderBottom: `${noBorder || shortBorder ? '' : '0.5px solid'}`,
          borderColor: 'secondary.light',
          lineHeight: 0,
          p: showBrand ? '7px 30px 7px' : `18px 20px ${paddingBottom}px 30px`
        }}
      >
        <Grid alignItems='center' container justifyContent='space-between'>
          <LeftIcon />
          {_centerItem ?? <CenterItem />}
          <RightItem />
        </Grid>
        {shortBorder &&
          <Divider sx={{ bgcolor: 'secondary.main', height: '3px', margin: '5px auto', width: '138px' }} />
        }
      </Container>
      {isMenuOpen &&
        <Menu
          isMenuOpen={isMenuOpen}
          reference={setMenuRef}
          setShowMenu={setOpenMenu}
          theme={theme}
        />
      }
      {isAccountMenuOpen && address &&
        <AccountMenu
          address={address}
          isMenuOpen={isAccountMenuOpen}
          noMargin
          setShowMenu={setShowAccountMenu}
        />
      }
    </>
  );
}

export default React.memo(HeaderBrand);