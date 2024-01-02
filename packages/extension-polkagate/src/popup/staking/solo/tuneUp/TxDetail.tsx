// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { ShortAddress } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import { TxInfo } from '../../../../util/types';

interface Props {
  txInfo: TxInfo;
}

export default function TxDetail({ txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t<string>('Account holder')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {txInfo.from.name}
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShortAddress address={txInfo.from.address} inParentheses style={{ fontSize: '16px' }} />
        </Grid>
      </Grid>
      {txInfo.throughProxy &&
        <Grid container m='auto' maxWidth='92%'>
          <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
        </Grid>
      }
    </>
  );
}
