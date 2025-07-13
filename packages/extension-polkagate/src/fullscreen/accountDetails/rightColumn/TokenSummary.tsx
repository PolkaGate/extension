// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/hooks/useAssetsBalances';

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { FLOATING_POINT_DIGIT } from '@polkadot/extension-polkagate/src/util/constants';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, FormatPrice, ShowBalance4 } from '../../../components';
import { usePrices } from '../../../hooks';
import { calcChange, calcPrice } from '../../../hooks/useYouHave';
import DailyChange from '../../../popup/home/partial/DailyChange';
import { GlowBox } from '../../../style';
import getLogo2 from '../../../util/getLogo2';
import Explorer from '../Explorer';

interface Props {
  address: string | undefined;
  token: FetchedBalance | undefined;
}

function TokenSummary({ address, token }: Props): React.ReactElement {
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

  const [flipCondition, setFlipCondition] = useState(false);

  useEffect(() => {
    if (!token?.genesisHash) {
      return;
    }

    setFlipCondition(true);
    setTimeout(() => setFlipCondition(false), 500);
  }, [token?.genesisHash]);

  return (
    <GlowBox style={{ height: '187px', justifyContent: 'start', justifyItems: 'start', pl: '30px', rowGap: '5px' }}>
      <Grid
        container item
        sx={{
          backdropFilter: 'blur(4px)',
          border: '8px solid',
          borderColor: '#00000033',
          borderRadius: '999px',
          ml: '-10px',
          mt: '15px',
          transform: flipCondition ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 1s',
          width: 'fit-content'
        }}
      >
        <AssetLogo assetSize='36px' baseTokenSize='24px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} subLogoPosition='5px -18px auto auto' />
      </Grid>
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
        width={totalBalancePrice === undefined ? '100px' : 'fit-content'}
        withSmallDecimal
      />
      <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '30px', width: 'fit-content' }}>
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
          decimalPoint={FLOATING_POINT_DIGIT}
          genesisHash={token?.genesisHash}
          skeletonStyle={{ width: '130px' }}
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
