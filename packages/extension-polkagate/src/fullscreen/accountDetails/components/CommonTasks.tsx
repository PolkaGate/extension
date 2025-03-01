// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo } from 'extension-polkagate/src/util/types';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';

import { faCoins, faGem, faHistory, faPaperPlane, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, Boy as BoyIcon, QrCode2 as QrCodeIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useMemo } from 'react';

import { noop } from '@polkadot/util';

import { PoolStakingIcon } from '../../../components';
import { useApi, useTranslation } from '../../../hooks';
import { GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';
import { popupNumbers } from '..';

interface Props {
  address: string | undefined;
  assetId: number | string | undefined;
  balance: BalancesInfo | FetchedBalance | undefined;
  genesisHash: string | null | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

interface TaskButtonProps {
  disabled?: boolean;
  dividerWidth?: string;
  icon: React.JSX.Element;
  loading?: boolean;
  mr?: string;
  noBorderButton?: boolean;
  onClick: () => void;
  secondaryIconType: 'popup' | 'page';
  text: string;
  show?: boolean;
}

export const openOrFocusTab = (relativeUrl: string, closeCurrentTab?: boolean): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]?.url) {
      const extensionUrl = tabs[0].url;
      const extensionBaseUrl = extensionUrl.split('#')[0];

      const tabUrl = `${extensionBaseUrl}#${relativeUrl}`;

      chrome.tabs.query({}, function (allTabs) {
        const existingTab = allTabs.find(function (tab) {
          return tab.url === tabUrl;
        });

        if (existingTab?.id) {
          chrome.tabs.update(existingTab.id, { active: true }).catch(console.error);
        } else {
          chrome.tabs.create({ url: tabUrl }).catch(console.error);
        }

        closeCurrentTab && window.close();
      });
    } else {
      console.error('Unable to retrieve extension URL.');
    }
  });
};

export const TaskButton = ({ disabled, dividerWidth = '66%', icon, loading, mr = '25px', noBorderButton = false, onClick, secondaryIconType, show = true, text }: TaskButtonProps) => {
  const theme = useTheme();

  return (
    <>
      {show &&
        <>
          <Grid alignItems='center' container item justifyContent='space-between' onClick={disabled ? noop : onClick} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : 'divider' }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', m: 'auto', minHeight: '45px', p: '5px 10px' }} width='90%'>
            <Grid container item mr={mr} xs={1.5}>
              {icon}
            </Grid>
            <Grid container item xs>
              <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
                {text}
              </Typography>
            </Grid>
            {secondaryIconType === 'page' && !loading &&
              <Grid alignItems='center' container item justifyContent='flex-end' xs={2}>
                <ArrowForwardIosRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '26px', stroke: disabled ? theme.palette.text.disabled : theme.palette.secondary.light, strokeWidth: 1 }} />
              </Grid>
            }
            {loading &&
              <Circle
                color={theme.palette.primary.main}
                scaleEnd={0.7}
                scaleStart={0.4}
                size={25}
              />
            }
          </Grid>
          {!noBorderButton &&
            <Divider sx={{ bgcolor: 'divider', height: '2px', justifySelf: 'flex-end', m: '5px 15px', width: dividerWidth }} />
          }
        </>
      }
    </>
  );
};

