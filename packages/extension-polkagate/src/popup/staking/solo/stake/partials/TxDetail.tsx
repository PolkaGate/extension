// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { ShortAddress } from '../../../../../components';
import { useAccountName, useTranslation } from '../../../../../hooks';
import { ThroughProxy } from '../../../../../partials';
import { SoloSettings, TxInfo } from '../../../../../util/types';

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
          {settings?.stashId !== settings?.controllerId ? t<string>('Stash account') : t<string>('Account holder')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {txInfo.from.name}
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShortAddress
            address={txInfo.from.address}
            style={{ fontSize: '16px' }}
            inParentheses
          />
        </Grid>
      </Grid>
      {txInfo.throughProxy &&
        <Grid container m='auto' maxWidth='92%'>
          <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} name={txInfo.throughProxy.name} />
        </Grid>
      }
      {settings?.controllerId && settings?.stashId !== settings?.controllerId &&
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Controller account')}:
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
            {controllerName || t('Unknown')}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShortAddress
              address={settings?.controllerId}
              style={{ fontSize: '16px' }}
              inParentheses
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
          {t<string>('Staked')}:
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          {`${txInfo.amount} ${token}`}
        </Grid>
      </Grid>
    </>
  );
}
