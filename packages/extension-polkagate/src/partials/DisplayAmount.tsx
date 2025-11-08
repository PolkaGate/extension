// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useContext, useMemo } from 'react';

import { CurrencyContext } from '../components';
import { useChainInfo, useTokenPriceBySymbol } from '../hooks';
import { amountToHuman, countDecimalPlaces } from '../util';

interface AmountProps {
  amount: string | undefined;
  assetDecimal?: number | undefined;
  differentValueColor?: string;
  genesisHash: string | undefined;
  isExtension?: boolean;
  showValue?: boolean;
  token: string | undefined;
}

function DisplayAmount ({ amount, assetDecimal, differentValueColor, genesisHash, isExtension, showValue = true, token }: AmountProps) {
  const { decimal: nativeAssetDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

  const { currency } = useContext(CurrencyContext);

  const _decimal = assetDecimal ?? nativeAssetDecimal;
  const _token = token ?? nativeToken;
  const price = useTokenPriceBySymbol(_token, genesisHash);
  const textColor = useMemo(() => isExtension ? 'text.highlight' : 'text.secondary', [isExtension]);

  const amountInHuman = amountToHuman((amount ?? '0'), _decimal);

  const value = ((price.price ?? 0) * parseFloat(amountInHuman)).toFixed(2);
  const [integerPart, decimalPart] = amountInHuman.split('.');

  const decimalToShow = useMemo(() => {
    if (decimalPart) {
      const countDecimal = countDecimalPlaces(Number('0.' + decimalPart));
      const toCut = countDecimal > 4 ? 4 : countDecimal;

      return `.${decimalPart.slice(0, toCut)}`;
    } else {
      return '.00';
    }
  }, [decimalPart]);

  return (
    <Stack alignItems={showValue ? 'center' : 'flex-end'} direction='column' py='4px'>
      <Stack alignItems='flex-end' direction='row'>
        <Typography color='text.primary' lineHeight='normal' variant='H-1'>
          {integerPart}
        </Typography>
        <Typography color={textColor} variant='H-3'>
          {decimalToShow}
        </Typography>
        <Typography color={textColor} pl='3px' variant='H-3'>
          {_token}
        </Typography>
      </Stack>
      {showValue &&
        <Typography color={differentValueColor ?? 'text.secondary'} pl='3px' variant='B-4'>
          {currency?.sign}{value}
        </Typography>
      }
    </Stack>
  );
}

export default React.memo(DisplayAmount);
