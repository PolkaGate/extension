// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faHistory, faPaperPlane,faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, ClickAwayListener, Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { poolStakingBlack, poolStakingDisabledDark, poolStakingDisabledLight, poolStakingWhite } from '../assets/icons';
import { HorizontalMenuItem } from '../components';
import { useAccount, useApi, useFormatted, useProxies, useTranslation } from '../hooks';
import { windowOpen } from '../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../util/constants';

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

  const sendDisabled = !account?.genesisHash || (!availableProxiesForTransfer?.length && account?.isExternal);
  const goToSend = useCallback(() => {
    !sendDisabled && history.push({
      pathname: `/send/${String(address)}`,
      state: { api }
    });
  }, [sendDisabled, history, address, api]);

  const goToPoolStaking = useCallback(() => {
    address && STAKING_CHAINS.includes(account?.genesisHash) && history.push({
      pathname: `/pool/${String(address)}/`,
      state: { api }
    });
  }, [account?.genesisHash, address, api, history]);

  const goToSoloStaking = useCallback(() => {
    address && STAKING_CHAINS.includes(account?.genesisHash) && history.push({
      pathname: `/solo/${String(address)}/`,
      state: { api }
    });
  }, [account?.genesisHash, address, api, history]);

  const goToCrowdLoans = useCallback(() => {
    formatted && CROWDLOANS_CHAINS.includes(account?.genesisHash) &&
      history.push({
        pathname: `/crowdloans/${address}`
      });
  }, [account?.genesisHash, address, formatted, history]);

  const goToGovernanceOrHistory = useCallback(() => {
    GOVERNANCE_CHAINS.includes(account?.genesisHash)
      ? windowOpen(`/governance/${address}/referenda`).catch(console.error)
      : account?.genesisHash && history.push({ pathname: `/history/${String(address)}` });
  }, [account?.genesisHash, address, history]);

  const movingParts = (
    <Grid
      alignItems='center'
      bgcolor='background.paper'
      container
      justifyContent='space-between'
      sx={{ border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '0 5px 5px 0', boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.55)', flexFlow: 'nowrap' }}
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
              color={sendDisabled ? theme.palette.action.disabled : theme.palette.text.primary}
              icon={faPaperPlane}
              style={{ height: '20px' }}
            />
          }
          isLoading={availableProxiesForTransfer === undefined && account?.isExternal}
          onClick={goToSend}
          textDisabled={sendDisabled}
          title={t<string>('Send')}
          titleFontSize={10}
        />
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          exceptionWidth={45}
          icon={
            <Box
              component='img'
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              src={!STAKING_CHAINS.includes(account?.genesisHash)
                ? theme.palette.mode === 'dark' ? poolStakingDisabledDark : poolStakingDisabledLight
                : theme.palette.mode === 'dark' ? poolStakingWhite : poolStakingBlack
              }
              sx={{ height: '30px' }}
            />
          }
          labelMarginTop='-5px'
          onClick={goToPoolStaking}
          textDisabled={!STAKING_CHAINS.includes(account?.genesisHash)}
          title={t<string>('Pool Staking')}
          titleFontSize={10}
          titleLineHeight={1}

        />
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          exceptionWidth={37}
          icon={
            <BoyIcon
              sx={{
                color: STAKING_CHAINS.includes(account?.genesisHash)
                  ? 'text.primary'
                  : 'action.disabled',
                fontSize: '30px'
              }}
            />
          }
          labelMarginTop='-5px'
          onClick={goToSoloStaking}
          textDisabled={!STAKING_CHAINS.includes(account?.genesisHash)}
          title={t<string>('Solo Staking')}
          titleFontSize={10}
          titleLineHeight={1}
        />
        <HorizontalMenuItem
          divider
          dividerHeight={20}
          icon={
            <vaadin-icon
              icon='vaadin:piggy-bank-coin'
              style={{ height: '23px', color: `${CROWDLOANS_CHAINS.includes(account?.genesisHash) ? theme.palette.text.primary : theme.palette.action.disabled}` }}
            />
          }
          onClick={goToCrowdLoans}
          textDisabled={!CROWDLOANS_CHAINS.includes(account?.genesisHash)}
          title={t<string>('Crowdloans')}
          titleFontSize={10}

        />
        <HorizontalMenuItem
          dividerHeight={20}
          icon={
            <FontAwesomeIcon
              color={
                account?.genesisHash
                  ? `${theme.palette.text.primary}`
                  : `${theme.palette.action.disabled}`
              }
              icon={GOVERNANCE_CHAINS.includes(account?.genesisHash) ? faVoteYea : faHistory}
              style={{ height: '20px' }}
            />}
          onClick={goToGovernanceOrHistory}
          textDisabled={!account?.genesisHash}
          title={t<string>(GOVERNANCE_CHAINS.includes(account?.genesisHash) ? 'Governance' : 'History')}
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
      <Slide
        direction='right'
        in={quickActionOpen === address}
        style={{ backgroundColor: 'background.default', height: '56px', left: 0, position: 'absolute', top: '-14px', width: '320px', zIndex: 10 }}
      >
        {movingParts}
      </Slide>
    </>
  );
}
