// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Chain } from '@polkadot/extension-chains/types';

import { Divider, Grid } from '@mui/material';
import React, { } from 'react';

import { Identity, ShortAddress } from '../../components';

interface Props { chain: Chain | null, identiconSize?: number, mb?: number, noDivider?: boolean, pt1?: number, pt2?: number, fontSize1?: number, label: string, formatted: string | undefined }

export function To({ chain, fontSize1 = 28, formatted, identiconSize = 31, label, mb = 10, noDivider, pt1 = 0, pt2 = 5 }: Props): React.ReactElement<Props> {
  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em' }}>
      <Grid item sx={{ fontSize: '16px', pt: `${pt1}px` }}>
        {label}
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' sx={{ maxWidth: '85%', lineHeight: `${identiconSize}px`, pt: `${pt2}px`, width: '90%' }}>
        <Identity
          chain={chain as any}
          formatted={formatted}
          identiconSize={identiconSize}
          showSocial={false}
          style={{ fontSize: `${fontSize1}px` }}
        />
        <ShortAddress address={formatted} />
      </Grid>
      {!noDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mb: `${mb}px`, mt: '5px', width: '240px' }} />
      }
    </Grid>
  );
}
