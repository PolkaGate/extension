// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

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

export default function ManualLedgerImport({ address, accountIndex, addressOffset, genesisHash, ledgerLoading, name, ref, setAccountIndex, setAddressOffset }: Props): React.ReactElement {
  const { t } = useTranslation();

  const _onSetAccountIndex = useCallback((_value: number | string) => {
    const index = accOps.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAccountIndex(Number(index));
  }, [accOps]);

  const _onSetAddressOffset = useCallback((_value: number | string) => {
    const index = addOps.find(({ text, value }) => text === _value || value === _value)?.value || 0;

    setAddressOffset(Number(index));
  }, [addOps]);

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
      <Grid container ref={ref} sx={{ minHeight: '50px', maxHeight: '500px', overflowY: 'scroll', scrollbarWidth: 'thin', scrollBehavior: 'auto' }}>
        <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '15px' }}>
          <Address
            address={address}
            genesisHash={genesisHash}
            backgroundColor='background.main'
            margin='0px'
            name={name(accountIndex, addressOffset)}
            style={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </>
  )
}
