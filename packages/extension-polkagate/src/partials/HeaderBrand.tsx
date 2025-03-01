// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Step } from '../util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowBackIos as ArrowBackIosIcon, Close as CloseIcon, Menu as MenuIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useRef, useState } from 'react';

import { logoBlack, logoWhite } from '../assets/logos';
import { ActionContext, FullScreenIcon, Steps, VaadinIcon } from '../components';
import InternetConnectivity from '../fullscreen/governance/InternetConnectivity';
import useOutsideClick from '../hooks/useOutsideClick';
import ConnectedDappIcon from './ConnectedDappIcon';
import Menu from './Menu';
import { AccountMenu } from '.';

interface Props {
  _centerItem?: React.JSX.Element;
  address?: string;
  backgroundDefault?: boolean;
  fullScreenURL?: string;
  isRefreshing?: boolean;
  noBorder?: boolean;
  onBackClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  paddingBottom?: number;
  showAccountMenu?: boolean;
  showBackArrow?: boolean;
  showBrand?: boolean;
  showClose?: boolean;
  showCloseX?: boolean;
  showMenu?: boolean;
  shortBorder?: boolean;
  showFullScreen?: boolean;
  style?: SxProps<Theme> | undefined;
  text?: React.ReactNode;
  withSteps?: Step | null;
}

const LeftIcon = ({ onBackClick, showBackArrow, showBrand }: {
  showBrand: boolean | undefined;
  onBackClick?: () => void;
  showBackArrow?: boolean;
}) => {
  const theme = useTheme();

  return (
    <Grid item xs={showBrand ? 1.4 : 1}>
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
        />
      }
      {!showBackArrow && showBrand &&
        <Grid item sx={{ position: 'relative', width: 'fit-content' }}>
          <Box
            component='img'
            src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
            sx={{ height: 52, width: 52 }}
          />
          <ConnectedDappIcon />
          <Grid item sx={{ left: '-20px', position: 'absolute', top: 0 }}>
            <InternetConnectivity />
          </Grid>
        </Grid>
      }
    </Grid>
  );
};

const CenterItem = ({ showBrand, text, withSteps }: { showBrand?: boolean, text?: React.ReactNode, withSteps?: Step | null }) => (
  <Grid display='inline-flex' item>
    <Typography color='text.primary' fontFamily={showBrand ? 'Eras' : 'inherit'} fontWeight={400} sx={{ fontSize: showBrand ? '29px' : '18px', lineHeight: showBrand ? 'inherit' : 1.9 }}>
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

const RightItem = ({ _handleMenuClick, _onClose, fullScreenURL, isRefreshing, onClose, onRefresh, showAccountMenu, showBrand, showClose, showCloseX, showFullScreen, showMenu }: { _onClose: () => void, showCloseX?: boolean, isRefreshing?: boolean, showBrand?: boolean, _handleMenuClick: () => void, fullScreenURL?: string, showFullScreen?: boolean, showAccountMenu?: boolean, onRefresh?: () => void, showClose?: boolean, showMenu?: boolean, onClose?: () => void }) => {
  const theme = useTheme();

  return (
    <Grid item textAlign='right' xs={showFullScreen && showAccountMenu ? 2.7 : 1.4}>
      {!onRefresh && !showClose &&
        <Grid container direction='row' item width='fit-content'>
          {showFullScreen && fullScreenURL &&
            <FullScreenIcon url={fullScreenURL} />
          }
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
        </Grid>
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
            : <VaadinIcon icon={`vaadin:home${theme.palette.mode === 'light' ? '-o' : ''}`} style={{ color: `${theme.palette.secondary.light}`, height: '22px', width: '22px' }} />
          }
        </IconButton>
      }
    </Grid>
  );
};

function HeaderBrand({ _centerItem, address, backgroundDefault, fullScreenURL = '/', isRefreshing, noBorder = false, onBackClick, onClose, onRefresh, paddingBottom = 11, shortBorder, showAccountMenu, showBackArrow, showBrand, showClose, showCloseX, showFullScreen = false, showMenu, style, text, withSteps = null }: Props): React.ReactElement<Props> {
  const onAction = useContext(ActionContext);
  const setIconRef = useRef(null);
  const setMenuRef = useRef(null);

  const [isMenuOpen, setOpenMenu] = useState(false);
  const [isAccountMenuOpen, setShowAccountMenu] = useState(false);

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

  return (
    <>
      <Container
        disableGutters
        sx={{
          bgcolor: backgroundDefault ? 'background.default' : showBrand ? 'background.paper' : 'transparent',
          borderBottom: `${noBorder || shortBorder ? 'none' : '0.5px solid'}`,
          borderColor: 'secondary.light',
          lineHeight: 0,
          p: showBrand ? '7px 30px 7px' : `18px ${showFullScreen ? '5px' : '20px'} ${paddingBottom}px 20px`,
          ...style
        }}
      >
        <Grid alignItems='center' container justifyContent='space-between'>
          <LeftIcon
            onBackClick={onBackClick}
            showBackArrow={showBackArrow}
            showBrand={showBrand}
          />
          {_centerItem ??
            <CenterItem
              showBrand={showBrand}
              text={text}
              withSteps={withSteps}
            />
          }
          <RightItem
            _handleMenuClick={_handleMenuClick}
            _onClose={_onClose}
            fullScreenURL={fullScreenURL}
            isRefreshing={isRefreshing}
            onClose={onClose}
            onRefresh={onRefresh}
            showAccountMenu={showAccountMenu}
            showBrand={showBrand}
            showClose={showClose}
            showCloseX={showCloseX}
            showFullScreen={showFullScreen}
            showMenu={showMenu}
          />
        </Grid>
        {shortBorder &&
          <Divider sx={{ bgcolor: 'secondary.main', height: '3px', margin: '5px auto', width: '138px' }} />
        }
      </Container>
      <Menu
        isMenuOpen={isMenuOpen}
        setShowMenu={setOpenMenu}
      />
      {address &&
        <AccountMenu
          address={address}
          isMenuOpen={isAccountMenuOpen}
          setShowMenu={setShowAccountMenu}
        />
      }
    </>
  );
}

export default React.memo(HeaderBrand);
