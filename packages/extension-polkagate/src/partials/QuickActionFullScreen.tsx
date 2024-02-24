// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faHistory, faPaperPlane, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon } from '@mui/icons-material';
import { Box, ClickAwayListener, Divider, Grid, IconButton, Slide, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { PoolStakingIcon } from '../components';
import { useAccount, useApi, useTranslation } from '../hooks';
import { windowOpen } from '../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../util/constants';

interface Props {
  address: AccountId | string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  containerRef: React.RefObject<HTMLElement>
}

type QuickActionButtonType = {
  disabled?: boolean;
  divider?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}

const ARROW_ICON_SIZE = 17;
const ACTION_ICON_SIZE = '27px';
const TITLE_FONT_SIZE = 13;

export default function QuickActionFullScreen({ address, containerRef, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();

  const account = useAccount(address);
  const api = useApi(address);

  const borderColor = useMemo(() => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [theme.palette.mode]);

  const handleOpen = useCallback(() => setQuickActionOpen(String(address)), [address, setQuickActionOpen]);
  const handleClose = useCallback(() => quickActionOpen === address && setQuickActionOpen(undefined), [address, quickActionOpen, setQuickActionOpen]);

  const goToSend = useCallback(() => {
    address && account?.genesisHash && windowOpen(`/send/${String(address)}/undefined`).catch(console.error);
  }, [account?.genesisHash, address]);

  const goToPoolStaking = useCallback(() => {
    address && STAKING_CHAINS.includes(account?.genesisHash ?? '') && history.push({
      pathname: `/pool/${String(address)}/`,
      state: { api }
    });
  }, [account?.genesisHash, address, api, history]);

  const goToSoloStaking = useCallback(() => {
    address && STAKING_CHAINS.includes(account?.genesisHash ?? '') && history.push({
      pathname: `/solo/${String(address)}/`,
      state: { api }
    });
  }, [account?.genesisHash, address, api, history]);

  const goToCrowdLoans = useCallback(() => {
    address && CROWDLOANS_CHAINS.includes(account?.genesisHash ?? '') &&
      history.push({
        pathname: `/crowdloans/${String(address)}`
      });
  }, [account?.genesisHash, address, history]);

  const goToGovernanceOrHistory = useCallback(() => {
    GOVERNANCE_CHAINS.includes(account?.genesisHash ?? '')
      ? windowOpen(`/governance/${address}/referenda`).catch(console.error)
      : account?.genesisHash && history.push({ pathname: `/history/${String(address)}` });
  }, [account?.genesisHash, address, history]);

  const nullF = useCallback(() => null, []);

  const isSlideOpen = quickActionOpen === address;

  const QuickActionButton = ({ disabled, divider, icon, onClick, title }: QuickActionButtonType) => {
    return (
      <>
        <Grid alignItems='center' container direction='column' display='flex' item justifyContent='center' onClick={!disabled ? onClick : nullF} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : borderColor }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', minWidth: '80px', p: '0 5px', width: 'fit-content' }}>
          <Grid alignItems='center' container height='40px' item justifyContent='center' width='fit-content'>
            {icon}
          </Grid>
          <Grid alignItems='center' height='25px' item textAlign='center' width='max-content'>
            <Typography fontSize='14px' fontWeight={theme.palette.mode === 'dark' ? 300 : 400} sx={{ opacity: disabled ? 0.7 : 1, pt: '3px' }}>
              {title}
            </Typography>
          </Grid>
        </Grid>
        {divider &&
          <Grid alignItems='center' item justifyContent='center'>
            <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: '30px', width: '2px' }} />
          </Grid>
        }
      </>
    );
  };

  const movingParts = (
    <Grid alignItems='center' bgcolor='background.paper' container justifyContent='space-around' sx={{ border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '0 6px 6px 0', boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.55)', flexFlow: 'nowrap', p: '5px 10px 5px 20px', width: 'calc(fit-content + 50px)' }}>
      <QuickActionButton
        disabled={!account?.genesisHash}
        divider
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
        title={t('Send')}
      />
      <QuickActionButton
        disabled={!STAKING_CHAINS.includes(account?.genesisHash ?? '')}
        divider
        icon={
          <PoolStakingIcon
            color={!STAKING_CHAINS.includes(account?.genesisHash ?? '') ? theme.palette.action.disabledBackground : theme.palette.text.primary}
            height={38}
            width={38}
          />
        }
        onClick={goToPoolStaking}
        title={t('Pool Staking')}
      />
      <QuickActionButton
        disabled={!STAKING_CHAINS.includes(account?.genesisHash ?? '')}
        divider
        icon={
          <BoyIcon
            sx={{
              color: STAKING_CHAINS.includes(account?.genesisHash ?? '')
                ? 'text.primary'
                : 'action.disabledBackground',
              fontSize: '40px'
            }}
          />
        }
        onClick={goToSoloStaking}
        title={t('Solo Staking')}
      />
      <QuickActionButton
        disabled={!CROWDLOANS_CHAINS.includes(account?.genesisHash ?? '')}
        divider
        icon={
          <vaadin-icon icon='vaadin:piggy-bank-coin' style={{ height: '30px', color: `${CROWDLOANS_CHAINS.includes(account?.genesisHash) ? theme.palette.text.primary : theme.palette.action.disabledBackground}` }} />
        }
        onClick={goToCrowdLoans}
        title={t('Crowdloans')}
      />
      <QuickActionButton
        disabled={!account?.genesisHash}
        icon={
          <FontAwesomeIcon
            color={
              account?.genesisHash
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
            }
            icon={GOVERNANCE_CHAINS.includes(account?.genesisHash ?? '') ? faVoteYea : faHistory}
            style={{ height: ACTION_ICON_SIZE }}
          />}
        onClick={goToGovernanceOrHistory}
        title={t<string>(GOVERNANCE_CHAINS.includes(account?.genesisHash ?? '') ? 'Governance' : 'History')}
      />
    </Grid>
  );

  return (
    <Grid item sx={{ bottom: 0, left: 0, position: 'absolute', top: 0, width: 'fit-content' }}>
      <ClickAwayListener onClickAway={handleClose}>
        <Grid container item onClick={isSlideOpen ? handleClose : handleOpen} sx={{ inset: '0 auto 0 -1px', position: 'absolute', width: '15px' }}>
          <Box sx={{ bgcolor: theme.palette.mode === 'light' ? 'black' : 'secondary.light', borderRadius: '5px 0 0 5px', cursor: 'pointer', inset: '0 auto 0 0', position: 'absolute', width: '15.5px', zIndex: 6 }} />
          <IconButton sx={{ '&:hover': { backgroundColor: 'background.paper' }, bgcolor: 'background.paper', borderRadius: isSlideOpen ? '20px 0 0 20px' : '0 20px 20px 0', height: '25.98px', inset: isSlideOpen ? 'auto -1px 72px auto' : 'auto auto 72px -1px', p: 0, position: 'absolute', transition: 'border-radius 0.2s ease, inset 0.2s ease', width: '15px', zIndex: 6 }}>
            <ArrowForwardIosIcon sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : 'white', fontSize: ARROW_ICON_SIZE, stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.5px', transform: isSlideOpen ? 'rotate(-180deg)' : 'none', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
          </IconButton>
          <Slide
            container={containerRef.current}
            direction='right'
            in={isSlideOpen}
            style={{ backgroundColor: 'background.default', bottom: '48px', columnGap: '10px', left: '10px', position: 'absolute', width: 'fit-content', zIndex: 1 }}
            timeout={{
              enter: 600,
              exit: 500
            }}
          >
            {movingParts}
          </Slide>
        </Grid>
      </ClickAwayListener>
    </Grid>
  );
}