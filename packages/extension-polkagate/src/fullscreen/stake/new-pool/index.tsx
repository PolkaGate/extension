// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { useAccountAssets, useChainInfo, usePoolStakingInfo, usePrices, useSelectedAccount, useStakingRewards3 } from '../../../hooks';
import { isHexToBn } from '../../../util/utils';
import HomeLayout from '../../components/layout';
import StakingIcon from '../partials/StakingIcon';
import StakingPortfolioAndTiles from '../partials/StakingPortfolioAndTiles';
import StakingTabs from '../partials/StakingTabs';
import { useStakingPopups } from '../util/utils';
import PopUpHandler from './PopUpHandler';

export default function PoolFullScreen (): React.ReactElement {
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { token } = useChainInfo(genesisHash, true);
  const selectedAccount = useSelectedAccount();
  const stakingInfo = usePoolStakingInfo(selectedAccount?.address, genesisHash);
  const accountAssets = useAccountAssets(selectedAccount?.address);
  const pricesInCurrency = usePrices();
  const { popupCloser, popupOpener, stakingPopup } = useStakingPopups();
  const rewardInfo = useStakingRewards3(selectedAccount?.address, genesisHash, 'pool', true);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);

  const tokenPrice = pricesInCurrency?.prices[asset?.priceId ?? '']?.value ?? 0;

  const staked = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.member?.points as string | undefined ?? '0'), [stakingInfo.pool]);
  const redeemable = useMemo(() => stakingInfo.sessionInfo?.redeemAmount, [stakingInfo.sessionInfo?.redeemAmount]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const myClaimable = useMemo(() => stakingInfo.pool === undefined ? undefined : isHexToBn(stakingInfo.pool?.myClaimable as string | undefined ?? '0'), [stakingInfo.pool]);

  return (
    <>
      <HomeLayout>
        <Stack columnGap='8px' direction='column' sx={{ height: '685px' }}>
          <StakingIcon type='pool' />
          <StakingPortfolioAndTiles
            availableBalanceToStake={stakingInfo.availableBalanceToStake}
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
            genesisHash={genesisHash}
            popupOpener={popupOpener}
            rewardInfo={rewardInfo}
            token={token}
            type='pool'
          />
        </Stack>
      </HomeLayout>
      <PopUpHandler
        address={selectedAccount?.address}
        genesisHash={genesisHash}
        popupCloser={popupCloser}
        stakingInfo={stakingInfo}
        stakingPopup={stakingPopup}
        toBeReleased={toBeReleased}
      />
    </>
  );
}
