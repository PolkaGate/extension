// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useTranslation } from '../hooks';
import Identicon from './Identicon';

interface Props {
  address: string;
  chain?: Chain;
  name: string;
  style?: SxProps<Theme>;
}

export default function Identity({ address, chain, name, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <Grid
      alignItems='center'
      container
      justifyContent='center'
      sx={{ ...style }}
    >
      <Grid
        item
        pr='8px'
      >
        <Identicon
          iconTheme={chain?.icon || 'polkadot'}
          prefix={chain?.ss58Format ?? 42}
          size={40}
          value={address}
        />
      </Grid>
      <Grid
        item
        maxWidth='82%'
      >
        <Typography
          fontSize='28px'
          fontWeight={400}
          overflow='hidden'
          textOverflow='ellipsis'
        >
          {name || t<string>('unknown')}
        </Typography>
      </Grid>
    </Grid>
  );
}
