// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Grid, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { AssetLogo, FormatBalance2, FormatPrice } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, usePrices, useTokenPrice2 } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave2';
import { GlowBox } from '../../../style';
import getLogo2 from '../../../util/getLogo2';
import PortfolioActionButton, { type PortfolioActionButtonProps } from './PortfolioActionButton';

const StakedToken = ({ genesisHash, token }: { genesisHash: string; token: string | undefined; }) => {
  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  if (!token) {
    return;
  }

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '4px', width: 'fit-content' }}>
      <AssetLogo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
      <Typography color='text.secondary' variant='B-2'>
        {`Staked ${token}`}
      </Typography>
    </Grid>
  );
};

const StakingIcon = ({ type }: { type: 'solo' | 'pool'; }) => {
  return (
    <Grid container item sx={{ bottom: 0, height: '32px', position: 'absolute', right: '20px', width: '32px' }}>
      {type === 'solo'
        ? <SnowFlake color='#809ACB40' size='32' />
        : <Ice size='28' style={{ opacity: 0.3 }} />
      }
    </Grid>
  );
};

interface Props {
  genesisHash: string;
  staked: BN | undefined;
  type: 'solo' | 'pool';
  style?: SxProps<Theme>;
  buttons?: PortfolioActionButtonProps[];
}

export default function StakingPortfolio ({ buttons = [], genesisHash, staked, style, type }: Props): React.ReactElement {
  const theme = useTheme();
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice2(genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const stakedInCurrency = useMemo(() => {
    if (!staked || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, staked as unknown as BN, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, staked]);

  return (
    <GlowBox staking style={{ display: 'grid', p: '18px', pb: 0, rowGap: '5px', width: 'calc(100% - 16px)', ...style }}>
      <StakedToken genesisHash={genesisHash} token={token} />
      <Grid container item>
        {staked === undefined
          ? (
            <Skeleton
              animation='wave'
              height='24px'
              sx={{ borderRadius: '50px', fontWeight: 'bold', maxWidth: '245px', transform: 'none', width: '100%' }}
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
              num={stakedInCurrency}
              width='fit-content'
              withSmallDecimal
            />)
        }
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start'>
        {staked === undefined
          ? (
            <Skeleton
              animation='wave'
              height='16px'
              sx={{ borderRadius: '10px', fontWeight: 'bold', m: '6px 0 4px', maxWidth: '75px', transform: 'none', width: '100%' }}
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
              value={staked}
            />)}
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start' sx={{ columnGap: '8px' }}>
        {buttons.map(({ Icon, disabled, onClick, text }, index) => (
          <PortfolioActionButton
            Icon={Icon}
            disabled={disabled}
            key={index}
            onClick={onClick}
            text={text}
          />
        ))}
      </Grid>
      <StakingIcon type={type} />
    </GlowBox>
  );
}
