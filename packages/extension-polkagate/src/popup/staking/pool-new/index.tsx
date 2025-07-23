// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { BuyCrypto, LockSlash, Moneys, People, Strongbox2 } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { BackWithLabel, Motion } from '../../../components';
import { useBackground, useChainInfo, usePoolStakingInfo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import { useWithdrawClaimPool } from '../../../util/api/staking';
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
  Reward = 'Reward',
  None = 'None',
  Withdraw = 'Withdraw'
}

export default function Pool (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);

  const [unstakingMenu, setUnstakingMenu] = useState<boolean>(false);
  const [review, setReview] = useState<Review>(Review.None);

  const { claimPayout,
    myClaimable,
    redeemable,
    transactionInformation,
    tx } = useWithdrawClaimPool(selectedAccount?.address, genesisHash, review);

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.member?.points as string | undefined ?? '0'), [stakingInfo.pool]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);

  const StakingInfoTileCount = [redeemable, unlockingAmount].filter((amount) => amount && !amount?.isZero()).length; // equals and bigger than 1 means the tiles must be displayed in a row
  const layoutDirection = useMemo((): 'row' | 'column' => StakingInfoTileCount >= 1 ? 'row' : 'column', [StakingInfoTileCount]);

  const onExpand = useCallback(() => setUnstakingMenu(true), []);
  const handleCloseMenu = useCallback(() => setUnstakingMenu(false), []);
  const onWithdraw = useCallback(() => setReview(Review.Withdraw), []);
  const onClaimReward = useCallback(() => setReview(Review.Reward), []);
  const closeReview = useCallback(() => setReview(Review.None), []);
  const onUnstake = useCallback(() => navigate('/pool/' + genesisHash + '/unstake') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);

  const transactionFlow = useTransactionFlow({
    address: selectedAccount?.address,
    backPathTitle: review === Review.Reward ? t('Claim rewards') : t('Withdraw redeemable'),
    closeReview,
    genesisHash: genesisHash ?? '',
    review: review !== Review.None,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/pool/' + genesisHash} homeType='default' />
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
              address={selectedAccount?.address}
              genesisHash={genesisHash}
              isDisabled={!claimPayout}
              layoutDirection={layoutDirection}
              onClaimReward={onClaimReward}
              reward={myClaimable}
              type='pool'
            />
            {(redeemable?.isZero?.() === false || layoutDirection === 'row') &&
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
            {(unlockingAmount?.isZero?.() === false || layoutDirection === 'row') &&
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
