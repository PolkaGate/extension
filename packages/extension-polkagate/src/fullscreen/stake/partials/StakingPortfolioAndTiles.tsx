// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { DateAmount } from '../../../hooks/useSoloStakingInfo';

import { Container, Grid } from '@mui/material';
import { Add, Award, Coin, LockSlash, MedalStar, Moneys, Profile2User, Strongbox2, Timer, Timer1, Trade } from 'iconsax-react';
import React, { memo, useMemo } from 'react';

import Ice from '@polkadot/extension-polkagate/src/components/SVG/Ice';
import SnowFlake from '@polkadot/extension-polkagate/src/components/SVG/SnowFlake';
import { calcPrice } from '@polkadot/extension-polkagate/src/util';
import { type BN } from '@polkadot/util';

import { useChainInfo, useTranslation } from '../../../hooks';
import StakingInfoTile from '../../../popup/staking/partial/StakingInfoTile';
import StakingPortfolio from '../../../popup/staking/partial/StakingPortfolio';
import { GlowBall } from '../../../style/VelvetBox';
import { type PopupOpener, StakingPopUps } from '../util/utils';

export const PENDING_REWARDS_TEXT = 'Pending Rewards';
interface TileBoxProps {
  genesisHash: string | undefined;
  redeemable: Balance | BN | undefined;
  toBeReleased: DateAmount[] | undefined;
  unlockingAmount: BN | undefined;
  rewards: BN | undefined;
  tokenPrice: number;
  availableBalanceToStake: BN | undefined;
  type: 'solo' | 'pool';
  popupOpener: PopupOpener;
}

const TileBoxes = memo(function MemoTileBoxes({ availableBalanceToStake, genesisHash, popupOpener, redeemable, rewards, toBeReleased, tokenPrice, type, unlockingAmount }: TileBoxProps) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const isPoolStaking = useMemo(() => type === 'pool', [type]);

  return (
    <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '18px', display: 'flex', flexDirection: 'row', gap: '5px', overflow: 'hidden', p: '4px', position: 'relative' }} xs>
      <GlowBall />
      <StakingInfoTile
        Icon={Award}
        buttonsArray={
          isPoolStaking
            ? [{
              Icon: MedalStar,
              iconVariant: 'Bold',
              onClick: popupOpener(StakingPopUps.CLAIM_REWARDS),
              text: t('Claim Now')
            }]
            : [{

              Icon: Timer,
              onClick: popupOpener(StakingPopUps.PENDING_REWARDS),
              text: t(PENDING_REWARDS_TEXT)
            }]}
        cryptoAmount={rewards}
        decimal={decimal ?? 0}
        fiatAmount={rewards && decimal ? calcPrice(tokenPrice, rewards, decimal) : 0}
        isFullScreen
        layoutDirection='row'
        style={{ minWidth: '157px', width: 'min-content' }}
        title={isPoolStaking ? t('Unclaimed Rewards') : t('Rewards Earned')}
        token={token ?? ''}
      />
      <StakingInfoTile
        Icon={Moneys}
        buttonsArray={[{
          Icon: Strongbox2,
          onClick: popupOpener(StakingPopUps.WITHDRAW),
          text: t('Withdraw')
        }]}
        cryptoAmount={redeemable}
        decimal={decimal ?? 0}
        fiatAmount={redeemable && decimal ? calcPrice(tokenPrice, redeemable, decimal) : 0}
        isFullScreen
        layoutDirection='row'
        style={{ minWidth: '146px', width: 'min-content' }}
        title={t('Redeemable')}
        token={token ?? ''}
      />
      <StakingInfoTile
        Icon={LockSlash}
        buttonsArray={(type === 'solo'
          ? [{
            Icon: Trade,
            onClick: popupOpener(StakingPopUps.RESTAKE),
            text: t('Restake')
          }]
          : undefined)}
        cryptoAmount={unlockingAmount}
        decimal={decimal ?? 0}
        fiatAmount={unlockingAmount && decimal ? calcPrice(tokenPrice, unlockingAmount, decimal) : 0}
        isFullScreen
        layoutDirection='row'
        onExpand={toBeReleased?.length ? popupOpener(StakingPopUps.UNLOCKING) : undefined}
        style={{ minWidth: '146px', width: 'min-content' }}
        title={t('Unstaking')}
        token={token ?? ''}
      />
      <StakingInfoTile
        buttonsArray={[{
          Icon: Add,
          iconVariant: 'Linear',
          onClick: popupOpener(StakingPopUps.BOND_EXTRA),
          text: t('Stake More')
        }]}
        cryptoAmount={availableBalanceToStake}
        decimal={decimal ?? 0}
        fiatAmount={availableBalanceToStake && decimal ? calcPrice(tokenPrice, availableBalanceToStake, decimal) : 0}
        icon={
          isPoolStaking
            ? <Ice size='18' style={{ justifyContent: 'center' }} />
            : <SnowFlake color={availableBalanceToStake?.isZero() ? '#674394' : undefined} size='18' />
        }
        isFullScreen
        layoutDirection='row'
        style={{ minWidth: '180px', width: 'min-content' }}
        title={t('Available to Stake')}
        token={token ?? ''}
      />
    </Grid>
  );
});

interface Props {
  genesisHash: string | undefined;
  type: 'solo' | 'pool';
  staked: BN | undefined;
  redeemable: Balance | BN | undefined;
  toBeReleased: DateAmount[] | undefined;
  unlockingAmount: BN | undefined;
  rewards: BN | undefined;
  availableBalanceToStake: BN | undefined;
  tokenPrice: number;
  popupOpener: PopupOpener;
  disabled?: boolean;
}

export default function StakingPortfolioAndTiles({ availableBalanceToStake, disabled, genesisHash, popupOpener, redeemable, rewards, staked, toBeReleased, tokenPrice, type, unlockingAmount }: Props) {
  const { t } = useTranslation();
  const { api } = useChainInfo(genesisHash);

  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '8px', padding: '18px' }}>
      <StakingPortfolio
        buttons={[
          ...(type === 'pool'
            ? [{
              Icon: Profile2User,
              onClick: popupOpener(StakingPopUps.MY_POOL),
              text: t('My pool')
            }]
            : []),
          {
            Icon: Coin,
            onClick: popupOpener(StakingPopUps.UNSTAKE),
            text: t('Unstake')
          },
          ...(type === 'solo' && api?.tx['fastUnstake']?.['registerFastUnstake']
            ? [{
              Icon: Timer1,
              onClick: popupOpener(StakingPopUps.FAST_UNSTAKE),
              text: t('Fast Unstake')
            }]
            : [])
        ]}
        disabled={disabled}
        genesisHash={genesisHash as unknown as string}
        isFullScreen
        onInfo={popupOpener(StakingPopUps.INFO)}
        staked={staked as unknown as BN}
        style={{ gap: '8px', margin: 0, width: '400px' }}
        type={type}
      />
      <TileBoxes
        availableBalanceToStake={availableBalanceToStake}
        genesisHash={genesisHash}
        popupOpener={popupOpener}
        redeemable={redeemable}
        rewards={rewards}
        toBeReleased={toBeReleased}
        tokenPrice={tokenPrice}
        type={type}
        unlockingAmount={unlockingAmount}
      />
    </Container>
  );
}
