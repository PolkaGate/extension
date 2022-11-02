// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faClose,faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowBackIos as ArrowBackIosIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useRef, useState } from 'react';

import { logoWhite } from '../assets/logos';
import { ActionContext } from '../components';
import useOutsideClick from '../hooks/useOutsideClick';
import { AccountMenuInfo } from '../util/types';
import AccMenuInside from './AccMenuInside';
import Menu from './Menu';

interface Props {
  showBackArrow?: boolean;
  showBrand?: boolean;
  showMenu?: boolean;
  withSteps?: { currentStep: string | number, totalSteps: string | number } | null;
  text?: React.ReactNode;
  onBackClick?: () => void;
  onRefresh?: () => void;
  showClose?: boolean;
  isRefreshing?: boolean;
  _centerItem?: JSX.Element;
  noBorder?: boolean;
  shortBorder?: boolean;
  paddingBottom?: number;
  accountMenuInfo?: AccountMenuInfo;
}

function HeaderBrand({ _centerItem, accountMenuInfo, isRefreshing, noBorder = false, onBackClick, onRefresh, paddingBottom = 11, shortBorder, showBackArrow, showBrand, showClose, showMenu, text, withSteps = null }: Props): React.ReactElement<Props> {
  const [isMenuOpen, setShowMenu] = useState(false);
  const [isAccountMenuOpen, setShowAccountMenu] = useState(false);
  const setIconRef = useRef(null);
  const setMenuRef = useRef(null);
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  useOutsideClick([setIconRef, setMenuRef], (): void => {
    isMenuOpen && setShowMenu(!isMenuOpen);
  });

  const _handleMenuClick = useCallback(
    () => {
      if (accountMenuInfo) {
        setShowAccountMenu((open) => !open);
      } else {
        setShowMenu((open) => !open);
      }
    },
    [accountMenuInfo]
  );

  const onClose = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const LeftIcon = () => (
    <Grid item>
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
          src={logoWhite}
          sx={{ height: 38, width: 38 }}
        />
      }
    </Grid>
  );

  const CenterItem = () => (
    <Grid
      display='inline-flex'
      item
    >
      <Typography
        color={showBrand ? '#ffffff' : 'text.primary'}
        fontFamily={showBrand ? 'Eras' : 'inherit'}
        fontWeight={400}
        sx={{ fontSize: showBrand ? '30px' : '20px', lineHeight: showBrand ? 'inherit' : 1.9, letterSpacing: '-0.015em' }}
      >
        {text}
      </Typography>
      {withSteps &&
        <Typography
          color={showBrand ? '#ffffff' : 'text.primary'}
          fontFamily='inherit'
          fontSize='20px'
          fontWeight={400}
          letterSpacing='-0.015em'
          p='5px'
        >
          <span>(</span>
          <span style={{ color: theme.palette.secondary.light }}>{withSteps.currentStep}</span>
          <span>{'/' + withSteps.totalSteps.toString() + ')'}</span>
        </Typography>
      }
    </Grid>
  );

  const RightItem = () => (
    <Grid
      item
      // sx={{ height: '38px' }}
    >
      {!onRefresh && !showClose &&
        <IconButton
          aria-label='menu'
          color='inherit'
          edge='start'
          onClick={_handleMenuClick}
          size='small'
          sx={{ p: 0, visibility: showMenu ? 'visible' : 'hidden' }}
        >
          <MenuIcon sx={{ color: showBrand ? '#fff' : 'secondary.light', fontSize: 38 }} />
        </IconButton>
      }
      {!!onRefresh &&
        <IconButton
          aria-label='menu'
          color='inherit'
          edge='start'
          onClick={onRefresh}
          size='small'
          sx={{ p: 0 }}
        >
          <FontAwesomeIcon
            color={theme.palette.secondary.light}
            icon={faRefresh}
            size='lg'
            spin={isRefreshing}
          />
        </IconButton>
      }
      {showClose &&
        <IconButton
          aria-label='menu'
          color='inherit'
          edge='start'
          onClick={onClose}
          size='small'
          sx={{ p: 0 }}
        >
          <FontAwesomeIcon
            color={theme.palette.secondary.light}
            icon={faClose}
            size='lg'
          />
        </IconButton>
      }
    </Grid>
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
      {
        isAccountMenuOpen && accountMenuInfo?.account && accountMenuInfo?.chain &&
        <AccMenuInside
          address={accountMenuInfo.account.address}
          chain={accountMenuInfo.chain}
          formatted={accountMenuInfo.formatted}
          isExternal={accountMenuInfo.account.isExternal}
          isHardware={accountMenuInfo.account.isHardware}
          isMenuOpen={isAccountMenuOpen}
          name={accountMenuInfo.account.name}
          setShowMenu={setShowAccountMenu}
          type={accountMenuInfo.type}
        />
      }
      <Container sx={{
        background: showBrand ? 'radial-gradient(88.81% 88.81% at 50% 50.75%, #99004F 0%, rgba(153, 0, 79, 0) 100%)' : 'transparent',
        borderBottom: `${noBorder || shortBorder ? '' : '0.5px solid'}`,
        borderColor: 'secondary.light',
        lineHeight: 0,
        p: `18px 30px ${paddingBottom}px`
      }}
      >
        <Grid
          alignItems='center'
          container
          justifyContent='space-between'
        >
          <LeftIcon />
          {_centerItem ?? <CenterItem />}
          <RightItem />
        </Grid>
        {shortBorder &&
          <Divider sx={{ bgcolor: 'secondary.main', height: '3px', margin: '5px auto', width: '138px' }} />
        }
      </Container>
    </>
  );
}

export default React.memo(HeaderBrand);
