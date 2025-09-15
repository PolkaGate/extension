// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PositionInfo } from '../../../util/types';

import { Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { getStakingAsset } from '@polkadot/extension-polkagate/src/popup/staking/utils';
import { type BN, BN_ZERO } from '@polkadot/util';

import { useAccountAssets, useChainInfo, usePrices, useRouteRefresh, useSoloStakingInfo, useStakingRewardsChart } from '../../../hooks';
import HomeLayout from '../../components/layout';
import StakingIcon from '../partials/StakingIcon';
import StakingPortfolioAndTiles from '../partials/StakingPortfolioAndTiles';
import StakingTabs from '../partials/StakingTabs';
import { useStakingPopups } from '../util/utils';
import PopUpHandlerSolo from './PopUpHandlerSolo';

export default function SoloFullScreen (): React.ReactElement {
  const [refresh, setRefresh] = useState<boolean>(false);

  useRouteRefresh(() => setRefresh(true));

  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const { token } = useChainInfo(genesisHash, true);
  const stakingInfo = useSoloStakingInfo(address, genesisHash, refresh, setRefresh);
  const accountAssets = useAccountAssets(address);
  const pricesInCurrency = usePrices();
  const { popupCloser, popupOpener, stakingPopup } = useStakingPopups();
  const rewardInfo = useStakingRewardsChart(address, genesisHash, 'solo', true);

  const [selectedPosition, setSelectedPosition] = useState<PositionInfo | undefined>(undefined);

  const asset = useMemo(() => getStakingAsset(accountAssets, genesisHash), [accountAssets, genesisHash]);

  const notStaked = useMemo(() => (
    Boolean(accountAssets === null || (accountAssets && asset === undefined)) ||
    (asset?.soloTotal?.isZero())
  ), [accountAssets, asset]);

  const tokenPrice = useMemo(() => pricesInCurrency?.prices[asset?.priceId ?? '']?.value ?? 0, [asset?.priceId, pricesInCurrency?.prices]);

  const { availableBalanceToStake, redeemable, rewards, staked, toBeReleased, unlockingAmount } = useMemo(() => {
    if (notStaked) {
      return {
        availableBalanceToStake: BN_ZERO,
        redeemable: BN_ZERO,
        rewards: BN_ZERO,
        staked: BN_ZERO,
        toBeReleased: [],
        unlockingAmount: BN_ZERO
      };
    }

    const staked = stakingInfo.stakingAccount?.stakingLedger.active as unknown as BN | undefined;
    const redeemable = stakingInfo.stakingAccount?.redeemable;
    const toBeReleased = stakingInfo.sessionInfo?.toBeReleased;
    const unlockingAmount = stakingInfo.sessionInfo?.unlockingAmount;
    const rewards = stakingInfo.rewards;
    const availableBalanceToStake = stakingInfo.availableBalanceToStake;

    return { availableBalanceToStake, redeemable, rewards, staked, toBeReleased, unlockingAmount };
  }, [notStaked, stakingInfo.availableBalanceToStake, stakingInfo.rewards, stakingInfo.sessionInfo?.toBeReleased, stakingInfo.sessionInfo?.unlockingAmount, stakingInfo.stakingAccount?.redeemable, stakingInfo.stakingAccount?.stakingLedger.active]);

  return (
    <>
      <HomeLayout>
        <Stack columnGap='8px' direction='column' sx={{ height: '685px' }}>
          <StakingIcon type='solo' variant='people' />
          <StakingPortfolioAndTiles
            availableBalanceToStake={availableBalanceToStake}
            disabled={notStaked}
            genesisHash={genesisHash}
            popupOpener={popupOpener}
            redeemable={redeemable}
            rewards={rewards}
            staked={staked}
            toBeReleased={toBeReleased}
            tokenPrice={tokenPrice}
            type='solo'
            unlockingAmount={unlockingAmount}
          />
          <StakingTabs
            disabled={notStaked}
            genesisHash={genesisHash}
            popupOpener={popupOpener}
            rewardInfo={rewardInfo}
            setSelectedPosition={setSelectedPosition}
            stakingInfo={stakingInfo}
            token={token}
            type='solo'
          />
        </Stack>
      </HomeLayout>
      <PopUpHandlerSolo
        address={address}
        genesisHash={genesisHash}
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
