// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { DateAmount } from '../../../hooks/useSoloStakingInfo';

import { Container, Grid, Stack, Typography } from '@mui/material';
import { BuyCrypto, LockSlash, Moneys, Strongbox2, Timer, Timer1, Trade, Wallet } from 'iconsax-react';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { type BN, noop } from '@polkadot/util';

import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useAccountAssets, useChainInfo, usePrices, useSelectedAccount, useSoloStakingInfo, useTranslation } from '../../../hooks';
import StakingInfoTile from '../../../popup/staking/partial/StakingInfoTile';
import StakingPortfolio from '../../../popup/staking/partial/StakingPortfolio';
import { GlowBall } from '../../../style/VelvetBox';
import { amountToHuman } from '../../../util/utils';
import HomeLayout from '../../components/layout';

const StakingIcon = ({ type }: { type: 'solo' | 'pool'; }) => {
  const { t } = useTranslation();

  return (
    <Grid alignItems='flex-start' container item sx={{ columnGap: '6px', pl: '18px' }}>
      {type === 'solo'
        ? <SnowFlake size='36' />
        : <Ice asPortfolio size='36' />
      }
      <Typography color='text.primary' textTransform='uppercase' variant='H-2'>
        {type === 'solo'
          ? t('Solo Staking')
          : t('Pool Staking')}
      </Typography>
    </Grid>
  );
};

interface TileBoxProps {
  genesisHash: string | undefined;
  redeemable: Balance | undefined;
  toBeReleased: DateAmount[] | undefined;
  unlockingAmount: BN | undefined;
  rewards: BN | undefined;
  tokenPrice: number;
  availableBalanceToStake: BN | undefined;
}

const TileBox = ({ availableBalanceToStake, genesisHash, redeemable, rewards, toBeReleased, tokenPrice, unlockingAmount }: TileBoxProps) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Grid container item sx={{ bgcolor: '#1B133C', borderRadius: '18px', display: 'flex', flexDirection: 'row', gap: '5px', overflow: 'hidden', p: '4px', position: 'relative' }} xs>
      <GlowBall />
      <StakingInfoTile
        Icon={Moneys}
        buttonsArray={[{
          Icon: Timer,
          onClick: noop,
          text: t('Pending Rewards')
        }]}
        cryptoAmount={rewards}
        decimal={decimal ?? 0}
        fiatAmount={rewards && decimal ? (Number(amountToHuman(rewards, decimal)) * tokenPrice) : 0}
        isFullScreen
        layoutDirection='row'
        style={{ minWidth: '146px', width: '146px' }}
        title={t('Rewards paid')}
        token={token ?? ''}
      />
      <StakingInfoTile
        Icon={Moneys}
        buttonsArray={[{
          Icon: Strongbox2,
          onClick: noop,
          text: t('Withdraw')
        }]}
        cryptoAmount={redeemable}
        decimal={decimal ?? 0}
        fiatAmount={redeemable && decimal ? (Number(amountToHuman(redeemable, decimal)) * tokenPrice) : 0}
        isFullScreen
        layoutDirection='row'
        style={{ minWidth: '146px', width: '146px' }}
        title={t('Redeemable')}
        token={token ?? ''}
      />
      <StakingInfoTile
        Icon={LockSlash}
        buttonsArray={[{
          Icon: Trade,
          onClick: noop,
          text: t('Restake')
        }]}
        cryptoAmount={unlockingAmount}
        decimal={decimal ?? 0}
        fiatAmount={unlockingAmount && decimal ? (Number(amountToHuman(unlockingAmount, decimal)) * tokenPrice) : 0}
        isFullScreen
        layoutDirection='row'
        onExpand={toBeReleased?.length ? noop : undefined}
        style={{ minWidth: '146px', width: '146px' }}
        title={t('Unstaking')}
        token={token ?? ''}
      />
      <StakingInfoTile
        Icon={Wallet}
        buttonsArray={[{
          Icon: Wallet,
          onClick: noop,
          text: t('Stake')
        }]}
        cryptoAmount={availableBalanceToStake}
        decimal={decimal ?? 0}
        fiatAmount={availableBalanceToStake && decimal ? (Number(amountToHuman(availableBalanceToStake, decimal)) * tokenPrice) : 0}
        isFullScreen
        layoutDirection='row'
        onExpand={toBeReleased?.length ? noop : undefined}
        style={{ minWidth: '194px', width: '194px' }}
        title={t('Available to Stake')}
        token={token ?? ''}
      />
    </Grid>
  );
};

interface FirstRowProps {
  genesisHash: string | undefined;
  type: 'solo' | 'pool';
  staked: BN | undefined;
  redeemable: Balance | undefined;
  toBeReleased: DateAmount[] | undefined;
  unlockingAmount: BN | undefined;
  rewards: BN | undefined;
  availableBalanceToStake: BN | undefined;
  tokenPrice: number;
}

const FirstRow = ({ availableBalanceToStake, genesisHash, redeemable, rewards, staked, toBeReleased, tokenPrice, type, unlockingAmount }: FirstRowProps) => {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '8px', padding: '18px' }}>
      <StakingPortfolio
        buttons={[{
          Icon: BuyCrypto,
          onClick: noop,
          text: t('Unstake')
        },
        {
          Icon: Timer1,
          onClick: noop,
          text: t('Fast Unstake')
        }]}
        genesisHash={genesisHash as unknown as string}
        isFullScreen
        onInfo={noop}
        staked={staked as unknown as BN}
        style={{ gap: '8px', margin: 0, width: '400px' }}
        type={type}
      />
      <TileBox
        availableBalanceToStake={availableBalanceToStake}
        genesisHash={genesisHash}
        redeemable={redeemable}
        rewards={rewards}
        toBeReleased={toBeReleased}
        tokenPrice={tokenPrice}
        unlockingAmount={unlockingAmount}
      />
    </Container>
  );
};

export default function AccountDetails (): React.ReactElement {
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
        <FirstRow
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
