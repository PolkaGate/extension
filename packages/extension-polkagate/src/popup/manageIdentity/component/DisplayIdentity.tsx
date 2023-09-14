// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-no-bind */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  address: string | undefined;
}

export default function DisplayIdentity ({ address, api, chain }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container item py='15px'>
      <Typography fontSize='16px' fontWeight={400}>
        {t<string>('Identity')}
      </Typography>
      <Grid container item sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', p: '8px 12px' }}>
        <Identity
          address={address}
          api={api}
          chain={chain}
          identiconSize={25}
          showSocial
          style={{ fontSize: '16px' }}
        />
      </Grid>
    </Grid>
  );
}
