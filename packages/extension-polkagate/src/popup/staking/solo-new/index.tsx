// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Grid, Typography, useTheme } from '@mui/material';
import { Coin, Timer1, UserOctagon } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BackWithLabel, Motion } from '../../../components';
import { useBackground, useChainInfo, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation, useWithdrawSolo } from '../../../hooks';
import UserDashboardHeader from '../../../partials/UserDashboardHeader';
import { updateStorage } from '../../../util';
import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, PROXY_TYPE } from '../../../util/constants';
import AvailableToStake from '../partial/AvailableToStake';
import StakingMenu from '../partial/StakingMenu';
import StakingPortfolio from '../partial/StakingPortfolio';
import ToBeReleased from '../partial/ToBeReleased';
import Tiles from '../Tiles';

const Back = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <UserOctagon color={theme.palette.text.highlight} size='24' variant='Bold' />
      <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
        {t('solo staking')}
      </Typography>
    </>
  );
};

export default function Solo (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const [unstakingMenu, setUnstakingMenu] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);

  const { asset,
    redeemable,
    transactionInformation,
    tx } = useWithdrawSolo(address, genesisHash, review);

  useEffect(() => {
    address && genesisHash && updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [address]: genesisHash }).catch(console.error);
  }, [genesisHash, address]);

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const rewards = useMemo(() => stakingInfo.rewards, [stakingInfo.rewards]);

  const onExpand = useCallback(() => setUnstakingMenu(true), []);
  const handleCloseMenu = useCallback(() => setUnstakingMenu(false), []);
  const onRestake = useCallback(() => navigate('/solo/' + genesisHash + '/restake') as void, [genesisHash, navigate]);
  const onFastUnstake = useCallback(() => navigate('/solo/' + genesisHash + '/fastUnstake') as void, [genesisHash, navigate]);
  const onUnstake = useCallback(() => navigate('/solo/' + genesisHash + '/unstake') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);
  const onClaimReward = useCallback(() => navigate('/solo/' + genesisHash + '/pendingReward') as void, [navigate, genesisHash]);
  const onWithdraw = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: t('Withdraw redeemable'),
    closeReview,
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.STAKING,
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + address + '/' + genesisHash} homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            content={<Back />}
            onClick={onBack}
            style={{ pb: 0 }}
          />
          <StakingPortfolio
            buttons={[{
              Icon: Coin,
              onClick: onUnstake,
              text: t('Unstake')
            },
            {
              Icon: Timer1,
              onClick: onFastUnstake,
              text: t('Fast Unstake')
            }]}
            genesisHash={genesisHash as unknown as string}
            staked={staked as unknown as BN}
            style={{ mt: '20px' }}
            type='solo'
          />
          <Tiles
            address={address}
            asset={asset}
            genesisHash={genesisHash}
            onClaimReward={onClaimReward}
            onExpand={onExpand}
            onRestake={onRestake}
            onWithdraw={onWithdraw}
            redeemable={redeemable}
            rewards={rewards}
            toBeReleased={toBeReleased}
            type='solo'
            unlockingAmount={unlockingAmount}
          />
          <AvailableToStake
            availableAmount={stakingInfo.availableBalanceToStake}
            decimal={decimal}
            stakeType='solo'
            style={{ m: '8px auto 0', width: 'calc(100% - 30px)' }}
            token={token}
          />
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        type='solo'
      />
      <ToBeReleased
        decimal={decimal ?? 0}
        handleClose={handleCloseMenu}
        onRestake={onRestake}
        openMenu={unstakingMenu}
        toBeReleased={toBeReleased ?? []}
        token={token ?? ''}
      />
    </>
  );
}
