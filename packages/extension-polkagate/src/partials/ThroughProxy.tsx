// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';

import { Divider, Grid, type SxProps, type Theme } from '@mui/material';
import { Identity } from '../components';
import React from 'react';
import { useApi, useTranslation } from '../hooks';

interface Props {
  address: string;
  chain: Chain | null;
  style?: SxProps<Theme> | undefined;
  showDivider?: boolean;
}

function ThroughProxy({ address, chain, style = {}, showDivider = true }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);

  return (
    <Grid alignItems='center' container justifyContent='center' sx={{ fontWeight: 300, letterSpacing: '-0.015em', ...style }}>
      <Grid item sx={{ fontSize: '12px', mr: '5px' }}>
        {t('Through')}
      </Grid>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.main', height: '27px', mb: '1px', mt: '4px', width: '1px' }} />
      <Identity
        address={address}
        api={api}
        chain={chain as any}
        identiconSize={28}
        showSocial={false}
        // subIdOnly
        style={{ fontSize: '22px', maxWidth: '65%', px: '8px', width: 'fit-content' }}
        withShortAddress
      />
      {showDivider &&
        <Divider orientation='vertical' sx={{ bgcolor: 'secondary.main', height: '27px', mb: '1px', mt: '4px', width: '1px' }} />
      }      <Grid item sx={{ fontSize: '12px', fontWeight: 300, textAlign: 'center', ml: '5px' }}>
        {t('as proxy')}
      </Grid>
    </Grid>
  );
}

export default React.memo(ThroughProxy);
