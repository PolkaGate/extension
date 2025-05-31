// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { BuyCrypto, LockSlash, Moneys, People, Strongbox2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BackWithLabel, Motion } from '../../../components';
import { useAccountAssets, useBackground, useChainInfo, useEstimatedFee2, useFormatted3, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import { isHexToBn } from '../../../util/utils';
import AvailableToStake from '../partial/AvailableToStake';
import StakingInfoTile from '../partial/StakingInfoTile';
import StakingMenu from '../partial/StakingMenu';
import StakingPortfolio from '../partial/StakingPortfolio';
import StakingRewardTile from '../partial/StakingRewardTile';
import ToBeReleased from '../partial/ToBeReleased';

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
  Reward = 'reward',
  None = 'None',
  Withdraw = 'Withdraw'
}

export default function Pool (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);
  const accountAssets = useAccountAssets(selectedAccount?.address);

  const redeem = api?.tx['nominationPools']['withdrawUnbonded'];
  const claimPayout = api?.tx['nominationPools']['claimPayout'];

  const [unstakingMenu, setUnstakingMenu] = useState<boolean>(false);
  const [review, setReview] = useState<Review>(Review.None);
  const [param, setParam] = useState<[string, number] | null | undefined>(null);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
      const spanCount = optSpans.isEmpty
        ? 0
        : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

      setParam([formatted, spanCount]);
    }).catch(console.error);
  }, [api, formatted, param]);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);
  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.member?.points as string | undefined ?? '0'), [stakingInfo.pool]);
  const redeemable = useMemo(() => stakingInfo.sessionInfo?.redeemAmount, [stakingInfo.sessionInfo?.redeemAmount]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const myClaimable = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.myClaimable as string | undefined ?? '0'), [stakingInfo.pool]);

  const StakingInfoTileCount = [redeemable, myClaimable, unlockingAmount].filter((amount) => amount && !amount?.isZero()).length; // bigger than 2 means the tile must be displayed in a row
  const layoutDirection = useMemo((): 'row' | 'column' => StakingInfoTileCount > 2 ? 'row' : 'column', [StakingInfoTileCount]);

  const estimatedFee2 = useEstimatedFee2(review && param ? genesisHash ?? '' : undefined, formatted, review === Review.Reward ? claimPayout : redeem, review === Review.Reward ? undefined : param ?? [0]);

  const transactionInformation = useMemo(() => {
    return [{
      content: review === Review.Reward ? myClaimable : redeemable,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    (review === Review.Reward
      ? {
        content: myClaimable && asset ? (asset.availableBalance).add(myClaimable) : undefined,
        description: t('Available balance after claim rewards'),
        title: t('Available balance after'),
        withLogo: true
      }
      : {
        content: redeemable && asset ? (asset.availableBalance).add(redeemable) : undefined,
        description: t('Available balance after redeemable withdrawal'),
        title: t('Available balance after'),
        withLogo: true
      })];
  }, [asset, estimatedFee2, redeemable, review, myClaimable, t]);
  const tx = useMemo(() => {
    if (review === Review.None) {
      return undefined;
    } else if (review === Review.Reward && claimPayout) {
      return claimPayout();
    } else if (review === Review.Withdraw && redeem && param) {
      return redeem(...param);
    } else {
      return undefined;
    }
  }, [review, claimPayout, redeem, param]);

  const onExpand = useCallback(() => setUnstakingMenu(true), []);
  const handleCloseMenu = useCallback(() => setUnstakingMenu(false), []);
  const onWithdraw = useCallback(() => setReview(Review.Withdraw), []);
  const onClaimReward = useCallback(() => setReview(Review.Reward), []);
  const closeReview = useCallback(() => setReview(Review.None), []);
  const onUnstake = useCallback(() => navigate('/pool/' + genesisHash + '/unstake') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);

  const transactionFlow = useTransactionFlow({
    backPathTitle: review === Review.Reward ? t('Claim rewards') : t('Withdraw redeemable'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review: review !== Review.None,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            content={<Back />}
            onClick={onBack}
            style={{ pb: 0 }}
          />
          <StakingPortfolio
            buttons={[{
              Icon: BuyCrypto,
              onClick: onUnstake,
              text: t('Unstake')
            }]}
            genesisHash={genesisHash as unknown as string}
            staked={staked as unknown as BN}
            style={{ mt: '15px' }}
            type='pool'
          />
          <Container disableGutters sx={{ display: 'flex', flexDirection: layoutDirection, gap: '4px', mt: '20px', px: '15px', width: '100%' }}>
            <StakingRewardTile
              genesisHash={genesisHash}
              isDisabled={!claimPayout}
              layoutDirection={layoutDirection}
              onClaimReward={onClaimReward}
              reward={myClaimable}
            />
            {redeemable &&
              <StakingInfoTile
                Icon={Moneys}
                buttonsArray={[{
                  Icon: Strongbox2,
                  onClick: onWithdraw,
                  text: t('Withdraw')
                }]}
                cryptoAmount={redeemable}
                decimal={decimal ?? 0}
                fiatAmount={0}
                layoutDirection={layoutDirection}
                title={t('Redeemable')}
                token={token ?? ''}
              />}
            {unlockingAmount &&
              <StakingInfoTile
                Icon={LockSlash}
                cryptoAmount={unlockingAmount}
                decimal={decimal ?? 0}
                fiatAmount={0}
                layoutDirection={layoutDirection}
                onExpand={toBeReleased?.length ? onExpand : undefined}
                title={t('Unstaking')}
                token={token ?? ''}
              />}
          </Container>
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
