// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { faHistory, faPaperPlane, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon, Boy as BoyIcon } from '@mui/icons-material';
import { Box, ClickAwayListener, Divider, Grid, IconButton, Slide, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { noop } from '@polkadot/util';

import { PoolStakingIcon } from '../components';
import { openOrFocusTab } from '../fullscreen/accountDetails/components/CommonTasks';
import { useAccount, useTranslation } from '../hooks';
import HistoryModal from '../popup/history/modal/HistoryModal';
import { GOVERNANCE_CHAINS, STAKING_CHAINS } from '../util/constants';

interface Props {
  address: AccountId | string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  containerRef: React.RefObject<HTMLElement>;
  assetId?: number | string | undefined
}

interface QuickActionButtonType {
  disabled?: boolean;
  divider?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}

const ARROW_ICON_SIZE = 17;
const ACTION_ICON_SIZE = '27px';

const QuickActionButton = React.memo(function QuickActionButton({ disabled, divider, icon, onClick, title }: QuickActionButtonType) {
  const theme = useTheme();

  return (
    <>
      <Grid alignItems='center' container direction='column' display='flex' item justifyContent='center' onClick={!disabled ? onClick : noop} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : 'divider' }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', minWidth: '80px', p: '0 5px', width: 'fit-content' }}>
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
});

function QuickActionFullScreen({ address, assetId, containerRef, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);

  const [showHistory, setShowHistory] = useState<number>();

  const supportGov = useMemo(() => GOVERNANCE_CHAINS.includes(account?.genesisHash ?? ''), [account?.genesisHash]);

  const handleOpen = useCallback(() => setQuickActionOpen(String(address)), [address, setQuickActionOpen]);
  const handleClose = useCallback(() => quickActionOpen === address && setQuickActionOpen(undefined), [address, quickActionOpen, setQuickActionOpen]);

  const goToSend = useCallback(() => {
    address && account?.genesisHash && openOrFocusTab(`/send/${String(address)}/${assetId}`);
  }, [account?.genesisHash, address, assetId]);

  const goToPoolStaking = useCallback(() => {
    address && openOrFocusTab(`/poolfs/${String(address)}/`);
  }, [address]);

  const goToSoloStaking = useCallback(() => {
    address && openOrFocusTab(`/solofs/${String(address)}/`);
  }, [address]);

  const goToGovernance = useCallback(() => {
    supportGov && address && openOrFocusTab(`/governance/${String(address)}/referenda`);
  }, [address, supportGov]);

  const goToHistory = useCallback(() => {
    setShowHistory(1);
  }, []);

  const isSlideOpen = quickActionOpen === address;

  const movingParts = (
    <Grid alignItems='center' bgcolor='background.paper' container justifyContent='space-around' sx={{ border: '0.5px solid', borderColor: '#74747475', borderRadius: '0 6px 6px 0', boxShadow: '0px 0px 10px 5px rgba(0, 0, 0, 0.55)', flexFlow: 'nowrap', p: '5px 10px 5px 20px', width: 'calc(fit-content + 50px)' }}>
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
        disabled={!account?.genesisHash || !supportGov}
        divider
        icon={
          <FontAwesomeIcon
            color={
              supportGov
                ? theme.palette.text.primary
                : theme.palette.action.disabledBackground
            }
            icon={faVoteYea}
            style={{ height: ACTION_ICON_SIZE }}
          />}
        onClick={goToGovernance}
        title={t('Governance')}
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
            icon={faHistory}
            style={{ height: ACTION_ICON_SIZE }}
          />}
        onClick={goToHistory}
        title={t('History')}
      />
    </Grid>
  );

  return (
    <Grid item sx={{ bottom: 0, left: 0, position: 'absolute', top: 0, width: 'fit-content' }}>
      <ClickAwayListener onClickAway={handleClose}>
        <Grid container item onClick={isSlideOpen ? handleClose : handleOpen} sx={{ inset: '0 auto 0 -1px', position: 'absolute', width: '15px' }}>
          <Box sx={{ bgcolor: theme.palette.mode === 'light' ? 'black' : '#353535', borderRadius: '5px 0 0 5px', cursor: 'pointer', inset: '0 auto 0 0', position: 'absolute', width: '15.5px', zIndex: 6 }} />
          <IconButton sx={{ '&:hover': { backgroundColor: 'background.paper' }, bgcolor: 'background.paper', borderRadius: isSlideOpen ? '20px 0 0 20px' : '0 20px 20px 0', height: '25.98px', inset: isSlideOpen ? 'auto -1px 72px auto' : 'auto auto 72px -1px', p: 0, position: 'absolute', transition: 'border-radius 0.2s ease, inset 0.2s ease', width: '15px', zIndex: 6 }}>
            <ArrowForwardIosIcon sx={{ color: theme.palette.mode === 'light' ? 'secondary.light' : 'white', fontSize: ARROW_ICON_SIZE, stroke: theme.palette.mode === 'dark' ? 'black' : 'white', strokeWidth: '0.5px', transform: isSlideOpen ? 'rotate(-180deg)' : 'none', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
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
      {showHistory &&
        <HistoryModal
          address={String(address)}
          setDisplayPopup={setShowHistory}
        />
      }
    </Grid>
  );
}

export default React.memo(QuickActionFullScreen);
