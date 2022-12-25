// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faHistory, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, ClickAwayListener, Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { poolStakingBlack, poolStakingWhite } from '../assets/icons';
import { HorizontalMenuItem } from '../components';
import { useAccount, useApi, useFormatted, useProxies, useTranslation } from '../hooks';

interface Props {
  address: AccountId | string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
}

export default function QuickAction({ address, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);
  const history = useHistory();

  const account = useAccount(address);
  const api = useApi(address);
  const availableProxiesForTransfer = useProxies(api, formatted, ['Any']);

  const handleOpen = useCallback(() => setQuickActionOpen(String(address)), [address, setQuickActionOpen]);
  const handleClose = useCallback(() => quickActionOpen === address && setQuickActionOpen(undefined), [address, quickActionOpen, setQuickActionOpen]);

  const goToSend = useCallback(() => {
    if (!availableProxiesForTransfer?.length && account?.isExternal) {
      return; // Account is external and does not have any available proxy for transfer funds
    }

    account?.genesisHash && history.push({
      pathname: `/send/${String(address)}`,
      state: { api }
    });
  }, [availableProxiesForTransfer?.length, account, history, address, api]);

  const goToPoolStaking = useCallback(() => {
    address && history.push({
      pathname: `/pool/${String(address)}/`,
      state: { api }
    });
  }, [address, api, history]);

  const goToSoloStaking = useCallback(() => {
    address && history.push({
      pathname: `/solo/${String(address)}/`,
      state: { api }
    });
  }, [address, api, history]);

  const goToHistory = useCallback(() => {
    history.push({
      pathname: `/history/${String(address)}`
    });
  }, [address, history]);

  const movingParts = (
    <Grid
      alignItems='center'
      bgcolor='background.paper'
      container
      justifyContent='space-between'
      sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '0 5px 5px 0', boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.55)', flexFlow: 'nowrap' }}
    >
      <Grid container item justifyContent='center' width='13px'>
        <IconButton
          onClick={handleClose}
          sx={{
            '&:hover': {
              backgroundColor: 'secondary.light'
            },
            bgcolor: 'secondary.light',
            borderRadius: '0 20px 20px 0',
            height: '25px',
            p: 0,
            width: '13px'
          }}
        >
          <CloseIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: 15, ml: '-3px', stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.7px' }} />
        </IconButton>
      </Grid>
      <Grid container item justifyContent='space-around' mr='10px' sx={{ flexFlow: 'nowrap' }} width='calc(100% - 50px)'>
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          exceptionWidth={40}
          icon={
            <FontAwesomeIcon
              color={(!availableProxiesForTransfer?.length && account?.isExternal) ? theme.palette.action.disabledBackground : theme.palette.text.primary}
              icon={faPaperPlane}
              style={{ height: '20px' }}
            />
          }
          isLoading={availableProxiesForTransfer === undefined && account?.isExternal}
          onClick={goToSend}
          textDisabled={(!availableProxiesForTransfer?.length && account?.isExternal)}
          title={t<string>('Send')}
          titleFontSize={10}
        />
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          exceptionWidth={45}
          icon={<Box component='img' src={theme.palette.mode === 'dark' ? poolStakingWhite : poolStakingBlack} sx={{ height: '30px' }} />}
          labelMarginTop='-5px'
          onClick={goToPoolStaking}
          title={t<string>('Pool Staking')}
          titleFontSize={10}
          titleLineHeight={1}
        />
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          exceptionWidth={37}
          icon={<BoyIcon sx={{ color: 'text.primary', fontSize: '30px' }} />}
          labelMarginTop='-5px'
          onClick={goToSoloStaking}
          title={t<string>('Solo Staking')}
          titleFontSize={10}
          titleLineHeight={1}
        />
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          icon={<vaadin-icon icon='vaadin:piggy-bank-coin' style={{ height: '23px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToHistory}
          title={t<string>('Crowdloans')}
          titleFontSize={10}
        />
        <HorizontalMenuItem
          dividerHeight={20}
          icon={
            <FontAwesomeIcon
              color={theme.palette.mode === 'dark' ? 'white' : 'black'}
              icon={faHistory}
              style={{ height: '20px' }}
            />}
          onClick={goToHistory}
          title={t<string>('History')}
          titleFontSize={10}
        />
      </Grid>
    </Grid>
  );

  return (
    <>
      <ClickAwayListener onClickAway={handleClose}>
        <div>
          <IconButton
            onClick={handleOpen}
            sx={{
              '&:hover': {
                backgroundColor: 'secondary.light'
              },
              bgcolor: 'secondary.light',
              borderRadius: '0 20px 20px 0',
              height: '25px',
              p: 0,
              width: '13px'
            }}
          >
            <ArrowForwardIosIcon sx={{ color: theme.palette.mode === 'dark' ? 'black' : 'white', fontSize: 15, ml: '-2px', stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.5px' }} />
          </IconButton>
        </div>
      </ClickAwayListener>
      <Slide direction='right' in={quickActionOpen === address} style={{ backgroundColor: 'background.default', height: '56px', left: 0, position: 'absolute', top: '-14px', width: '96%', zIndex: 10 }}>
        {movingParts}
      </Slide>
    </>
  );
}
