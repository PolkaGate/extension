// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../util/types';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { useTranslation } from '../hooks';
import { ThroughProxy } from '../partials';
import { ShortAddress } from '.';

interface Props {
  txInfo: TxInfo;
  label?: string;
}

export default function AccountWithProxyInConfirmation({ label, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {label || t('Account')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {txInfo.from.name}
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShortAddress
            address={txInfo.from.address}
            inParentheses
            style={{ fontSize: '16px' }}
          />
        </Grid>
      </Grid>
      {txInfo.throughProxy &&
        <Grid container m='auto' maxWidth='92%'>
          <ThroughProxy
            address={txInfo.throughProxy.address}
            chain={txInfo.chain}
          />
        </Grid>
      }
    </>
  );
}
