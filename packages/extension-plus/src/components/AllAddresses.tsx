// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import { Autocomplete, FormControl, FormHelperText, Grid, InputLabel, Select, SelectChangeEvent, Skeleton, TextField } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import Identicon from '@polkadot/react-identicon';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Chain } from '../../../extension-chains/src/types';
import { AccountContext, SettingsContext } from '../../../extension-ui/src/components/contexts';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { ChainInfo } from '../util/plusTypes';
import { amountToHuman } from '../util/plusUtils';

interface Props {
  chain: Chain;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
  selectedAddress: string;
  availableBalance?: string;
  setAvailableBalance?: React.Dispatch<React.SetStateAction<string>>;
  chainInfo?: ChainInfo;
  text?: string | Element;
  freeSolo?: boolean;
  title?: string;
}

interface nameAddress {
  name?: string;
  address: string;
}

export default function AllAddresses({ availableBalance, chain, chainInfo, freeSolo = false, selectedAddress, setAvailableBalance, setSelectedAddress, text, title = 'Account' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const settings = useContext(SettingsContext);
  const [allAddresesOnThisChain, setAllAddresesOnThisChain] = useState<nameAddress[]>([]);

  function showAlladdressesOnThisChain(prefix: number): void {
    const allAddresesOnSameChain = accounts.map((acc): nameAddress => {
      const publicKey = decodeAddress(acc.address);

      return { name: acc?.name, address: encodeAddress(publicKey, prefix) };
    });

    setAllAddresesOnThisChain(allAddresesOnSameChain);
  }

  useEffect(() => {
    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

    if (prefix !== undefined) { showAlladdressesOnThisChain(prefix); }
  }, [chain, settings]);

  useEffect(() => {
    if (allAddresesOnThisChain.length && !freeSolo) { setSelectedAddress(allAddresesOnThisChain[0].address); }
  }, [allAddresesOnThisChain]);

  useEffect(() => {
    if (!selectedAddress || !setAvailableBalance || !chainInfo) return;

    setAvailableBalance('');

    // eslint-disable-next-line no-void
    void chainInfo?.api.derive.balances?.all(selectedAddress).then((b) => {
      setAvailableBalance(b?.availableBalance.toString());
    });
  }, [chainInfo, selectedAddress, setAvailableBalance]);

  const handleAddressChange = (event: SelectChangeEvent) => setSelectedAddress(event.target.value);

  const handleChange = (_event: React.SyntheticEvent<Element, Event>, value: string | null) => {
    const indexOfDots = value?.indexOf(':');

    setSelectedAddress(value?.slice(indexOfDots + 1).trim());
  };

  const handleBlur = (event: React.FocusEventHandler<HTMLDivElement> | undefined) => {
    const value = event.target.value
    const indexOfDots = value?.indexOf(':');
    setSelectedAddress(value?.slice(indexOfDots + 1).trim());
  };

  return (
    <Grid alignItems='center' container sx={{ padding: '20px 40px 0px' }}>
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
            freeSolo
            id='Select-account'
            onBlur={handleBlur}
            onChange={handleChange}
            options={allAddresesOnThisChain?.map((option) => `${option?.name} :    ${option.address}`)}
            renderInput={(params) => <TextField {...params} label={title} />}
            sx={{ '& .MuiAutocomplete-input, & .MuiInputLabel-root': { fontSize: 12 } }}
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
                {availableBalance
                  ? `${amountToHuman(availableBalance, chainInfo?.decimals)}  ${chainInfo?.coin}`
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