export default function CommonTasks({ address, assetId, balance, genesisHash, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);

  const governanceDisabled = useMemo(() => !GOVERNANCE_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const { stakingDisabled, stakingNotReady } = useMemo(() => {
    const stakingDisabled = !STAKING_CHAINS.includes(genesisHash ?? '');
    const stakingNotReady = !balance?.soloTotal || !balance?.pooledBalance;

    return { stakingDisabled, stakingNotReady };
  }, [balance?.pooledBalance, balance?.soloTotal, genesisHash]);
  const stakingIconColor = useMemo(() => stakingDisabled || stakingNotReady ? theme.palette.action.disabledBackground : theme.palette.text.primary, [stakingDisabled, theme.palette.action.disabledBackground, theme.palette.text.primary, stakingNotReady]);

  const hasSoloStake = Boolean(balance?.soloTotal && !balance.soloTotal.isZero());
  const hasPoolStake = Boolean(balance?.pooledBalance && !balance.pooledBalance.isZero());
  const notStakedYet = !hasPoolStake && !hasSoloStake;

  const canManageSoloStake = useMemo(() =>
    hasSoloStake ||
    (api && !api.tx?.['nominationPools']?.['migrateDelegation']) ||
    (api?.tx?.['nominationPools']?.['migrateDelegation'] && balance?.pooledBalance?.isZero())
    ,
    [api, balance?.pooledBalance, hasSoloStake]);

  const goToSend = useCallback(() => {
    address && genesisHash &&
      openOrFocusTab(`/send/${address}/${assetId}`, true);
  }, [address, assetId, genesisHash]);

  const goToReceive = useCallback(() => {
    address && genesisHash && setDisplayPopup(popupNumbers.RECEIVE);
  }, [address, genesisHash, setDisplayPopup]);

  const goToGovernance = useCallback(() => {
    address && genesisHash && !governanceDisabled &&
      openOrFocusTab(`/governance/${address}/referenda`);
  }, [address, genesisHash, governanceDisabled]);

  const goToStaking = useCallback(() => {
    address && openOrFocusTab(`/stake/${address}`);
  }, [address]);

  const goToSoloStaking = useCallback(() => {
    address && !stakingDisabled &&
      openOrFocusTab(`/solofs/${address}/`);
  }, [address, stakingDisabled]);

  const goToPoolStaking = useCallback(() => {
    address && !stakingDisabled && openOrFocusTab(`/poolfs/${address}/`);
  }, [address, stakingDisabled]);

  const onNFTAlbum = useCallback(() => {
    address && openOrFocusTab(`/nft/${address}`);
  }, [address]);

  const goToHistory = useCallback(() => {
    address && genesisHash && setDisplayPopup(popupNumbers.HISTORY);
  }, [address, genesisHash, setDisplayPopup]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='inherit'>
      <Typography fontSize='20px' fontWeight={700}>
        {t('Most common tasks')}
      </Typography>
      <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto 15px', width: '90%' }} />
      <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
        <TaskButton
          disabled={!genesisHash}
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='28px'
              icon={faPaperPlane}
            />
          }
          onClick={goToSend}
          secondaryIconType='page'
          text={t('Send fund')}
        />
        <TaskButton
          disabled={!genesisHash}
          icon={
            <QrCodeIcon sx={{ color: 'text.primary', cursor: 'pointer', fontSize: '35px' }} />
          }
          onClick={goToReceive}
          secondaryIconType='popup'
          text={t('Receive fund')}
        />
        <TaskButton
          disabled={governanceDisabled}
          icon={
            <FontAwesomeIcon
              color={governanceDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary}
              fontSize='28px'
              icon={faVoteYea}
            />
          }
          onClick={goToGovernance}
          secondaryIconType='page'
          text={t('Governance')}
        />
        <TaskButton
          disabled={stakingDisabled || stakingNotReady}
          icon={
            <FontAwesomeIcon
              color={stakingIconColor}
              fontSize='34px'
              icon={faCoins}
            />
          }
          loading={!stakingDisabled && stakingNotReady}
          onClick={goToStaking}
          secondaryIconType='page'
          show={notStakedYet}
          text={t('Stake')}
        />
        <TaskButton
          disabled={stakingDisabled}
          icon={
            <Grid sx={{ position: 'relative' }}>
              <BoyIcon sx={{ color: stakingIconColor, fontSize: '35px' }} />
              {hasSoloStake &&
                <span style={{ backgroundColor: '#00FF00', border: `1px solid ${theme.palette.background.default}`, borderRadius: '50%', height: '10px', position: 'absolute', right: '6px', top: '33%', width: '10px' }} />
              }
            </Grid>
          }
          onClick={goToSoloStaking}
          secondaryIconType='page'
          show={(hasSoloStake || hasPoolStake) && !stakingDisabled && !!canManageSoloStake}
          text={t('Stake Solo')}
        />
        <TaskButton
          disabled={stakingDisabled}
          icon={
            <Grid sx={{ position: 'relative' }}>
              <PoolStakingIcon color={stakingIconColor} height={35} width={35} />
              {hasPoolStake &&
                <span style={{ backgroundColor: '#00FF00', border: `1px solid ${theme.palette.background.default}`, borderRadius: '50%', height: '10px', position: 'absolute', right: '-1px', top: '33%', width: '10px' }} />
              }
            </Grid>
          }
          onClick={goToPoolStaking}
          secondaryIconType='page'
          show={(hasSoloStake || hasPoolStake) && !stakingDisabled}
          text={t('Stake in Pool')}
        />
        <TaskButton
          disabled={false} // We check NFTs across all supported chains, so this feature is not specific to the current chain and should not be disabled.
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='28px'
              icon={faGem}
            />
          }
          onClick={onNFTAlbum}
          secondaryIconType='page'
          text={t('NFT album')}
        />
        <TaskButton
          disabled={!genesisHash}
          icon={
            <FontAwesomeIcon
              color={`${theme.palette.text.primary}`}
              fontSize='28px'
              icon={faHistory}
            />
          }
          noBorderButton
          onClick={goToHistory}
          secondaryIconType='popup'
          text={t('History')}
        />
      </Grid>
    </Grid>
  );
}
