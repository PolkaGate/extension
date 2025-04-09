// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { Grid, Skeleton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Copy } from 'iconsax-react';
import React, { useMemo } from 'react';

import { AssetLogo, FormatBalance2, FormatPrice } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, useFormatted3, usePrices, useTokenPrice2 } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave2';
import { GlowBox } from '../../../style';
import getLogo2 from '../../../util/getLogo2';
import { toShortAddress } from '../../../util/utils';
import StakingActionButton, { type StakingActionButtonProps } from './StakingActionButton';

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

const StakerAddress = ({ address }: { address: string | undefined; }) => {
  if (!address) {
    return null;
  }

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: '#BFA1FF26', borderRadius: '12px', columnGap: '4px', p: '4px', width: 'fit-content' }}>
      <Typography color='text.highlight' variant='B-2'>
        {toShortAddress(address)}
      </Typography>
      <Copy color='#809ACB' size='18' variant='Bulk' />
    </Grid>
  );
};

const StakingIcon = ({ type }: { type: 'solo' | 'pool'; }) => {
  return (
    <Grid container item sx={{ bottom: '20px', height: '32px', position: 'absolute', right: '20px', width: '32px' }}>
      {type === 'solo'
        ? <SnowFlake color='#809ACB40' size='32' />
        : <Ice size='32' style={{ zIndex: -1 }} />
      }
    </Grid>
  );
};

interface Props {
  address: string | undefined;
  genesisHash: string;
  staked: BN | undefined;
  type: 'solo' | 'pool';
  style?: SxProps<Theme>;
  buttons?: StakingActionButtonProps[];
}

export default function StakingPortfolio ({ address, buttons = [], genesisHash, staked, style, type }: Props): React.ReactElement {
  const theme = useTheme();
  const pricesInCurrency = usePrices();
  const tokenPrice = useTokenPrice2(genesisHash);
  const { decimal, token } = useChainInfo(genesisHash, true);
  const formatted = useFormatted3(address, genesisHash);

  const stakedInCurrency = useMemo(() => {
    if (!staked || !pricesInCurrency || !tokenPrice || !decimal) {
      return undefined;
    }

    return calcPrice(tokenPrice.price, staked as unknown as BN, decimal);
  }, [decimal, tokenPrice, pricesInCurrency, staked]);

  return (
    <GlowBox style={{ display: 'grid', p: '18px', rowGap: '5px', width: 'calc(100% - 16px)', ...style }}>
      <Grid alignItems='center' container item justifyContent='space-between'>
        <StakedToken genesisHash={genesisHash} token={token} />
        <StakerAddress address={formatted} />
      </Grid>
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
              decimalColor={theme.palette.text.secondary}
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
        <FormatBalance2
          decimalPoint={4}
          decimals={[decimal ?? 0]}
          style={{
            color: '#BEAAD8',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 500,
            width: 'max-content'
          }}
          tokens={[token ?? '']}
          value={staked}
        />
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-start' sx={{ columnGap: '8px' }}>
        {buttons.map(({ Icon, disabled, onClick, text }, index) => (
          <StakingActionButton
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
