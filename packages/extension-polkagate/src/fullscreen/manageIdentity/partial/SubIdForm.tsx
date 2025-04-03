// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';


import { InputWithLabel } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { truncString32Bytes } from '../../../util/utils';
import SubIdInput from '../component/SubIdInput';

interface Props {
  api: ApiPromise | undefined
  chain: Chain | null | undefined;
  address?: string | undefined;
  addressesToSelect: string[];
  name?: string | undefined;
  setSubAddress: ((address: string | null | undefined, index: number | undefined) => void) | undefined;
  setSubName: ((subName: string | null | undefined, index: number | undefined) => void) | undefined;
  onRemove: (index: number | undefined) => void;
  index?: number;
  error?: boolean;
}

export default function SubIdForm({ address, addressesToSelect, api, chain, error = false, index, name, onRemove, setSubAddress, setSubName }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const onNameChange = useCallback((value: string | null) => {
    setSubName && setSubName(truncString32Bytes(value), index);
  }, [index, setSubName]);

  const onAddressChange = useCallback((value: string | null) => {
    setSubAddress && setSubAddress(value, index);
  }, [index, setSubAddress]);

  const onRemoveItem = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <Grid container gap='10px' item sx={{ bgcolor: 'background.paper', border: `${error ? 3 : 1}px solid`, borderColor: error ? 'warning.main' : 'secondary.light', borderRadius: '2px', boxShadow: '2px 3px 4px 0px #0000001A', p: '12px' }}>
      <SubIdInput
        address={address}
        api={api}
        chain={chain as any}
        disabled={false}
        label={t('Account')}
        selectableAddresses={addressesToSelect}
        setAddress={onAddressChange}
      />
      <InputWithLabel
        label={t('Sub ID')}
        onChange={onNameChange}
        value={name ?? ''}
      />
      <Grid container item justifyContent='flex-end' spacing='20px'>
        <Grid alignItems='center' container item onClick={onRemoveItem} sx={{ cursor: 'pointer' }} width='fit-content'>
          <Grid container item pr='5px' width='fit-content'>
            <FontAwesomeIcon
              color={theme.palette.secondary.main}
              fontSize='25px'
              icon={faTrash}
            />
          </Grid>
          <Typography fontSize='16px' fontWeight={400} sx={{ textDecoration: 'underline' }}>
            {t('Remove')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
