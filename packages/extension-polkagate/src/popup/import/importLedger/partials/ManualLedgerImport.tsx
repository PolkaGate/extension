// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Hashtag } from 'iconsax-react';
import React, { useCallback } from 'react';

import { Address, DropSelect } from '../../../../components';
import { useTranslation } from '../../../../hooks';
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
  style?: React.CSSProperties;
}

export default function ManualLedgerImport({ accountIndex, address, addressOffset, genesisHash, ledgerLoading, name, ref, setAccountIndex, setAddressOffset, style }: Props): React.ReactElement {
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
    <Grid container item sx={{ mt: '15px', ...style }}>
      <Grid container item justifyContent='space-between'>
        <Grid item md={5.5} xs={12}>
          <Typography color='#EAEBF1' variant='B-1'>
            {t('Account index')}
          </Typography>
          <DropSelect
            Icon={Hashtag}
            defaultValue={accOps[0].value}
            disabled={ledgerLoading}
            displayContentType='icon'
            onChange={_onSetAccountIndex}
            options={accOps}
            style={{ marginTop: '3px' }}
            value={accountIndex}
          />
        </Grid>
        <Grid item md={5.5} xs={12}>
          <Typography color='#EAEBF1' variant='B-1'>
            {t('Address offset')}
          </Typography>
          <DropSelect
            Icon={Hashtag}
            defaultValue={addOps[0].value}
            disabled={ledgerLoading}
            displayContentType='icon'
            onChange={_onSetAddressOffset}
            options={addOps}
            style={{ marginTop: '3px' }}
            value={addressOffset}
          />
        </Grid>
      </Grid>
      <Grid container ref={ref} sx={{ maxHeight: '500px', minHeight: '50px', overflowY: 'auto', scrollBehavior: 'auto', scrollbarWidth: 'thin' }}>
        <Grid container display={address ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: address ? '300ms' : '150ms', animationFillMode: 'forwards', animationName: `${address ? showAddressAnimation : hideAddressAnimation}`, animationTimingFunction: 'linear', mt: '20px' }}>
          <Address
            address={address}
            genesisHash={genesisHash}
            margin='0px'
            name={name(accountIndex, addressOffset)}
            style={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
