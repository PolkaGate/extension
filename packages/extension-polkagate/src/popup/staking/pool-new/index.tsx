// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Grid, Typography, useTheme } from '@mui/material';
import { Coin, People } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, Motion } from '../../../components';
import { useAccountAssets, useBackground, useChainInfo, useClaimRewardPool, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation, useWithdrawPool } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import { isHexToBn } from '../../../util';
import { PROXY_TYPE } from '../../../util/constants';
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
      <People color={theme.palette.text.highlight} size='24' variant='Bulk' />
      <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
        {t('pool staking')}
      </Typography>
    </>
  );
};

export enum Review {
  Reward = 'Reward',
  None = 'None',
  Withdraw = 'Withdraw'
}

export default function Pool(): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const address = useSelectedAccount()?.address;
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const [unstakingMenu, setUnstakingMenu] = useState<boolean>(false);
  const [restakeReward, setRestakeReward] = useState<boolean>(false);
  const [review, setReview] = useState<Review>(Review.None);

  const { redeemable,
    transactionInformation: withdrawTransactionInformation,
    tx: withdrawTx } = useWithdrawPool(address, genesisHash);

  const { myClaimable,
    transactionInformation: rewardTransactionInformation,
    tx: rewardTx } = useClaimRewardPool(address, genesisHash, restakeReward);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
    , [accountAssets, genesisHash]);
  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.member?.points as string | undefined ?? '0'), [stakingInfo.pool]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);

  const { transactionInformation, tx } = useMemo(() => {
    if (review === Review.Withdraw) {
      return {
        transactionInformation: withdrawTransactionInformation,
        tx: withdrawTx
      };
    }

    if (review === Review.Reward) {
      return {
        transactionInformation: rewardTransactionInformation,
        tx: rewardTx
      };
    }

    return {
      transactionInformation: [],
      tx: undefined
    };
  }, [review, rewardTransactionInformation, rewardTx, withdrawTransactionInformation, withdrawTx]);

  const onExpand = useCallback(() => setUnstakingMenu(true), []);
  const handleCloseMenu = useCallback(() => setUnstakingMenu(false), []);
  const onWithdraw = useCallback(() => setReview(Review.Withdraw), []);
  const onClaimReward = useCallback(() => setReview(Review.Reward), []);
  const closeReview = useCallback(() => setReview(Review.None), []);
  const onUnstake = useCallback(() => navigate('/pool/' + genesisHash + '/unstake') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);

  const transactionFlow = useTransactionFlow({
    address,
    backPathTitle: review === Review.Reward ? t('Claim rewards') : t('Withdraw redeemable'),
    closeReview,
    extraDetailConfirmationPage: (review === Review.Reward ? { amount: myClaimable?.toString() } : undefined),
    genesisHash: genesisHash ?? '',
    proxyTypeFilter: PROXY_TYPE.NOMINATION_POOLS,
    restakeReward: review === Review.Reward ? restakeReward : undefined,
    review: review !== Review.None,
    setRestakeReward: review === Review.Reward ? setRestakeReward : undefined,
    showAccountBox: !(review === Review.Reward),
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/pool/' + address + '/' + genesisHash} homeType='default' />
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
            }]}
            genesisHash={genesisHash as unknown as string}
            staked={staked as unknown as BN}
            style={{ mt: '15px' }}
            type='pool'
          />
          <Tiles
            address={address}
            asset={asset}
            genesisHash={genesisHash}
            onClaimReward={onClaimReward}
            onExpand={onExpand}
            onWithdraw={onWithdraw}
            redeemable={redeemable}
            rewards={myClaimable}
            toBeReleased={toBeReleased}
            type='pool'
            unlockingAmount={unlockingAmount}
          />
          <AvailableToStake
            availableAmount={stakingInfo.availableBalanceToStake}
            decimal={decimal}
            stakeType='pool'
            style={{ m: '8px auto 0', width: 'calc(100% - 30px)' }}
            token={token}
          />
        </Motion>
      </Grid>
      <StakingMenu
        genesisHash={genesisHash ?? ''}
        pool={stakingInfo.pool}
        type='pool'
      />
      <ToBeReleased
        decimal={decimal ?? 0}
        handleClose={handleCloseMenu}
        openMenu={unstakingMenu}
        toBeReleased={toBeReleased ?? []}
        token={token ?? ''}
      />
    </>
  );
}
