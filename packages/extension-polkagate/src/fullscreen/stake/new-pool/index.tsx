// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PositionInfo } from '../../../util/types';

import { Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { getStakingAsset } from '@polkadot/extension-polkagate/src/popup/staking/utils';
import { BN_ZERO } from '@polkadot/util';

import { useAccountAssets, useChainInfo, usePoolStakingInfo, usePrices, useRouteRefresh, useStakingRewardsChart } from '../../../hooks';
import { isHexToBn } from '../../../util/utils';
import HomeLayout from '../../components/layout';
import StakingIcon from '../partials/StakingIcon';
import StakingPortfolioAndTiles from '../partials/StakingPortfolioAndTiles';
import StakingTabs from '../partials/StakingTabs';
import { useStakingPopups } from '../util/utils';
import PopUpHandlerPool from './PopUpHandlerPool';

export default function PoolFullScreen(): React.ReactElement {
  const [refresh, setRefresh] = useState<boolean>(false);

  useRouteRefresh(() => setRefresh(true));

  const { address, genesisHash } = useParams<{ address: string, genesisHash: string }>();
  const { token } = useChainInfo(genesisHash, true);
  const stakingInfo = usePoolStakingInfo(address, genesisHash, refresh, setRefresh);
  const accountAssets = useAccountAssets(address);
  const pricesInCurrency = usePrices();
  const { popupCloser, popupOpener, stakingPopup } = useStakingPopups();
  const rewardInfo = useStakingRewardsChart(address, genesisHash, 'pool', true);

  const [selectedPosition, setSelectedPosition] = useState<PositionInfo | undefined>(undefined);

  const asset = useMemo(() => getStakingAsset(accountAssets, genesisHash), [accountAssets, genesisHash]);

  const notStaked = useMemo(() => (
    Boolean(accountAssets === null || (accountAssets && asset === undefined)) ||
    (asset?.pooledBalance && asset.pooledBalance.isZero())
  ), [accountAssets, asset]);

  const tokenPrice = useMemo(() => pricesInCurrency?.prices[asset?.priceId ?? '']?.value ?? 0, [asset?.priceId, pricesInCurrency?.prices]);

  const { availableBalanceToStake, myClaimable, redeemable, staked, toBeReleased, unlockingAmount } = useMemo(() => {
    if (notStaked) {
      return {
        availableBalanceToStake: BN_ZERO,
        myClaimable: BN_ZERO,
        redeemable: BN_ZERO,
        staked: BN_ZERO,
        toBeReleased: [],
        unlockingAmount: BN_ZERO
      };
    }

    const staked = isHexToBn(stakingInfo.pool?.member?.points as string | undefined ?? '0');
    const redeemable = stakingInfo.sessionInfo?.redeemAmount;
    const toBeReleased = stakingInfo.sessionInfo?.toBeReleased;
    const unlockingAmount = stakingInfo.sessionInfo?.unlockingAmount;
    const myClaimable = isHexToBn(stakingInfo.pool?.myClaimable as string | undefined ?? '0');
    const availableBalanceToStake = stakingInfo.availableBalanceToStake;

    return { availableBalanceToStake, myClaimable, redeemable, staked, toBeReleased, unlockingAmount };
  }, [notStaked, stakingInfo.availableBalanceToStake, stakingInfo.pool?.member?.points, stakingInfo.pool?.myClaimable, stakingInfo.sessionInfo?.redeemAmount, stakingInfo.sessionInfo?.toBeReleased, stakingInfo.sessionInfo?.unlockingAmount]);

  return (
    <>
      <HomeLayout>
        <Stack columnGap='8px' direction='column' sx={{ height: '685px' }}>
          <StakingIcon type='pool' variant='people' />
          <StakingPortfolioAndTiles
            availableBalanceToStake={availableBalanceToStake}
            disabled={notStaked}
            genesisHash={genesisHash}
            popupOpener={popupOpener}
            redeemable={redeemable}
            rewards={myClaimable}
            staked={staked}
            toBeReleased={toBeReleased}
            tokenPrice={tokenPrice}
            type='pool'
            unlockingAmount={unlockingAmount}
          />
          <StakingTabs
            disabled={notStaked}
            genesisHash={genesisHash}
            popupOpener={popupOpener}
            rewardInfo={rewardInfo}
            setSelectedPosition={setSelectedPosition}
            token={token}
            type='pool'
          />
        </Stack>
      </HomeLayout>
      <PopUpHandlerPool
        address={address}
        genesisHash={genesisHash}
        poolInfo={stakingInfo.pool}
        popupCloser={popupCloser}
        popupOpener={popupOpener}
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        stakingInfo={stakingInfo}
        stakingPopup={stakingPopup}
        toBeReleased={toBeReleased}
      />
    </>
  );
}
