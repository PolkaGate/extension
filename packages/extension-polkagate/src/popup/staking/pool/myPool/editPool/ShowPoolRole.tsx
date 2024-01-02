// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { Identity } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';

interface Props {
  roleTitle: string;
  roleAddress: string;
  showDivider?: boolean;
  chain: Chain | undefined;
}

export default function ShowPoolRole({ chain, roleAddress, roleTitle, showDivider }: Props) {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
      <Grid item>
        <Typography fontSize='16px' fontWeight={300} lineHeight='23px'>
          {roleTitle}
        </Typography>
      </Grid>
      {roleAddress
        ? <Grid container direction='row' item justifyContent='center'>
          <Identity
            chain={chain}
            direction='row'
            formatted={roleAddress}
            identiconSize={25}
            showSocial={false}
            style={{ maxWidth: '100%', width: 'fit-content' }}
            withShortAddress
          />
        </Grid>
        : <Typography fontSize='20px' fontWeight={300} lineHeight='23px'>
          {t<string>('To be Removed')}
        </Typography>
      }
      {showDivider &&
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
      }
    </Grid>
  );
};
