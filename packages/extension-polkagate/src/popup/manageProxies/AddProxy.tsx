// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, AddressInput, InputWithLabel, PButton, Select, Warning } from '../../components';
import { useFormatted, useTranslation } from '../../hooks';
import { CHAIN_PROXY_TYPES } from '../../util/constants';
import getAllAddresses from '../../util/getAllAddresses';
import { Proxy, ProxyItem } from '../../util/types';
import { sanitizeChainName } from '../../util/utils';
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
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);
  const formatted = useFormatted(address);
  const theme = useTheme();

  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [selectedProxyType, setSelectedProxyType] = useState<string | null>('Any');
  const [delay, setDelay] = useState<number>(0);
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | undefined | null>();
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(true);

  const myselfAsProxy = useMemo(() => formatted === realAddress, [formatted, realAddress]);
  const possibleProxy = useMemo(() => ({ delay, delegate: realAddress, proxyType: selectedProxyType }) as Proxy, [delay, realAddress, selectedProxyType]);
  const alreadyExisting = useMemo(() => !!(proxyItems?.find((item) => isEqualProxy(item.proxy, possibleProxy))), [possibleProxy, proxyItems]);

  const PROXY_TYPE = CHAIN_PROXY_TYPES[sanitizeChainName(chain.name) as keyof typeof CHAIN_PROXY_TYPES];

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
    if (!realAddress || !selectedProxyType || myselfAsProxy) {
      setAddButtonDisabled(true);
      setAccountInfo(undefined);

      return;
    }

    if (alreadyExisting) {
      setAddButtonDisabled(true);

      return;
    }

    setAddButtonDisabled(false);
  }, [alreadyExisting, myselfAsProxy, realAddress, selectedProxyType]);

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
      {realAddress && !(myselfAsProxy || alreadyExisting) &&
        <ShowIdentity
          accountIdentity={accountInfo}
          style={{ m: 'auto', width: '92%' }}
        />
      }
      {realAddress && (myselfAsProxy || alreadyExisting) &&
        <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0, pl: '5px' }, '> div.belowInput .warningImage': { fontSize: '20px' }, height: '45px', pt: '20px' }}>
          <Warning
            fontSize={'15px'}
            fontWeight={400}
            isBelowInput
            isDanger
            theme={theme}
          >
            {myselfAsProxy
              ? t<string>('Cannot set your account as a proxy for itself.')
              : t<string>('You\'ve already included this proxy.')}
          </Warning>
        </Grid>
      }
      <PButton
        _onClick={_addProxy}
        disabled={addButtonDisabled}
        text={t<string>('Add')}
      />
    </>
  );
}
