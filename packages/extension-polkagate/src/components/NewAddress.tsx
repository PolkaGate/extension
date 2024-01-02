// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useAccount, useChain, useFormatted, useTranslation } from '../hooks';
import { Identicon, ShortAddress } from './';

export interface Props {
  address?: string | null;
  name?: string | null;
  style?: SxProps<Theme> | undefined;
  showCopy?: boolean;
}

export default function NewAddress({ address, name, showCopy, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette]);

  return (
    <Grid container gap='10px' justifyContent='space-between' sx={{ backgroundColor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '14px 8px', ...style }}>
      <Grid container item width='fit-content'>
        <Identicon
          iconTheme={chain?.icon || 'polkadot'}
          prefix={chain?.ss58Format ?? 42}
          size={40}
          value={formatted || address}
        />
      </Grid>
      <Grid alignItems='flex-start' container direction='column' item xs>
        <Typography fontSize='16px' fontWeight={400} maxWidth='95%' overflow='hidden' variant='h3' whiteSpace='nowrap'>
          {name ?? account?.name ?? t('<unknown>')}
        </Typography>
        <Grid container item justifyContent='space-between'>
          {(formatted || address)
            ? <ShortAddress
              address={String(formatted) || address}
              clipped
              showCopy={showCopy}
              style={{ fontSize: '10px', fontWeight: 300, justifyContent: 'space-between', lineHeight: '23px' }}
            />
            : <Typography fontSize='10px' fontWeight={300} whiteSpace='nowrap'>
              {t('<unknown>')}
            </Typography>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
