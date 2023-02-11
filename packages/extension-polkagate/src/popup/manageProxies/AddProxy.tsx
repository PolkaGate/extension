// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, AddressInput, InputWithLabel, PButton, Select } from '../../components';
import { useTranslation } from '../../hooks';
import { CHAIN_PROXY_TYPES } from '../../util/constants';
import getAllAddresses from '../../util/getAllAddresses';
import { Proxy, ProxyItem } from '../../util/types';
import ShowIdentity from './partials/ShowIdentity';

interface Props {
  address: string;
  api: ApiPromise;
  showAddProxy: boolean;
  setShowAddProxy: React.Dispatch<React.SetStateAction<boolean>>;
  chain: Chain;
  proxyItems: ProxyItem[];
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | undefined>>;
  onChange: () => void;
}

interface DropdownOption {
  text: string;
  value: string;
}

const isEqualProxy = (a: Proxy, b: Proxy) => {
  return a.delay === b.delay && a.delegate === b.delegate && a.proxyType === b.proxyType;
};

export default function AddProxy({ address, api, chain, onChange, proxyItems, setProxyItems, setShowAddProxy, showAddProxy }: Props): React.ReactElement {
  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [selectedProxyType, setSelectedProxyType] = useState<string | null>('Any');
  const [delay, setDelay] = useState<number>(0);
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | undefined | null>();
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(true);
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);

  const PROXY_TYPE = CHAIN_PROXY_TYPES[chain.name.replace(' Relay Chain', '').replace(' Network', '')] as string[];

  const proxyTypeOptions = PROXY_TYPE.map((type: string): DropdownOption => ({
    text: type,
    value: type
  }));

  const allAddresses = getAllAddresses(hierarchy, true, true, chain.ss58Format, address);

  const _addProxy = useCallback(() => {
    const proxy = { delay, delegate: realAddress, proxyType: selectedProxyType } as Proxy;

    setProxyItems([{ proxy, status: 'new' }, ...proxyItems]);
    setShowAddProxy(!showAddProxy);
    onChange();
  }, [delay, onChange, proxyItems, realAddress, selectedProxyType, setProxyItems, setShowAddProxy, showAddProxy]);

  const _selectProxyType = useCallback((type: string | number): void => {
    setSelectedProxyType(type as string);
  }, []);

  const _selectDelay = useCallback((value: string): void => {
    const nDelay = value ? parseInt(value.replace(/\D+/g, ''), 10) : 0;

    setDelay(nDelay);
  }, []);

  useEffect(() => {
    if (!realAddress || !selectedProxyType) {
      setAddButtonDisabled(true);
      setAccountInfo(undefined);

      return;
    }

    const possibleProxy = { delay, delegate: realAddress, proxyType: selectedProxyType } as Proxy;
    const alreadyExisting = proxyItems?.find((item) => isEqualProxy(item.proxy, possibleProxy));

    if (alreadyExisting) {
      setAddButtonDisabled(true);

      return;
    }

    setAddButtonDisabled(false);
  }, [delay, proxyItems, realAddress, selectedProxyType]);

  useEffect(() => {
    realAddress && api && api.derive.accounts.info(realAddress).then((info) => {
      if (info.identity.display) {
        setAccountInfo(info.identity);
      } else {
        setAccountInfo(null);
      }
    });
  }, [api, realAddress]);

  return (
    <>
      <Typography fontSize='14px' fontWeight={300} m='20px auto 15px' textAlign='left' width='90%'>
        {t<string>("You can add an account included in this extension as a proxy of Alice to sign certain types of transactions on Alice's behalf.")}
      </Typography>
      <AddressInput
        address={realAddress}
        allAddresses={allAddresses}
        chain={chain}
        helperText={t<string>('The account address which will be a proxy account')}
        label='Account ID'
        setAddress={setRealAddress}
        showIdenticon
        style={{
          m: '12px auto',
          width: '92%'
        }}
      />
      <Grid sx={{ m: 'auto', width: '92%' }}>
        <Select
          defaultValue={proxyTypeOptions[0].value}
          helperText={t<string>('The permissions allowed for this proxy account')}
          label={t<string>('Proxy type')}
          onChange={_selectProxyType}
          options={proxyTypeOptions}
          value={selectedProxyType || proxyTypeOptions[0].value}
        />
      </Grid>
      <Grid alignItems='end' container sx={{ m: '15px auto', width: '92%' }}>
        <Grid item xs={4}>
          <InputWithLabel
            helperText={t<string>('The announcement period required of the initial proxy. Generally will be zero.')}
            label={t<string>('Delay')}
            onChange={_selectDelay}
            value={delay}
          />
        </Grid>
        <Typography fontSize='16px' fontWeight={300} pb='4px' pl='10px'>
          {t<string>('Block(s)')}
        </Typography>
      </Grid>
      {realAddress &&
        <ShowIdentity
          accountIdentity={accountInfo}
          style={{ m: 'auto', width: '92%' }}
        />
      }
      <PButton
        _onClick={_addProxy}
        disabled={addButtonDisabled}
        text={t<string>('Add')}
      />
    </>
  );
}
