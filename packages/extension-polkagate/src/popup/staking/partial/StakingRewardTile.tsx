// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Award, Chart21, Graph, MedalStar, Timer } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { calcPrice } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ZERO } from '@polkadot/util';

import { Thunder } from '../../../assets/gif';
import { FormatBalance2, FormatPrice, MySkeleton } from '../../../components';
import { useChainInfo, usePrices, useStakingRewardsChart, useTokenPrice, useTranslation } from '../../../hooks';
import { Background } from '../../../style';
import { ColumnAmounts } from '../../tokens/partial/ColumnAmounts';
import StakingActionButton from './StakingActionButton';
import StakingInfoTile, { TileActionButton } from './StakingInfoTile';

const ThunderBackground = () => {
  return (
    <>
      <Background imageStyle={{ backdropFilter: 'blur(5px)', height: '420px', left: '55px', top: '-90px', width: '350px' }} type='staking' />
      <Box
        component='img'
        src={Thunder as string}
        sx={{ height: '650px', left: '-300px', mixBlendMode: 'color-dodge', position: 'absolute', rotate: '24deg', top: '-300px', width: '1160px' }}
      />
    </>
  );
};

const Badge = () => {
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ background: 'linear-gradient(262.56deg, #0094FF 0%, #596AFF 45%, #0094FF 100%)', borderRadius: '0 0 12px 12px', clipPath: 'polygon(0% 0%, 100% 0%, 97% 100%, 3% 100%)', left: '50%', p: '3px 18px', position: 'absolute', transform: 'translateX(-50%)', width: 'fit-content' }}>
      <Typography color='text.primary' fontSize='12px' fontWeight={700}>
        {t('Rewards')}
      </Typography>
    </Grid>
  );
};

const ChartButton = ({ onRewardChart }: { onRewardChart: () => void }) => {
  return (
    <Grid container item onClick={onRewardChart} sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '999px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'center', p: '6px', position: 'absolute', right: '16px', top: '16px', width: 'fit-content', zIndex: 2 }}>
      <Chart21 color='#0094FF' size='15' variant='Bulk' />
    </Grid>
  );
};

interface PoolClaimRewardProps {
  reward: BN | undefined;
  rewardInCurrency: number | undefined;
  decimal: number | undefined;
  token: string | undefined;
  onClaimReward: () => void;
  disabled?: boolean;

}

const PoolClaimReward = ({ decimal, disabled, onClaimReward, reward, rewardInCurrency, token }: PoolClaimRewardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isDisabled = useMemo(() => disabled || reward === undefined || reward.isZero() || rewardInCurrency === undefined || rewardInCurrency === 0, [disabled, reward, rewardInCurrency]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '10px 12px' }}>
      <ColumnAmounts
        balanceColor={theme.palette.text.highlight}
        color={theme.palette.text.primary}
        cryptoAmount={reward ?? BN_ZERO}
        decimal={decimal ?? 0}
        fiatAmount={rewardInCurrency ?? 0}
        placement='left'
        priceSecondColor={theme.palette.text.highlight}
        token={token ?? ''}
      />
      <StakingActionButton
        buttonFontStyle={{ ...theme.typography['B-4'] }}
        disabled={isDisabled}
        onClick={onClaimReward}
        startIcon={<MedalStar color={isDisabled ? '#EAEBF14D' : theme.palette.text.primary} size='18' variant='Bold' />}
        style={{ '> span.MuiButton-startIcon': { marginRight: '4px' }, borderRadius: '12px', height: '28px', p: '6px 10px', width: 'fit-content' }}
        text={t('Claim Rewards')}
      />
    </Container>
  );
};

interface SoloRewardProps {
  onRewardChart: () => void;
  onClaimReward: () => void;
}

const SoloReward = ({ onClaimReward, onRewardChart }: SoloRewardProps) => {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', bottom: '20px', display: 'flex', flexDirection: 'row', gap: '4px', justifyContent: 'flex-end', position: 'absolute', pr: '25px', pt: '15px', width: '100%', zIndex: 10 }}>
      <TileActionButton
        Icon={Timer}
        noText
        onClick={onClaimReward}
        style={{ borderRadius: '999px', maxWidth: '30px' }}
        text={t('Pending Rewards')}
      />
      <TileActionButton
        Icon={Chart21}
        noText
        onClick={onRewardChart}
        style={{ borderRadius: '999px', maxWidth: '30px' }}
        text={t('Chart')}
      />
    </Container>
  );
};

interface FlatRewardTileProps {
  reward: BN | undefined;
  totalClaimedReward: BN | undefined;
  rewardInCurrency: number | undefined;
  totalClaimedRewardInCurrency: number | undefined;
  decimal: number | undefined;
  token: string | undefined;
  onClaimReward: () => void;
  onRewardChart: () => void;
  disabled?: boolean;
  type: 'solo' | 'pool';
}

