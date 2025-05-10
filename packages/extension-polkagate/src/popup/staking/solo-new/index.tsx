// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Content } from '../../../partials/Review';

import { Container, Grid } from '@mui/material';
import { Award, BuyCrypto, Graph, LockSlash, Moneys, Strongbox2, Timer, Timer1, Trade } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type BN, noop } from '@polkadot/util';

import { BackWithLabel, Motion } from '../../../components';
import { useAccountAssets, useBackground, useChainInfo, useEstimatedFee2, useFormatted3, useSelectedAccount, useSoloStakingInfo, useTransactionFlow, useTranslation } from '../../../hooks';
import UserDashboardHeader from '../../../partials/UserDashboardHeader';
import AvailableToStake from '../partial/AvailableToStake';
import StakingInfoTile from '../partial/StakingInfoTile';
import StakingMenu from '../partial/StakingMenu';
import StakingPortfolio from '../partial/StakingPortfolio';
import ToBeReleased from '../partial/ToBeReleased';

export default function Solo (): React.ReactElement {
  useBackground('staking');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedAccount = useSelectedAccount();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);
  const accountAssets = useAccountAssets(selectedAccount?.address);

  const [unstakingMenu, setUnstakingMenu] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const [param, setParam] = useState<number | null | undefined>(null);

  const redeem = api?.tx['staking']['withdrawUnbonded'];

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
      const spanCount = optSpans.isEmpty
        ? 0
        : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

      setParam(spanCount as unknown as number);
    }).catch(console.error);
  }, [api, formatted, param]);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);
  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const rewards = useMemo(() => stakingInfo.rewards, [stakingInfo.rewards]);

  const StakingInfoTileCount = [redeemable, rewards, unlockingAmount].filter((amount) => !amount?.isZero()).length; // bigger than 2 means the tile must be displayed in a row
  const layoutDirection = useMemo((): 'row' | 'column' => {
    if (StakingInfoTileCount > 2) {
      return 'row';
    } else {
      return 'column';
    }
  }, [StakingInfoTileCount]);

  const estimatedFee2 = useEstimatedFee2(review ? genesisHash ?? '' : undefined, formatted, redeem, [param ?? 0]);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: redeemable,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    },
    {
      content: redeemable && asset ? (asset.availableBalance).add(redeemable) : undefined,
      description: t('Available balance after redeemable withdrawal'),
      title: t('Available balance after'),
      withLogo: true
    }];
  }, [asset, estimatedFee2, redeemable, t]);
  const tx = useMemo(() => redeem?.(param), [redeem, param]);

  const onExpand = useCallback(() => setUnstakingMenu(true), []);
  const handleCloseMenu = useCallback(() => setUnstakingMenu(false), []);
  const onRestake = useCallback(() => navigate('/solo/' + genesisHash + '/restake') as void, [genesisHash, navigate]);
  const onFastUnstake = useCallback(() => navigate('/solo/' + genesisHash + '/fastUnstake') as void, [genesisHash, navigate]);
  const onUnstake = useCallback(() => navigate('/solo/' + genesisHash + '/unstake') as void, [genesisHash, navigate]);
  const onBack = useCallback(() => navigate('/stakingIndex') as void, [navigate]);
  const onWithdraw = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Withdraw redeemable'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            style={{ pb: 0 }}
            text={t('solo staking')}
          />
          <StakingPortfolio
            address={selectedAccount?.address}
            buttons={[{
              Icon: BuyCrypto,
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
          <Container disableGutters sx={{ display: 'flex', flexDirection: layoutDirection, gap: '4px', mt: '20px', px: '15px', width: '100%' }}>
            <StakingInfoTile
              Icon={Award}
              buttonsArray={[
                {
                  Icon: Timer,
                  onClick: noop,
                  text: t('Pending Rewards')
                },
                {
                  Icon: Graph,
                  onClick: noop,
                  text: t('Chart')
                }
              ]}
              cryptoAmount={rewards}
              decimal={decimal ?? 0}
              fiatAmount={0}
              layoutDirection={layoutDirection}
              title={t('Rewards paid')}
              token={token ?? ''}
            />
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
            />
            <StakingInfoTile
              Icon={LockSlash}
              buttonsArray={[{
                Icon: Trade,
                onClick: onRestake,
                text: t('Restake')
              }]}
              cryptoAmount={unlockingAmount}
              decimal={decimal ?? 0}
              fiatAmount={0}
              layoutDirection={layoutDirection}
              onExpand={toBeReleased?.length ? onExpand : undefined}
              title={t('Unstaking')}
              token={token ?? ''}
            />
          </Container>
          <AvailableToStake
            availableAmount={stakingInfo.availableBalanceToStake}
            decimal={decimal}
            path={'/solo/' + genesisHash + '/bondExtra'}
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
