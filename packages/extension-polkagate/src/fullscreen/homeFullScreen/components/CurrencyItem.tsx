// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { Box, Grid, Typography, useTheme } from '@mui/material';
import * as flags from 'country-flag-icons/string/3x2';
import React, { useMemo } from 'react';

import { CurrencyItemType } from '../partials/Currency';

interface Props {
  onclick: (item: CurrencyItemType) => void;
  currency: CurrencyItemType;
}

function CurrencyItem({ currency, onclick }: Props): React.ReactElement {
  const theme = useTheme();

  const flagSVG = useMemo(() => {
    const countryCode = currency.code.slice(0, 2);
    const svg = flags?.[countryCode];
    const flag = `data:image/svg+xml;base64,${btoa(svg)}`;

    return flag;
  }, [currency.code]);
  const selectedItem = useMemo(() => false, []);

  return (
    <Grid alignItems='center' container onClick={() => onclick(currency)} sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, bgcolor: selectedItem ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: 'pointer', height: '45px', px: '15px' }}>
      <Grid alignItems='center' container item mr='10px' width='fit-content'>
        <Box
          component='img'
          src={flagSVG}
          sx={{ height: '17px' }}
        />
      </Grid>
      <Typography fontSize='16px' fontWeight={selectedItem ? 500 : 400}>
        {`${currency.country} - ${currency.sign}`}
      </Typography>
    </Grid>
  );
}

export default React.memo(CurrencyItem);
