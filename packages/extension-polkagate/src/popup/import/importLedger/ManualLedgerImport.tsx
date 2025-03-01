// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { Address, Select } from '../../../components';
import { useTranslation } from '../../../hooks';
import { accOps, addOps, hideAddressAnimation, showAddressAnimation } from './partials';

interface Props {
  accountIndex: number;
  address: string | null;
  addressOffset: number;
  genesisHash: string | undefined;
  ledgerLoading: boolean;
  name: (index: number, offset?: number) => string;
  ref: React.MutableRefObject<null>;
  setAccountIndex: React.Dispatch<React.SetStateAction<number>>;
  setAddressOffset: React.Dispatch<React.SetStateAction<number>>;
}

export default function ManualLedgerImport({ accountIndex, address, addressOffset, genesisHash, ledgerLoading, name, ref, setAccountIndex, setAddressOffset }: Props): React.ReactElement {
  const { t } = useTranslation();

  const _onSetAccountIndex = useCallback((_value: number | string) => {
    const index = accOps.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAccountIndex(Number(index));
  }, [setAccountIndex]);

  const _onSetAddressOffset = useCallback((_value: number | string) => {
    const offset = addOps.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAddressOffset(Number(offset));
  }, [setAddressOffset]);

  return (
    <>
      <Grid container item justifyContent='space-between' mt='15px'>
        <Grid item md={5.5} xs={12}>
          <Select
            defaultValue={accOps[0].value}
            isDisabled={ledgerLoading}
            label={t('Account index')}
            onChange={_onSetAccountIndex}
            options={accOps}
            value={accountIndex}
          />
        </Grid>
        <Grid item md={5.5} xs={12}>
          <Select
            defaultValue={addOps[0].value}
            isDisabled={ledgerLoading}
            label={t('Address offset')}
            onChange={_onSetAddressOffset}
            options={addOps}
            value={addressOffset}
          />
        </Grid>
      </Grid>
      <Grid container ref={ref} sx={{ maxHeight: '500px', minHeight: '50px', overflowY: 'scroll', scrollBehavior: 'auto', scrollbarWidth: 'thin' }}>
        <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
          <Address
            address={address}
            backgroundColor='background.main'
            genesisHash={genesisHash}
            margin='0px'
            name={name(accountIndex, addressOffset)}
            style={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </>
  );
}
