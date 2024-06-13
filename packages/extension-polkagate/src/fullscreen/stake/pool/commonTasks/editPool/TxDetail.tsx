// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { ShortAddress } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';
import { ThroughProxy } from '../../../../../partials';
import type { TxInfo } from '../../../../../util/types';
import { ChangesProps } from '.';

interface Props {
  txInfo: TxInfo;
  changes: ChangesProps | undefined;
}

export default function TxDetail({ changes, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  const changedRoles = useMemo(() => {
    const _changes: { caption: string, value: number | string | null }[] = [];

    if (changes?.newRoles !== undefined && !Object.values(changes.newRoles).every((value) => value === undefined)) {
      changes.newRoles.newBouncer !== undefined && _changes.push({ caption: 'Bouncer', value: changes.newRoles.newBouncer });
      changes.newRoles.newNominator !== undefined && _changes.push({ caption: 'Nominator', value: changes.newRoles.newNominator });
      changes.newRoles.newRoot !== undefined && _changes.push({ caption: 'Root', value: changes.newRoles.newRoot });
    }

    return _changes;
  }, [changes?.newRoles]);

  const changedCommission = useMemo(() => {
    const _changes: { caption: string, value: number | string | null }[] = [];

    if (changes?.commission !== undefined && (changes.commission.value !== undefined || changes.commission.payee)) {
      changes.commission.value !== undefined && _changes.push({ caption: 'Commission value', value: changes.commission.value });
      changes.commission.payee !== undefined && _changes.push({ caption: 'Commission payee', value: changes.commission.payee });
    }

    return _changes;
  }, [changes?.commission]);

  const DisplayInfo = ({ caption, showDivider = true, value }: { caption: string, value: string | number, showDivider?: boolean }) => {
    return (
      <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
        <Grid container item width='fit-content'>
          <Typography lineHeight='40px' pr='5px'>{caption}:</Typography>
          <Typography lineHeight='40px'>{value}</Typography>
        </Grid>
        {showDivider &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
          </Grid>}
      </Grid>
    );
  };

  return (
    <>
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Account holder:')}
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
          <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
        </Grid>
      }
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
      {changes?.newPoolName !== undefined &&
        <DisplayInfo
          caption={t('Pool name')}
          value={changes?.newPoolName ?? 'Unknown'}
        />
      }
      {changedRoles.length > 0 && changedRoles.map(({ caption, value }, index) =>
        <DisplayInfo
          caption={caption}
          key={index}
          value={value ? `${String(value).slice(0, 4)} ... ${String(value).slice(-4)}` : t('Removed')}
        />
      )}
      {changedCommission.length > 0 && changedCommission.map(({ caption, value }, index) =>
        <DisplayInfo
          caption={caption}
          key={index}
          value={typeof (value) === 'string'
            ? value.length > 10
              ? `${String(value).slice(0, 4)} ... ${String(value).slice(-4)}`
              : value
            : value ?? t('Removed')
          }
        />
      )}
    </>
  );
}
