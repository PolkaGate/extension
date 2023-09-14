// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ActionContext, AddressInput, PButton, ProxyTable, SelectChain } from '../../../components';
import { useApiWithChain, useGenesisHashOptions, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata } from '../../../messaging';
import { HeaderBrand, Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import { Proxy, ProxyItem } from '../../../util/types';

export default function AddProxy(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [chain, setChain] = useState<Chain>();
  const [name, setName] = useState<string | null | undefined>();
  const [proxies, setProxies] = useState<ProxyItem[] | undefined>();
  const api = useApiWithChain(chain);
  const genesisOptions = useGenesisHashOptions();

  const disabledItems = useMemo(() => (['Allow use on any chain']), []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    (!realAddress || !chain) && setProxies(undefined);
  }, [realAddress, chain]);

  useEffect(() => {
    realAddress && api && api.query.proxy?.proxies(realAddress).then((proxies) => {
      const fetchedProxyItems = (JSON.parse(JSON.stringify(proxies[0])))?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

      setProxies(fetchedProxyItems);
    });
  }, [api, chain, realAddress]);

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  const _onNameChange = useCallback((name: string | null) => setName(name), []);

  const _onChangeGenesis = useCallback((genesisHash?: string | null): void => {
    setProxies(undefined);
    genesisHash && getMetadata(genesisHash, true).then(setChain).catch((error): void => {
      console.error(error);
    });
  }, []);

  const handleAdd = useCallback(() => {
    name && realAddress && chain?.genesisHash && createAccountExternal(name, realAddress, chain.genesisHash)
      .then(() => onAction('/'))
      .catch((error: Error) => console.error(error));
  }, [chain?.genesisHash, name, onAction, realAddress]);

  return (
    <>
      <HeaderBrand
        onBackClick={_goHome}
        showBackArrow
        text={t<string>('Add Watch-Only')}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='18px auto 0'
        width='90%'
      >
        {t('Enter the watch-only address. It can also serve as a proxied account, but without transaction signing. A proxy account in the extension is needed for signing.')}
      </Typography>
      <AddressInput
        addWithQr
        address={realAddress}
        chain={chain}
        label={t<string>('Account ID')}
        setAddress={setRealAddress}
        style={{ m: '15px auto 0', width: '92%' }}
      />
      <Name
        onChange={_onNameChange}
      />
      <SelectChain
        address={realAddress}
        defaultValue={chain?.genesisHash}
        disabledItems={disabledItems}
        icon={getLogo(chain ?? undefined)}
        label={t<string>('Select the chain')}
        onChange={_onChangeGenesis}
        options={genesisOptions}
        style={{ m: '15px auto 0', width: '92%' }}
      />
      <ProxyTable
        chain={realAddress ? chain : undefined}
        label={t<string>('Proxies')}
        mode='Availability'
        proxies={proxies}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      <PButton
        _onClick={handleAdd}
        disabled={!name || !realAddress || !chain}
        text={t('Add')}
      />
    </>
  );
}
