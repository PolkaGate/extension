// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faHistory, faPaperPlane, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon } from '@mui/icons-material';
import { Box, Grid, IconButton, Slide, useTheme } from '@mui/material';
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
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  containerRef: React.RefObject<HTMLElement>
}

const ARROW_ICON_SIZE = 17;
const ACTION_ICON_SIZE = '27px';
const TITLE_FONT_SIZE = 13;

export default function QuickActionFullScreen({ address, containerRef, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);
  const history = useHistory();

  const account = useAccount(address);
  const api = useApi(address);

  const handleOpen = useCallback(() => setQuickActionOpen(String(address)), [address, setQuickActionOpen]);
  const handleClose = useCallback(() => quickActionOpen === address && setQuickActionOpen(undefined), [address, quickActionOpen, setQuickActionOpen]);

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

  const isSlideOpen = quickActionOpen === address;

  const movingParts = (
    <Grid
      bgcolor='background.paper'
      container
      justifyContent='space-around'
      sx={{
        border: '0.5px solid',
        borderColor: 'secondary.light',
        borderRadius: '0 6px 6px 0',
        boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.55)',
        flexFlow: 'nowrap',
        minWidth: 'calc(100% - 50px)',
        pl: '20px',
        pr: '10px',
        pt: '5px',
        width: 'calc(100% - 50px)'
      }}
    >
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        icon={
          <FontAwesomeIcon
            color={
              account?.genesisHash
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
            }
            icon={faPaperPlane}
            style={{ height: ACTION_ICON_SIZE }}
          />
        }
        onClick={goToSend}
        textDisabled={!account?.genesisHash}
        title={t<string>('Send')}
        titleFontSize={TITLE_FONT_SIZE}
      />
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        icon={
          !STAKING_CHAINS.includes(account?.genesisHash)
            ? <PoolStakingIcon
              color={theme.palette.action.disabledBackground}
              height={38}
              width={38}
            />
            : <PoolStakingIcon
              color={theme.palette.text.primary}
              height={38}
              width={38}
            />
        }
        iconMarginTop='-10px'
        labelMarginTop='-5px'
        onClick={goToPoolStaking}
        textDisabled={!STAKING_CHAINS.includes(account?.genesisHash)}
        title={t<string>('Pool Staking')}
        titleFontSize={TITLE_FONT_SIZE}
        titleLineHeight={1}
      />
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        icon={
          <BoyIcon
            sx={{
              color: STAKING_CHAINS.includes(account?.genesisHash)
                ? 'text.primary'
                : 'action.disabledBackground',
              fontSize: '40px'
            }}
          />
        }
        iconMarginTop='-10px'
        labelMarginTop='-5px'
        onClick={goToSoloStaking}
        textDisabled={!STAKING_CHAINS.includes(account?.genesisHash)}
        title={t<string>('Solo Staking')}
        titleFontSize={TITLE_FONT_SIZE}
        titleLineHeight={1}
      />
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        icon={
          <vaadin-icon icon='vaadin:piggy-bank-coin' style={{ height: '30px', color: `${CROWDLOANS_CHAINS.includes(account?.genesisHash) ? theme.palette.text.primary : theme.palette.action.disabledBackground}` }} />
        }
        onClick={goToCrowdLoans}
        textDisabled={!CROWDLOANS_CHAINS.includes(account?.genesisHash)}
        title={t<string>('Crowdloans')}
        titleFontSize={TITLE_FONT_SIZE}
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
            style={{ height: ACTION_ICON_SIZE }}
          />}
        onClick={goToGovernanceOrHistory}
        textDisabled={!account?.genesisHash}
        title={t<string>(GOVERNANCE_CHAINS.includes(account?.genesisHash) ? 'Governance' : 'History')}
        titleFontSize={TITLE_FONT_SIZE}
      />
    </Grid>
  );

  return (
    <Grid item sx={{ bottom: 0, left: 0, position: 'absolute', top: 0, width: 'fit-content' }}>
      <Grid container item onClick={isSlideOpen ? handleClose : handleOpen} sx={{ inset: '0 auto 0 -1px', position: 'absolute', width: '15px' }}>
        <Box sx={{ bgcolor: theme.palette.mode === 'light' ? 'black' : 'secondary.light', borderRadius: '5px 0 0 5px', cursor: 'pointer', inset: '0 auto 0 0', position: 'absolute', width: '15.5px', zIndex: 6 }} />
        <IconButton sx={{ '&:hover': { backgroundColor: 'background.paper' }, bgcolor: 'background.paper', borderRadius: isSlideOpen ? '20px 0 0 20px' : '0 20px 20px 0', height: '25.98px', inset: isSlideOpen ? 'auto -1px 92px auto' : 'auto auto 92px -1px', p: 0, position: 'absolute', transition: 'border-radius 0.2s ease, inset 0.2s ease', width: '15px', zIndex: 6 }}>
          <ArrowForwardIosIcon sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : 'white', fontSize: ARROW_ICON_SIZE, stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.5px', transform: isSlideOpen ? 'rotate(-180deg)' : 'none', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
        </IconButton>
        <Slide
          container={containerRef.current}
          direction='right'
          in={isSlideOpen}
          style={{ backgroundColor: 'background.default', bottom: '71px', height: '65px', left: '10px', position: 'absolute', width: '700px', zIndex: 1 }}
          timeout={{
            enter: 600,
            exit: 500
          }}
        >
          {movingParts}
        </Slide>
      </Grid>
    </Grid>
  );
}
