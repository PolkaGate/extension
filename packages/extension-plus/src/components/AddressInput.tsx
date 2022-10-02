// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { Chain } from '../../../extension-chains/src/types';

import { Autocomplete, FormControl, FormHelperText, Grid, InputLabel, Select, SelectChangeEvent, Skeleton, TextField } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import Identicon from '@polkadot/react-identicon';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, SettingsContext } from '../../../extension-ui/src/components/contexts';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import isValidAddress from '../util/validateAddress';

interface Props {
  chain: Chain;
  setSelectedAddress?: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedAddress: string | undefined;
  availableBalance?: Balance;
  setAvailableBalance?: React.Dispatch<React.SetStateAction<Balance | undefined>>;
  api: ApiPromise | undefined;
  text?: string | Element;
  freeSolo?: boolean;
  title?: string;
  disabled?: boolean;
  setIsValid?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface nameAddress {
  name?: string;
  address: string;
}

export default function AddressInput({ api, availableBalance, chain, disabled = false, setIsValid, freeSolo = false, selectedAddress, setAvailableBalance, setSelectedAddress, text, title = 'Account' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const settings = useContext(SettingsContext);
  const [allAddresesOnThisChain, setAllAddresesOnThisChain] = useState<nameAddress[]>([]);

  const decimals = api && api.registry.chainDecimals[0];

  const showAlladdressesOnThisChain = useCallback((prefix: number): void => {
    const allAddresesOnSameChain = accounts.map((acc): nameAddress => {
      const publicKey = decodeAddress(acc.address);

      return { address: encodeAddress(publicKey, prefix), name: acc?.name };
    });

    setAllAddresesOnThisChain(allAddresesOnSameChain);
  }, [accounts]);

  useEffect(() => {
    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

    if (prefix !== undefined) { showAlladdressesOnThisChain(prefix); }
  }, [chain, settings, showAlladdressesOnThisChain]);

  useEffect(() => {
    if (allAddresesOnThisChain.length && !freeSolo) { setSelectedAddress && setSelectedAddress(allAddresesOnThisChain[0].address); }
  }, [allAddresesOnThisChain, freeSolo, setSelectedAddress]);

  useEffect(() => {
    if (!selectedAddress || !setAvailableBalance || !api) { return; }

    setAvailableBalance(undefined);

    // eslint-disable-next-line no-void
    void api.derive.balances?.all(selectedAddress).then((b) => {
      setAvailableBalance(b?.availableBalance);
    });
  }, [api, selectedAddress, setAvailableBalance]);

  const handleAddressChange = useCallback((event: SelectChangeEvent) => setSelectedAddress && setSelectedAddress(event.target.value), [setSelectedAddress]);

  const handleAddress = useCallback((value: string | null) => {
    const indexOfDots = value?.indexOf(':');
    let mayBeAddress = value?.slice(indexOfDots + 1)?.trim();
    const isValid = isValidAddress(mayBeAddress);

    setIsValid && setIsValid(mayBeAddress ? isValid : true);
    mayBeAddress = isValid ? mayBeAddress : undefined;

    setSelectedAddress && setSelectedAddress(mayBeAddress);
  }, [setIsValid, setSelectedAddress]);

  const handleAutoComplateChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: string | null) => {
    setSelectedAddress && handleAddress(value);
  }, [handleAddress, setSelectedAddress]);

  const handleChange = useCallback((_event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = _event.target.value;

    setSelectedAddress && handleAddress(value);
  }, [handleAddress, setSelectedAddress]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement> | undefined) => {
    setSelectedAddress && handleAddress(event.target.value);
  }, [handleAddress, setSelectedAddress]);

  return (
    <Grid alignItems='center' container>
      <Grid item sx={{ paddingBottom: !freeSolo ? 2 : 0 }} xs={1}>
        {!!selectedAddress &&
          <Identicon
            prefix={chain?.ss58Format ?? 42}
            size={40}
            theme={chain?.icon || 'polkadot'}
            value={selectedAddress}
          />}
      </Grid>
      <Grid item xs={11}>
        {freeSolo
          ? <Autocomplete
            ListboxProps={{ sx: { fontSize: 12 } }}
            defaultValue={selectedAddress}
            disabled={disabled}
            freeSolo
            id='Select-account'
            onBlur={handleBlur}
            onChange={handleAutoComplateChange}
            options={allAddresesOnThisChain?.map((option) => `${option?.name} :    ${option.address}`)}
            // eslint-disable-next-line react/jsx-no-bind
            renderInput={(params) => <TextField {...params} error={!selectedAddress} label={title} onChange={handleChange} />}
            sx={{ '& .MuiAutocomplete-input, & .MuiInputLabel-root': { fontSize: 13 } }}
          />
          : <FormControl fullWidth>
            <InputLabel id='selec-address'>{title}</InputLabel>
            <Select
              label='Select address'
              native
              onChange={handleAddressChange}
              sx={{ fontSize: 12, height: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              value={selectedAddress}
            >
              {allAddresesOnThisChain?.map((a) => (
                // <MenuItem key={address} value={address}>
                //   <Grid container alignItems='center' justifyContent='space-between'>
                //     <Grid item>
                //       <Identicon
                //         size={25}
                //         theme={'polkadot'}
                //         value={address}
                //       />
                //     </Grid>
                //     <Grid item sx={{ fontSize: 13 }}>
                //       {address}
                //     </Grid>
                //   </Grid>
                // </MenuItem>
                <option
                  key={a.address}
                  style={{ fontSize: 13 }}
                  value={a.address}
                >
                  {a?.name} {':   '} {a.address}
                </option>

              ))}
            </Select>
          </FormControl>
        }
        <FormHelperText>
          <Grid container item justifyContent='space-between' xs={12}>
            <Grid item>
              {text}
            </Grid>
            {setAvailableBalance &&
              <Grid data-testid='balance' item>
                {t('Balance')}{': '}
                {availableBalance && decimals
                  ? `${availableBalance?.toHuman()}`
                  : <Skeleton sx={{ display: 'inline-block', fontWeight: '600', width: '50px' }} />
                }
              </Grid>
            }
          </Grid>
        </FormHelperText>
      </Grid>
    </Grid>
  );
}
