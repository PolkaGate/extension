// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faHistory, faPaperPlane, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon } from '@mui/icons-material';
import { Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { HorizontalMenuItem, PoolStakingIcon } from '../components';
import { useAccount, useApi, useFormatted, useTranslation } from '../hooks';
import { windowOpen } from '../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../util/constants';

interface Props {
  address: AccountId | string;
  quickActionOpen?: string | boolean;
  handleOpen: () => void;
  handleClose: () => false | void;
}

export default function QuickAction({ address, handleClose, handleOpen, quickActionOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);
  const history = useHistory();

  const account = useAccount(address);
  const api = useApi(address);

  const goToSend = useCallback(() => {
    address && account?.genesisHash && windowOpen(`/send/${String(address)}/undefined`).catch(console.error);
  }, [account?.genesisHash, address]);

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

  const ICON_SIZE = 10;
  const isSlideOpen = quickActionOpen === address;

  const movingParts = (
    <Grid
      alignItems='center'
      bgcolor='background.paper'
      container
      justifyContent='space-around'
      sx={{
        border: '0.5px solid',
        borderColor: 'secondary.light',
        borderRadius: '0 5px 5px 0',
        boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.55)',
        flexFlow: 'nowrap',
        minWidth: 'calc(100% - 50px)',
        pl: '30px',
        pr: '10px',
        width: 'calc(100% - 50px)'
      }}
    >

      <HorizontalMenuItem
        divider
        dividerHeight={20}
        exceptionWidth={40}
        icon={
          <FontAwesomeIcon
            color={
              account?.genesisHash
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
            }
            icon={faPaperPlane}
            style={{ height: '20px' }}
          />
        }
        onClick={goToSend}
        textDisabled={!account?.genesisHash}
        title={t<string>('Send')}
        titleFontSize={10}
      />
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        exceptionWidth={45}
        icon={
          !STAKING_CHAINS.includes(account?.genesisHash)
            ? <PoolStakingIcon
              color={theme.palette.action.disabledBackground}
              height={30}
            />
            : <PoolStakingIcon
              color={theme.palette.text.primary}
              height={30}
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
                : 'action.disabledBackground',
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
          <vaadin-icon icon='vaadin:piggy-bank-coin' style={{ height: '23px', color: `${CROWDLOANS_CHAINS.includes(account?.genesisHash) ? theme.palette.text.primary : theme.palette.action.disabledBackground}` }} />
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
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
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
  );

  return (
    <>
      <IconButton
        onClick={isSlideOpen ? handleClose : handleOpen}
        sx={{
          '&:hover': {
            backgroundColor: 'background.paper'
          },
          bgcolor: 'background.paper',
          borderRadius: '0 20px 20px 0',
          height: '17px',
          ml: isSlideOpen ? `${(9.76 - 8.19)}px` : 0,
          p: 0,
          transform: isSlideOpen ? 'rotate(-180deg)' : 'none',
          transitionDuration: '0.3s',
          transitionProperty: 'transform',
          width: '8.19px',
          zIndex: 6
        }}
      >
        <ArrowForwardIosIcon sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : 'white', fontSize: ICON_SIZE, ml: '-2px', stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.5px' }} />
      </IconButton>
      <Slide
        direction='right'
        in={isSlideOpen}
        style={{ backgroundColor: 'background.default', height: '56px', left: 0, position: 'absolute', top: '-14px', width: '320px', zIndex: 5 }}
        timeout={{
          enter: 600,
          exit: 500
        }}
      >
        {movingParts}
      </Slide>
    </>
  );
}
