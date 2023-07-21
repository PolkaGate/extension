// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, AddressInput, InputWithLabel } from '../../../components';
import { useTranslation } from '../../../components/translate';
import getAllAddresses from '../../../util/getAllAddresses';

interface Props {
  chain: Chain | null | undefined;
  address?: string | undefined;
  ignoreAddress: string | undefined;
  name?: string | undefined;
  setSubAddress: ((address: string | null | undefined, index: number | undefined) => void) | undefined;
  setSubName: ((subName: string | null | undefined, index: number | undefined) => void) | undefined;
  onRemove: (index: number | undefined) => void;
  index?: number;
  error?: boolean;
}

export default function SubIdForm({ address, chain, error = false, ignoreAddress, index, name, onRemove, setSubAddress, setSubName }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { hierarchy } = useContext(AccountContext);

  const allAddresses = getAllAddresses(hierarchy, true, true, chain?.ss58Format, ignoreAddress);

  const onNameChange = useCallback((value: string | null) => {
    setSubName && setSubName(value, index);
  }, [index, setSubName]);

  const onAddressChange = useCallback((value: string | null) => {
    setSubAddress && setSubAddress(value, index);
  }, [index, setSubAddress]);

  const onRemoveItem = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <Grid container gap='10px' item sx={{ border: '1px solid', borderColor: error ? 'warning.main' : 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px #0000001A', p: '12px', pt: 0 }}>
      <AddressInput
        address={address}
        allAddresses={allAddresses}
        chain={chain}
        label={t<string>('Account')}
        setAddress={onAddressChange}
        showIdenticon={false}
        style={{ m: '15px auto 0', width: '100%' }}
      />
      <InputWithLabel
        label={t<string>('Sub ID')}
        onChange={onNameChange}
        value={name}
      />
      <Grid container item justifyContent='flex-end' spacing='20px'>
        <Grid alignItems='center' container item onClick={onRemoveItem} sx={{ cursor: 'pointer' }} width='fit-content'>
          <Grid container item pr='5px' width='fit-content'>
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='25px'
              icon={faTrash}
            />
          </Grid>
          <Typography fontSize='16px' fontWeight={400} sx={{ textDecoration: 'underline' }}>
            {t<string>('Remove')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
