// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Stack, useTheme } from '@mui/material';
import { CloseCircle, RefreshCircle, Tag2, TickCircle } from 'iconsax-react';
import React, { useCallback, useContext, useMemo } from 'react';

import { CurrencyContext, MyTextField, MyTooltip } from '@polkadot/extension-polkagate/src/components/index';

import { useTranslation } from '../../../hooks';
import { getPrice } from './utils';

function GetPriceId({ chainName, isCheckingPriceId, price, priceId, setCheckingPriceId, setPrice, setPriceId }:
  {
    chainName: string | undefined;
    isCheckingPriceId: boolean | undefined;
    price: number | null | undefined;
    setCheckingPriceId: React.Dispatch<React.SetStateAction<boolean | undefined>>;
    setPrice: React.Dispatch<React.SetStateAction<number | null | undefined>>;
    priceId: string | undefined;
    setPriceId: React.Dispatch<React.SetStateAction<string | undefined>>;
  }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currency } = useContext(CurrencyContext);

  const onPriceIdChange = useCallback((input: string) => {
    setPriceId(input);
    setPrice(undefined);
  }, [setPrice, setPriceId]);

  const onCheckPriceIdClick = useCallback(() => {
    if (!priceId) {
      return;
    }

    setCheckingPriceId(true);

    getPrice([priceId], currency?.code)
      .then((p) => setPrice(p?.price ?? null))
      .catch((error) => {
        console.error(error);
        setPrice(null);
      })
      .finally(() => setCheckingPriceId(false));
  }, [priceId, setCheckingPriceId, currency?.code, setPrice]);

  const [Icon, color, bgcolor] = useMemo(() => {
    return isCheckingPriceId
      ? [RefreshCircle, theme.palette.primary.main, '#2D1E4A']
      : price === undefined && !priceId
        ? [Tag2, theme.palette.primary.main, '#2D1E4A']
        : price === undefined && priceId
          ? [Tag2, theme.palette.primary.main, '#2D1E4A']
          : price === null
            ? [CloseCircle, '#FF165C', '#B319554D']
            : [TickCircle, theme.palette.success.main, '#68A87A4D'];
  }, [isCheckingPriceId, price, priceId, theme.palette.primary.main, theme.palette.success.main]);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' sx={{ width: '100%' }}>
      <MyTextField
        inputValue={priceId}
        onEnterPress={onCheckPriceIdClick}
        onTextChange={onPriceIdChange}
        placeholder={chainName}
        style={{ marginBottom: '66px', width: '100%' }}
        title={t('Network token price id')}
        tooltip={t('Find your token on CoinGecko. The price ID is available at: https://www.coingecko.com/en/coins/[price-id]')}
      />
      <MyTooltip content={t('Check price ID')}>
        <IconButton onClick={onCheckPriceIdClick} sx={{ bgcolor, borderRadius: '8px', mb: '41px', padding: '3px', position: 'absolute', right: '24px' }}>
          <Box sx={{
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            },
            animation: isCheckingPriceId ? 'spin 1.5s linear infinite' : undefined,
            display: 'inline-block',
            transformOrigin: '50% 50%',
            verticalAlign: 'middle',
            // to keep the icon stable in layout
            height: '30px',
            width: '30px'
          }}
          >
            <Icon color={color} size='30' variant='Bulk' />
          </Box>
        </IconButton>
      </MyTooltip>
    </Stack>
  );
}

export default GetPriceId;
