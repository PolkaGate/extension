// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { Identicon, ShortAddress } from '../../../../../components';
import { useAccountName, useTranslation } from '../../../../../hooks';
import { getSubstrateAddress } from '../../../../../util/utils';

interface Props {
  roleTitle: string;
  roleAddress: string;
  showDivider?: boolean;
  chain: Chain | undefined;
}

export default function ShowPoolRole({ chain, roleAddress, roleTitle, showDivider }: Props) {
  const { t } = useTranslation();

  const roleName = useAccountName(getSubstrateAddress(roleAddress)) ?? t<string>('Unknown');

  return (
    <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
      <Grid item>
        <Typography fontSize='16px' fontWeight={300} lineHeight='23px'>
          {roleTitle}
        </Typography>
      </Grid>
      {roleAddress
        ? <Grid container direction='row' item justifyContent='center'>
          <Grid alignItems='center' container item width='fit-content'>
            <Identicon
              iconTheme={chain?.icon ?? 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={25}
              value={roleAddress}
            />
          </Grid>
          <Grid alignItems='center' container fontSize='28px' fontWeight={400} item maxWidth='55%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap' width='fit-content'>
            {roleName}
          </Grid>
          <Grid alignItems='center' container item pl='5px' width='fit-content'>
            <ShortAddress address={roleAddress} charsCount={4} inParentheses />
          </Grid>
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
