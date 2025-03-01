// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../../../util/types';
import type { ChangesProps } from '.';

import { Divider } from '@mui/material';
import React, { useMemo } from 'react';

import { AccountWithProxyInConfirmation, DisplayInfo } from '../../../../../components';
import { useTranslation } from '../../../../../hooks';

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

  return (
    <>
      <AccountWithProxyInConfirmation
        txInfo={txInfo}
      />
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
            : value as unknown as string ?? t('Removed')
          }
        />
      )}
    </>
  );
}
