// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import type { CurrencyItemType } from '../partials/Currency';

import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { assetsBtcSVG, assetsEthSVG } from '@polkagate/apps-config/ui/logos/assets';
import { chainsPolkadotCircleSVG } from '@polkagate/apps-config/ui/logos/chains';
import * as flags from 'country-flag-icons/string/3x2';
import React, { useMemo } from 'react';

interface Props {
  onclick: (item: CurrencyItemType) => void;
  currency: CurrencyItemType;
}

function CurrencyItem({ currency, onclick }: Props): React.ReactElement {
  const theme = useTheme();

  const flagSVG = useMemo(() => {
    const countryCode = currency.code.slice(0, 2).toUpperCase();

    if (currency.code === 'BTC') {
      return assetsBtcSVG;
    }

    if (currency.code === 'ETH') {
      return assetsEthSVG;
    }

    if (currency.code === 'DOT') {
      return chainsPolkadotCircleSVG;
    }

    const svg = (flags as Record<string, string>)[countryCode];

    if (svg) {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    return '';
  }, [currency.code]);

  return (
    // eslint-disable-next-line react/jsx-no-bind
    <Grid alignItems='center' container onClick={() => onclick(currency)} sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, cursor: 'pointer', height: '45px', px: '15px' }}>
      <Stack direction='row' justifyContent='space-between' width='100%'>
        <Grid alignItems='center' container item mr='10px' width='fit-content'>
          <Box
            component='img'
            src={flagSVG}
            sx={{ height: '17px' }}
          />
          <Typography fontSize='16px' fontWeight={400} px='5px'>
            {currency.country}
          </Typography>
        </Grid>
        <Typography fontSize='16px' fontWeight={500}>
          {currency.sign}
        </Typography>
      </Stack>
    </Grid>
  );
}

export default React.memo(CurrencyItem);
