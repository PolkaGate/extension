// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { type BN } from '@polkadot/util';

import { useAccountAssets, usePrices, useSelectedAccount, useSoloStakingInfo } from '../../../hooks';
import HomeLayout from '../../components/layout';
import StakingIcon from '../partials/StakingIcon';
import StakingPortfolioAndTiles from '../partials/StakingPortfolioAndTiles';

export default function SoloFullScreen (): React.ReactElement {
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const selectedAccount = useSelectedAccount();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const accountAssets = useAccountAssets(selectedAccount?.address);
  const pricesInCurrency = usePrices();

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);

  const tokenPrice = pricesInCurrency?.prices[asset?.priceId ?? '']?.value ?? 0;

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active as unknown as BN | undefined, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const rewards = useMemo(() => stakingInfo.rewards, [stakingInfo.rewards]);

  return (
    <HomeLayout>
      <Stack columnGap='8px' direction='column' sx={{ height: '685px' }}>
        <StakingIcon type='solo' />
        <StakingPortfolioAndTiles
          availableBalanceToStake={stakingInfo.availableBalanceToStake}
          genesisHash={genesisHash}
          redeemable={redeemable}
          rewards={rewards}
          staked={staked}
          toBeReleased={toBeReleased}
          tokenPrice={tokenPrice}
          type='solo'
          unlockingAmount={unlockingAmount}
        />
      </Stack>
    </HomeLayout>
  );
}
