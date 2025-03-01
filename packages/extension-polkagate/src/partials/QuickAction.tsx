// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { faHistory, faPaperPlane, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon } from '@mui/icons-material';
import { Grid, IconButton, Slide, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { HorizontalMenuItem, PoolStakingIcon, VaadinIcon } from '../components';
import { useInfo, useTranslation } from '../hooks';
import { windowOpen } from '../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, NATIVE_TOKEN_ASSET_ID, STAKING_CHAINS } from '../util/constants';

interface Props {
  address: AccountId | string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
}

const ICON_SIZE = 10;

export default function QuickAction({ address, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();
  const { api, formatted, genesisHash } = useInfo(address);

  const handleOpen = useCallback(() => setQuickActionOpen(String(address)), [address, setQuickActionOpen]);
  const handleClose = useCallback(() => quickActionOpen === address && setQuickActionOpen(undefined), [address, quickActionOpen, setQuickActionOpen]);

  const isStakingEnabled = genesisHash && STAKING_CHAINS.includes(genesisHash);
  const isCrowdLoanEnabled = genesisHash && CROWDLOANS_CHAINS.includes(genesisHash);
  const isGovernanceEnabled = genesisHash && GOVERNANCE_CHAINS.includes(genesisHash);

  const goToSend = useCallback(() => {
    address && genesisHash && windowOpen(`/send/${String(address)}/${NATIVE_TOKEN_ASSET_ID}`).catch(console.error);
  }, [genesisHash, address]);

  const goToPoolStaking = useCallback(() => {
    address && isStakingEnabled && history.push({
      pathname: `/pool/${String(address)}/`,
      state: { api }
    });
  }, [address, isStakingEnabled, history, api]);

  const goToSoloStaking = useCallback(() => {
    address && isStakingEnabled && history.push({
      pathname: `/solo/${String(address)}/`,
      state: { api }
    });
  }, [address, isStakingEnabled, history, api]);

  const goToCrowdLoans = useCallback(() => {
    formatted && isCrowdLoanEnabled &&
      history.push({
        pathname: `/crowdloans/${address}`
      });
  }, [formatted, isCrowdLoanEnabled, history, address]);

  const goToGovernanceOrHistory = useCallback(() => {
    isGovernanceEnabled
      ? address && windowOpen(`/governance/${address}/referenda`).catch(console.error)
      : genesisHash && history.push({ pathname: `/history/${String(address)}` });
  }, [isGovernanceEnabled, address, genesisHash, history]);

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
        exceptionWidth={40}
        icon={
          <FontAwesomeIcon
            color={
              genesisHash
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
            }
            icon={faPaperPlane}
            style={{ height: '20px' }}
          />
        }
        onClick={goToSend}
        textDisabled={!genesisHash}
        title={t('Send')}
        titleFontSize={10}
      />
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        exceptionWidth={45}
        icon={
          !isStakingEnabled
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
        textDisabled={!isStakingEnabled}
        title={t('Pool Staking')}
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
              color: isStakingEnabled
                ? 'text.primary'
                : 'action.disabledBackground',
              fontSize: '30px'
            }}
          />
        }
        labelMarginTop='-5px'
        onClick={goToSoloStaking}
        textDisabled={!isStakingEnabled}
        title={t('Solo Staking')}
        titleFontSize={10}
        titleLineHeight={1}
      />
      <HorizontalMenuItem
        divider
        dividerHeight={20}
        icon={
          <VaadinIcon icon='vaadin:piggy-bank-coin' style={{ height: '23px', color: `${isCrowdLoanEnabled ? theme.palette.text.primary : theme.palette.action.disabledBackground}` }} />
        }
        onClick={goToCrowdLoans}
        textDisabled={!isCrowdLoanEnabled}
        title={t('Crowdloans')}
        titleFontSize={10}
      />
      <HorizontalMenuItem
        dividerHeight={20}
        icon={
          <FontAwesomeIcon
            color={
              genesisHash
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
            }
            icon={isGovernanceEnabled ? faVoteYea : faHistory}
            style={{ height: '20px' }}
          />}
        onClick={goToGovernanceOrHistory}
        textDisabled={!genesisHash}
        title={t(isGovernanceEnabled ? 'Governance' : 'History')}
        titleFontSize={10}
      />
    </Grid>
  );

  return (
    <Grid container item onClick={isSlideOpen ? handleClose : handleOpen} sx={{ inset: '0 auto 0 -1px', position: 'absolute', width: '10px' }}>
      <Grid container item sx={{ bgcolor: theme.palette.mode === 'light' ? 'black' : '#353535', borderRadius: '5px 0 0 5px', cursor: 'pointer', inset: '0 auto 0 0', position: 'absolute', width: '10px', zIndex: 6 }}></Grid>
      <IconButton
        sx={{ '&:hover': { backgroundColor: 'background.paper' }, bgcolor: 'background.paper', borderRadius: isSlideOpen ? '20px 0 0 20px' : '0 20px 20px 0', height: '17px', inset: isSlideOpen ? 'auto -1px 20px auto' : 'auto auto 20px -1px', p: 0, position: 'absolute', transition: 'border-radius 0.2s ease, inset 0.2s ease', width: '10px', zIndex: 6 }}
      >
        <ArrowForwardIosIcon sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : 'white', fontSize: ICON_SIZE, stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.5px', transform: isSlideOpen ? 'rotate(-180deg)' : 'none', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
      </IconButton>
      <Slide
        direction='right'
        in={isSlideOpen}
        style={{ backgroundColor: 'background.default', bottom: '1px', height: '56px', left: '10px', position: 'absolute', width: '310px', zIndex: 1 }}
        timeout={{
          enter: 600,
          exit: 500
        }}
      >
        {movingParts}
      </Slide>
    </Grid>
  );
}
