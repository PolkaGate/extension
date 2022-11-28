// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { ShortAddress } from '../../../../../../components';
import { useTranslation } from '../../../../../../hooks';
import { ThroughProxy } from '../../../../../../partials';
import { MyPoolInfo, TxInfo } from '../../../../../../util/types';

interface Props {
  txInfo: TxInfo;
  pool: MyPoolInfo;
}

export default function CreatePoolTxDetail({ pool, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = txInfo.api?.registry.chainTokens[0];

  return (
    <>
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t<string>('Account holder:')}
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
      {txInfo.throughProxy?.address &&
        <Grid container m='auto' maxWidth='92%'>
          <ThroughProxy address={txInfo.throughProxy?.address} chain={txInfo.chain} />
        </Grid>
      }
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t<string>('Pool:')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='80%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {pool.metadata}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t<string>('Staked:')}
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          {`${txInfo.amount} ${token}`}
        </Grid>
      </Grid>
    </>
  );
}
