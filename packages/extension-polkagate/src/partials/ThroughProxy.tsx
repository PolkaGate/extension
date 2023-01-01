// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { Identicon, ShortAddress } from '../components';
import { useAccountName, useChain, useTranslation } from '../hooks';

interface Props {
  address: string;
  chain: Chain | null;
  style?: SxProps<Theme> | undefined;
}

function ThroughProxy({ address, chain, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const name = useAccountName(address);

  return (
    <Grid alignItems='center' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em', ...style }}>
      <Grid item sx={{ fontSize: '12px' }} xs={2}>
        {t('Through')}
      </Grid>
      <Divider
        orientation='vertical'
        sx={{
          bgcolor: 'secondary.main',
          height: '27px',
          mb: '1px',
          mt: '4px',
          width: '1px'
        }}
      />
      <Grid alignItems='center' container item justifyContent='center' sx={{ maxWidth: '65%', px: '2px', width: 'fit-content' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ lineHeight: '28px', px: '3px' }}>
          {chain &&
            <Grid item>
              <Identicon
                iconTheme={chain?.icon || 'polkadot'}
                prefix={chain?.ss58Format ?? 42}
                size={25}
                value={address}
              />
            </Grid>
          }
          <Grid container item justifyContent='flex-start' sx={{ display: 'block', fontSize: '16px', fontWeight: 400, maxWidth: '80%', overflow: 'hidden', pl: '7px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content' }}>
            <Grid item overflow='hidden' sx={{ lineHeight: '16px' }} textOverflow='ellipsis' whiteSpace='nowrap'>
              {name}
            </Grid>
            <Grid item sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '12px', width: 'fit-content' }}>
              <ShortAddress address={address} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider
        orientation='vertical'
        sx={{
          bgcolor: 'secondary.main',
          height: '27px',
          mb: '1px',
          mt: '4px',
          width: '1px'
        }}
      />
      <Grid item sx={{ fontSize: '12px', fontWeight: 300, textAlign: 'center' }} xs={2} >
        {t('as proxy')}
      </Grid>
    </Grid>
  );
}

export default React.memo(ThroughProxy);