const FlatRewardTile = ({ decimal, disabled, onClaimReward, onRewardChart, reward, rewardInCurrency, token, totalClaimedReward, totalClaimedRewardInCurrency, type }: FlatRewardTileProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const height = type === 'pool' ? '170px' : '140px';

  const { totalRewardCurrency, totalRewardFiat } = useMemo(() => {
    if (!totalClaimedRewardInCurrency || !totalClaimedReward) {
      return { totalRewardCurrency: undefined, totalRewardFiat: undefined };
    }

    if (type === 'solo') {
      return {
        totalRewardCurrency: rewardInCurrency,
        totalRewardFiat: reward
      };
    }

    return {
      totalRewardCurrency: totalClaimedRewardInCurrency,
      totalRewardFiat: totalClaimedReward
    };
  }, [reward, rewardInCurrency, totalClaimedReward, totalClaimedRewardInCurrency, type]);

  return (
    <Stack direction='column' sx={{ borderRadius: '14px', height, overflow: 'hidden', position: 'relative' }}>
      <ThunderBackground />
      <Badge />
      {type === 'pool' && <ChartButton onRewardChart={onRewardChart} />}
      <Stack direction='column' sx={{ my: type === 'solo' ? 'auto' : 0, p: '4px', zIndex: 1 }}>
        <Stack direction='column' sx={{ pl: '14px', pt: '16px', rowGap: '4px', zIndex: 1 }}>
          <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
            <Award color='#3988FF' size='20' variant='Bulk' />
            <Typography color='text.highlight' variant='B-2'>
              {t('Earned')}
            </Typography>
          </Container>
          <Grid alignItems='center' container item justifyContent='start' sx={{ height: '40px' }}>
            {totalRewardCurrency === undefined
              ? (
                <Stack direction='column' sx={{ width: '100%' }}>
                  <MySkeleton style={{ marginTop: '5px', maxWidth: '245px', width: '100%' }} />
                  <MySkeleton style={{ marginTop: '5px', maxWidth: '145px', width: '40%' }} />
                </Stack>
              )
              : (
                <FormatPrice
                  commify
                  decimalColor={theme.palette.text.highlight}
                  dotStyle={'big'}
                  fontFamily='OdibeeSans'
                  fontSize='40px'
                  fontWeight={400}
                  height={40}
                  num={totalRewardCurrency}
                  width='fit-content'
                  withSmallDecimal
                />)
            }
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-start' sx={{ height: '20px', m: '-3px 0 6px' }}>
            {totalRewardFiat === undefined
              ? (
                <MySkeleton style={{ maxWidth: '75px', width: '100%' }} />
              )
              : (
                <FormatBalance2
                  decimalPoint={4}
                  decimals={[decimal ?? 0]}
                  style={{
                    color: theme.palette.text.highlight,
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontWeight: 500,
                    width: 'max-content'
                  }}
                  tokens={[token ?? '']}
                  value={totalRewardFiat}
                />)}
          </Grid>
        </Stack>
        {type === 'pool'
          ? (
            <PoolClaimReward
              decimal={decimal}
              disabled={disabled}
              onClaimReward={onClaimReward}
              reward={reward}
              rewardInCurrency={rewardInCurrency}
              token={token}
            />)
          : (
            <SoloReward
              onClaimReward={onClaimReward}
              onRewardChart={onRewardChart}
            />)
        }
      </Stack>
    </Stack>
  );
};

interface Props {
  address: string | undefined;
  layoutDirection?: 'row' | 'column';
  genesisHash: string | undefined;
  reward: BN | undefined;
  onClaimReward: () => void;
  isDisabled?: boolean;
  type: 'solo' | 'pool';
}

export default function StakingRewardTile ({ address, genesisHash, isDisabled, layoutDirection, onClaimReward, reward, type }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice(genesisHash);
  // Pool total earned rewards
  const { totalClaimedReward } = useStakingRewardsChart(address, genesisHash, type);

  const rewardInCurrency = useMemo(() => {
    if (!reward || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, reward, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, reward]);

  // Pool total earned rewards
  const totalClaimedRewardInCurrency = useMemo(() => {
    if (!totalClaimedReward || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, totalClaimedReward, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, totalClaimedReward]);

  const onRewardChart = useCallback(() => address && navigate('/stakingReward/' + address + '/' + genesisHash + '/' + type) as void, [address, genesisHash, navigate, type]);

  if (layoutDirection === 'row') {
    return (
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
        cryptoAmount={reward}
        decimal={decimal ?? 0}
        fiatAmount={0}
        layoutDirection='row'
        title={t('Rewards Earned')}
        token={token ?? ''}
      />
    );
  }

  return (
    <FlatRewardTile
      decimal={decimal}
      disabled={isDisabled}
      onClaimReward={onClaimReward}
      onRewardChart={onRewardChart}
      reward={reward}
      rewardInCurrency={rewardInCurrency}
      token={token}
      totalClaimedReward={totalClaimedReward}
      totalClaimedRewardInCurrency={totalClaimedRewardInCurrency}
      type={type}
    />
  );
}
