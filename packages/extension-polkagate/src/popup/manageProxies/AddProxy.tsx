// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, InputWithLabel, InputWithLabelAndIdenticon, PButton, Select, ShowIdentity } from '../../components';
import { useTranslation } from '../../hooks';
import { CHAIN_PROXY_TYPES } from '../../util/constants';
import getAllAddressess from '../../util/getAllAddresses';
import { Proxy, ProxyItem } from '../../util/types';

interface Props {
  address: string;
  api: ApiPromise;
  showAddProxy: boolean;
  setShowAddProxy: React.Dispatch<React.SetStateAction<boolean>>;
  chain: Chain;
  proxyItems: ProxyItem[];
  setProxyItems: React.Dispatch<React.SetStateAction<ProxyItem[] | undefined>>
}

interface DropdownOption {
  text: string;
  value: string;
}

const isEqualProxiy = (a: Proxy, b: Proxy) => {
  return a.delay === b.delay && a.delegate === b.delegate && a.proxyType === b.proxyType;
};

export default function AddProxy({ address, api, chain, proxyItems, setProxyItems, setShowAddProxy, showAddProxy }: Props): React.ReactElement {
  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [selectedProxyType, setSelectedProxyType] = useState<string | null>(null);
  const [delay, setDelay] = useState<number>(0);
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | undefined | null>();
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(true);
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);

  const PROXY_TYPE = CHAIN_PROXY_TYPES[chain.name.replace(' Relay Chain', '')] as string[];

  const proxyTypeOptions = PROXY_TYPE.map((type: string): DropdownOption => ({
    text: type,
    value: type
  }));

  const allAddresses = getAllAddressess(hierarchy, true, true, chain.ss58Format, address);

  const _addProxy = useCallback(() => {
    const proxy = { delay, delegate: realAddress, proxyType: selectedProxyType } as Proxy;

    proxyItems?.push({ proxy, status: 'new' });
    setProxyItems(proxyItems);
    setShowAddProxy(!showAddProxy);
  }, [delay, proxyItems, realAddress, selectedProxyType, setProxyItems, setShowAddProxy, showAddProxy]);

  const _selectProxyType = useCallback((type: string | number): void => {
    setSelectedProxyType(type as string);
  }, []);

  const _selectDelay = useCallback((value: string): void => {
    const nDelay = value ? parseInt(value.replace(/\D+/g, ''), 10) : 0;

    setDelay(nDelay);
  }, []);

  useEffect(() => {
    if (!realAddress || !selectedProxyType) {
      return;
    }

    const possibleProxy = { delay, delegate: realAddress, proxyType: selectedProxyType } as Proxy;
    const alreadyExisting = proxyItems?.find((item) => isEqualProxiy(item.proxy, possibleProxy));

    if (alreadyExisting) {
      setAddButtonDisabled(true);

      return;
    }

    setAddButtonDisabled(false);
  }, [delay, proxyItems, realAddress, selectedProxyType]);

  useEffect(() => {
    realAddress && api && api.derive.accounts.info(realAddress).then((info) => {
      if (info.identity.display) {
        console.log('infooooooo:', info);

        setAccountInfo(info.identity);
      } else {
        setAccountInfo(null);
      }
    });
  }, [api, realAddress]);

  return (
    <>
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='20px auto 15px'
        textAlign='left'
        width='90%'
      >
        {t<string>("You can add an account included in this extension as a proxy of Alice to sign certain types of transactions on Alice's behalf.")}
      </Typography>
      <InputWithLabelAndIdenticon
        address={realAddress}
        allAddresses={allAddresses}
        chain={chain}
        helperText='TODO'
        label='Account ID'
        setAddress={setRealAddress}
        showIdenticon
        style={{
          m: '12px auto',
          width: '92%'
        }}
      />
      <Grid
        sx={{
          m: 'auto',
          width: '92%'
        }}
      >
        <Select
          helperText={t<string>('TODO')}
          label={t<string>('Proxy type')}
          onChange={_selectProxyType}
          options={proxyTypeOptions}
        />
      </Grid>
      <Grid
        alignItems='end'
        container
        sx={{
          m: '15px auto',
          width: '92%'
        }}
      >
        <Grid
          item
          xs={4}
        >
          <InputWithLabel
            helperText={t<string>('TODO')}
            label={t<string>('Delay')}
            onChange={_selectDelay}
            value={delay}
          />
        </Grid>
        <Typography
          fontSize='16px'
          fontWeight={300}
          pb='4px'
          pl='10px'
        >
          {t<string>('Block(s)')}
        </Typography>
      </Grid>
      {accountInfo !== undefined &&
        <ShowIdentity
          accountIdentity={accountInfo}
          style={{
            m: 'auto',
            width: '92%'
          }}
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
