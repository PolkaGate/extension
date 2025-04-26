// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/hooks/useAssetsBalances';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, FormatBalance2, FormatPrice } from '../../../components';
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

function TokenSummary ({ address, token }: Props): React.ReactElement {
  const theme = useTheme();
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const tokenPrice = pricesInCurrency?.prices[token?.priceId ?? '']?.value ?? 0;
  const tokenPriceChange = pricesInCurrency?.prices[token?.priceId ?? '']?.change ?? 0;
  const change = calcChange(tokenPrice, Number(token?.totalBalance) / (10 ** (token?.decimal ?? 0)), tokenPriceChange);

  const totalBalancePrice = useMemo(() => calcPrice(priceOf(token?.priceId ?? '') ?? 0, token?.totalBalance ?? BN_ZERO, token?.decimal ?? 0), [priceOf, token?.decimal, token?.priceId, token?.totalBalance]);
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
    <GlowBox style={{ justifyContent: 'start', justifyItems: 'start', pl: '30px', rowGap: '5px' }}>
      <Grid container item
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
        }}>
        <AssetLogo assetSize='36px' baseTokenSize='24px' genesisHash={token?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} subLogoPosition='5px -18px auto auto' />
      </Grid>
      <Explorer
        address={address}
        genesisHash={token?.genesisHash}
      />
      <Typography color='text.secondary' sx={{ height: '18px' }} variant='B-4'>
        {token?.token}
      </Typography>
      <FormatPrice
        commify
        decimalColor={theme.palette.text.secondary}
        dotStyle={'big'}
        fontFamily='OdibeeSans'
        fontSize='48px'
        fontWeight={400}
        height={53}
        num={totalBalancePrice}
        width='fit-content'
        withSmallDecimal
      />
      <Grid alignItems='center' container item sx={{ columnGap: '5px', lineHeight: '30px', width: 'fit-content' }}>
        <FormatBalance2
          decimalPoint={4}
          decimals={[token?.decimal ?? 0]}
          style={{
            color: '#BEAAD8',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 500,
            width: 'max-content'
          }}
          tokens={[token?.token ?? '']}
          value={token?.totalBalance}
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
