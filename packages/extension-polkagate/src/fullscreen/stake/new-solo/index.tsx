// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import { Discover, MagicStar, Wallet } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { type BN } from '@polkadot/util';

import { useAccountAssets, useChainInfo, usePrices, useSelectedAccount, useSoloStakingInfo, useStakingRewards3, useTranslation } from '../../../hooks';
import HomeLayout from '../../components/layout';
import StakingIcon from '../partials/StakingIcon';
import StakingPortfolioAndTiles from '../partials/StakingPortfolioAndTiles';
import StakingTabs, { type StakingTabsHeaderItems } from '../partials/StakingTabs';
import { useStakingPopups } from '../util/utils';
import PopUpHandler from './PopUpHandler';
import Rewards from './rewards';

enum SOLO_TAB {
  STAKING_POSITIONS,
  REWARDS,
  VALIDATORS
}

export default function SoloFullScreen (): React.ReactElement {
  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const { token } = useChainInfo(genesisHash, true);
  const selectedAccount = useSelectedAccount();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const accountAssets = useAccountAssets(selectedAccount?.address);
  const pricesInCurrency = usePrices();
  const { popupCloser, popupOpener, stakingPopup } = useStakingPopups();
  const rewardInfo = useStakingRewards3(selectedAccount?.address, genesisHash, 'solo', true);

  const [tab, setTab] = useState<SOLO_TAB>(SOLO_TAB.STAKING_POSITIONS);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
  , [accountAssets, genesisHash]);

  const tokenPrice = pricesInCurrency?.prices[asset?.priceId ?? '']?.value ?? 0;

  const staked = useMemo(() => stakingInfo.stakingAccount?.stakingLedger.active as unknown as BN | undefined, [stakingInfo.stakingAccount?.stakingLedger.active]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);
  const toBeReleased = useMemo(() => stakingInfo.sessionInfo?.toBeReleased, [stakingInfo.sessionInfo?.toBeReleased]);
  const unlockingAmount = useMemo(() => stakingInfo.sessionInfo?.unlockingAmount, [stakingInfo.sessionInfo?.unlockingAmount]);
  const rewards = useMemo(() => stakingInfo.rewards, [stakingInfo.rewards]);

  const tabSetter = useCallback((selectedTab: SOLO_TAB) => () => setTab(selectedTab), []);

  const tabItems: StakingTabsHeaderItems[] = useMemo(() => ([
    {
      Icon: Wallet,
      isSelected: tab === SOLO_TAB.STAKING_POSITIONS,
      onClick: tabSetter(SOLO_TAB.STAKING_POSITIONS),
      title: t('Your staking positions')
    },
    {
      Icon: MagicStar,
      isSelected: tab === SOLO_TAB.REWARDS,
      onClick: tabSetter(SOLO_TAB.REWARDS),
      title: t('Rewards')
    },
    {
      Icon: Discover,
      isSelected: tab === SOLO_TAB.VALIDATORS,
      onClick: tabSetter(SOLO_TAB.VALIDATORS),
      title: t('Validators')
    }
  ]), [t, tab, tabSetter]);

  return (
    <>
      <HomeLayout>
        <Stack columnGap='8px' direction='column' sx={{ height: '685px' }}>
          <StakingIcon type='solo' />
          <StakingPortfolioAndTiles
            availableBalanceToStake={stakingInfo.availableBalanceToStake}
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
            content={
              <Rewards
                genesisHash={genesisHash}
                popupOpener={popupOpener}
                rewardInfo={rewardInfo}
                token={token}
              />
            }
            items={tabItems}
          />
        </Stack>
      </HomeLayout>
      <PopUpHandler
        address={selectedAccount?.address}
        genesisHash={genesisHash}
        popupCloser={popupCloser}
        popupOpener={popupOpener}
        stakingInfo={stakingInfo}
        stakingPopup={stakingPopup}
        toBeReleased={toBeReleased}
      />
    </>
  );
}
