// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { DateAmount } from '../../hooks/useSoloStakingInfo';

import { Container } from '@mui/material';
import { Award, Graph, LockSlash, Moneys, Strongbox2, Timer, Trade } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { calcPrice } from '@polkadot/extension-polkagate/src/util/utils';
import { type BN } from '@polkadot/util';

import { useChainInfo, usePrices, useTranslation } from '../../hooks';
import StakingInfoTile from './partial/StakingInfoTile';
import StakingRewardTile from './partial/StakingRewardTile';

interface Props {
  address: string | undefined;
  asset: FetchedBalance | undefined | null;
  genesisHash: string | undefined;
  redeemable: Balance | BN | undefined;
  unlockingAmount: BN | undefined;
  rewards: BN | undefined;
  onExpand: () => void;
  onClaimReward: () => void;
  onWithdraw: () => void;
  toBeReleased: DateAmount[] | undefined;
  onRestake?: () => void;
  type: 'solo' | 'pool';
}

function Tiles ({ address, asset, genesisHash, onClaimReward, onExpand, onRestake, onWithdraw, redeemable, rewards, toBeReleased, type, unlockingAmount }: Props) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const pricesInCurrency = usePrices();
  const navigate = useNavigate();

  const tokenPrice = pricesInCurrency?.prices[asset?.priceId ?? '']?.value ?? 0;

  const StakingInfoTileCount = [redeemable, unlockingAmount].filter((amount) => amount && !amount?.isZero()).length; // equals and bigger than 1 means the tiles must be displayed in a row
  const layoutDirection = useMemo((): 'row' | 'column' => StakingInfoTileCount === 2 ? 'row' : 'column', [StakingInfoTileCount]);
  const flatTileReward = useMemo(() => StakingInfoTileCount === 0, [StakingInfoTileCount]);

  const onRewardChart = useCallback(() => address && navigate('/stakingReward/' + address + '/' + genesisHash + '/' + type) as void, [address, genesisHash, navigate, type]);

  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: layoutDirection, gap: '4px', mt: '20px', px: '15px', width: '100%' }}>
      {flatTileReward
        ? (
          <StakingRewardTile
            address={address}
            genesisHash={genesisHash}
            isDisabled={!rewards || rewards.isZero()}
            layoutDirection={layoutDirection}
            onClaimReward={onClaimReward}
            reward={rewards}
            type={type}
          />)
        : (
          <StakingInfoTile
            Icon={Award}
            buttonsArray={[
              {
                Icon: Graph,
                onClick: onRewardChart,
                text: t('Chart')
              },
              {
                Icon: Timer,
                onClick: onClaimReward,
                text: t('Pending Rewards')
              }
            ]}
            cryptoAmount={rewards}
            decimal={decimal ?? 0}
            fiatAmount={0}
            layoutDirection={layoutDirection}
            title={t('Rewards Earned')}
            token={token ?? ''}
          />)
      }
      {(redeemable?.isZero?.() === false) &&
        <StakingInfoTile
          Icon={Moneys}
          buttonsArray={[{
            Icon: Strongbox2,
            iconVariant: 'Bold',
            onClick: onWithdraw,
            text: t('Withdraw')
          }]}
          cryptoAmount={redeemable}
          decimal={decimal ?? 0}
          fiatAmount={redeemable && decimal ? calcPrice(tokenPrice, redeemable, decimal) : 0}
          layoutDirection={layoutDirection}
          title={t('Redeemable')}
          token={token ?? ''}
        />}
      {(unlockingAmount?.isZero?.() === false) &&
        <StakingInfoTile
          Icon={LockSlash}
          buttonsArray={(type === 'solo' && onRestake
            ? [{
              Icon: Trade,
              onClick: onRestake,
              text: t('Restake')
            }]
            : undefined)}
          cryptoAmount={unlockingAmount}
          decimal={decimal ?? 0}
          fiatAmount={unlockingAmount && decimal ? calcPrice(tokenPrice, unlockingAmount, decimal) : 0}
          layoutDirection={layoutDirection}
          onExpand={toBeReleased?.length ? onExpand : undefined}
          title={t('Unstaking')}
          token={token ?? ''}
        />}
    </Container>
  );
}

export default memo(Tiles);
