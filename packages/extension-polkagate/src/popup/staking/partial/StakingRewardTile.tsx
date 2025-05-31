// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { Box, Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { Award, Graph, MedalStar, Timer } from 'iconsax-react';
import React, { useMemo } from 'react';

import { BN_ZERO, noop } from '@polkadot/util';

import { Thunder } from '../../../assets/gif';
import { FormatBalance2, FormatPrice } from '../../../components';
import { useChainInfo, usePrices, useTokenPrice2, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import { Background } from '../../../style';
import { ColumnAmounts } from '../../tokens/partial/ColumnAmounts';
import StakingActionButton from './StakingActionButton';
import StakingInfoTile from './StakingInfoTile';

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

interface FlatRewardTileProps {
  reward: BN | undefined;
  rewardInCurrency: number | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

const FlatRewardTile = ({ decimal, reward, rewardInCurrency, token }: FlatRewardTileProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isDisabled = useMemo(() => reward === undefined || reward.isZero() || rewardInCurrency === undefined || rewardInCurrency === 0, [reward, rewardInCurrency]);

  return (
    <Stack direction='column' sx={{ borderRadius: '14px', height: '170px', overflow: 'hidden', position: 'relative' }}>
      <ThunderBackground />
      <Badge />
      <Stack direction='column' sx={{ p: '4px', zIndex: 10 }}>
        <Stack direction='column' sx={{ pl: '14px', pt: '16px', rowGap: '4px', zIndex: 10 }}>
          <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
            <Award color='#3988FF' size='20' variant='Bulk' />
            <Typography color='text.highlight' variant='B-2'>
              {t('Balance')}
            </Typography>
          </Container>
          <Grid container item>
            {reward === undefined
              ? (
                <Skeleton
                  animation='wave'
                  height='30px'
                  sx={{ borderRadius: '50px', fontWeight: 'bold', maxWidth: '245px', mt: '5px', transform: 'none', width: '100%' }}
                  variant='text'
                />)
              : (
                <FormatPrice
                  commify
                  decimalColor={theme.palette.text.highlight}
                  dotStyle={'big'}
                  fontFamily='OdibeeSans'
                  fontSize='40px'
                  fontWeight={400}
                  height={40}
                  num={rewardInCurrency}
                  width='fit-content'
                  withSmallDecimal
                />)
            }
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-start' sx={{ m: '-3px 0 6px' }}>
            {reward === undefined
              ? (
                <Skeleton
                  animation='wave'
                  height='16px'
                  sx={{ borderRadius: '10px', fontWeight: 'bold', m: '6px 0 1px', maxWidth: '75px', transform: 'none', width: '100%' }}
                  variant='text'
                />)
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
                  value={reward}
                />)}
          </Grid>
        </Stack>
        <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '10px 12px' }}>
          <ColumnAmounts
            cryptoAmount={reward ?? BN_ZERO}
            decimal={decimal ?? 0}
            fiatAmount={rewardInCurrency ?? 0}
            placement='left'
            token={token ?? ''}
          />
          <StakingActionButton
            buttonFontStyle={{ ...theme.typography['B-4'] }}
            disabled={isDisabled}
            onClick={noop}
            startIcon={<MedalStar color={isDisabled ? '#EAEBF14D' : theme.palette.text.primary} size='18' variant='Bold' />}
            style={{ '> span.MuiButton-startIcon': { marginRight: '4px' }, borderRadius: '12px', height: '28px', p: '6px 10px', width: 'fit-content' }}
            text={t('Claim rewards')}
          />
        </Container>
      </Stack>
    </Stack>
  );
};

interface Props {
  layoutDirection?: 'row' | 'column';
  genesisHash: string | undefined;
  reward: BN | undefined;
}

export default function StakingRewardTile ({ genesisHash, layoutDirection, reward }: Props) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice2(genesisHash);

  const rewardInCurrency = useMemo(() => {
    if (!reward || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, reward, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, reward]);

  if (layoutDirection === 'row') {
    return (
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
        cryptoAmount={reward}
        decimal={decimal ?? 0}
        fiatAmount={0}
        layoutDirection='row'
        title={t('Rewards paid')}
        token={token ?? ''}
      />
    );
  } else {
    return (
      <FlatRewardTile
        decimal={decimal}
        reward={reward}
        rewardInCurrency={rewardInCurrency}
        token={token}
      />
    );
  }
}
