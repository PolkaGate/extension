// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';

import { Grid, Grow, Skeleton, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

import { FLOATING_POINT_DIGIT } from '@polkadot/extension-polkagate/src/util/constants';
import { calcChange, calcPrice } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, FormatPrice, ShowBalance4 } from '../../../components';
import { usePrices } from '../../../hooks';
import DailyChange from '../../../popup/home/partial/DailyChange';
import { GlowBox } from '../../../style';
import getLogo2 from '../../../util/getLogo2';
import Explorer from '../Explorer';

interface Props {
  address: string | undefined;
  token: FetchedBalance | undefined;
}

function TokenSummary ({ address, token }: Props): React.ReactElement {
  const theme = useTheme();
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const tokenPrice = pricesInCurrency?.prices[token?.priceId ?? '']?.value ?? 0;
  const tokenPriceChange = pricesInCurrency?.prices[token?.priceId ?? '']?.change ?? 0;
  const change = calcChange(tokenPrice, Number(token?.totalBalance) / (10 ** (token?.decimal ?? 0)), tokenPriceChange);

  const totalBalancePrice = useMemo(() =>
    token?.decimal ? calcPrice(priceOf(token?.priceId ?? '') ?? 0, token?.totalBalance ?? BN_ZERO, token?.decimal ?? 0) : undefined
  , [priceOf, token?.decimal, token?.priceId, token?.totalBalance]);

  const logoInfo = useMemo(() => getLogo2(token?.genesisHash, token?.token), [token?.genesisHash, token?.token]);

  return (
    <GlowBox style={{ height: '187px', justifyContent: 'start', justifyItems: 'start', pl: '30px', rowGap: '5px' }}>
      <Grow
        in={!!token}
        key={token?.genesisHash ?? token?.token}
        style={{ transformOrigin: 'center center' }} timeout={1000}
      >
        <Grid
          container item
          sx={{
            backdropFilter: 'blur(4px)',
            border: '8px solid',
            borderColor: '#00000033',
            borderRadius: '999px',
            height: 'fit-content',
            ml: '-10px',
            mt: '15px',
            width: 'fit-content'
          }}
        >
          <AssetLogo assetSize='36px' baseTokenSize='24px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} subLogoPosition='5px -18px auto auto' />
        </Grid>
      </Grow>
      <Explorer
        address={address}
      />
      {token?.token
        ? <Typography color='text.secondary' sx={{ height: '18px' }} variant='B-4'>
          {token?.token}
        </Typography>
        : <Skeleton
          animation='wave'
          height={12}
          sx={{ borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '30px' }}
        />
      }
      <FormatPrice
        commify
        decimalColor={theme.palette.text.secondary}
        dotStyle={'big'}
        fontFamily='OdibeeSans'
        fontSize='48px'
        fontWeight={400}
        num={totalBalancePrice}
        skeletonHeight={30}
        style= {{ height: '49.5px' }}
        width={totalBalancePrice === undefined ? '100px' : 'fit-content'}
        withSmallDecimal
      />
      <Grid alignItems='center' container item sx={{ columnGap: '5px', height: '30px', width: 'fit-content' }}>
        <ShowBalance4
          balance={token?.totalBalance}
          balanceProps={{
            style: {
              color: '#BEAAD8',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontWeight: 500,
              width: 'max-content'
            }
          }}
          decimal={token?.decimal}
          decimalPoint={FLOATING_POINT_DIGIT}
          genesisHash={token?.genesisHash}
          skeletonStyle={{ width: '130px' }}
          token={token?.token}
        />
        {token?.priceId && pricesInCurrency?.prices[token?.priceId]?.change &&
          <DailyChange
            change={change}
            textVariant='B-1'
          />
        }
      </Grid>
    </GlowBox>
  );
}

export default memo(TokenSummary);
