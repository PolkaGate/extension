// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { ShortAddress } from '../../../../../components';
import { useAccountName, useTranslation } from '../../../../../hooks';
import { ThroughProxy } from '../../../../../partials';
import type { SoloSettings, TxInfo } from '../../../../../util/types';

interface Props {
  txInfo: TxInfo;
  settings?: SoloSettings
}

export default function TxDetail({ settings, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const controllerName = useAccountName(settings?.controllerId);
  const token = txInfo.api?.registry.chainTokens[0];

  return (
    <>
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {settings?.stashId !== settings?.controllerId ? t('Stash account') : t('Account holder')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
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
          <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
        </Grid>
      }
      {settings?.controllerId && settings?.stashId !== settings?.controllerId &&
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Controller account')}:
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
            {controllerName || t('Unknown')}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShortAddress
              address={settings?.controllerId}
              inParentheses
              style={{ fontSize: '16px' }}
            />
          </Grid>
        </Grid>
      }
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
        <Typography
          fontSize='16px'
          fontWeight={400}
          lineHeight='23px'
        >
          {t('Staked')}:
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          {`${txInfo.amount} ${token}`}
        </Grid>
      </Grid>
    </>
  );
}
