// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { HexString } from '@polkadot/util/types';
import type { Proxy, ProxyItem } from '../../../util/types';

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ActionContext, AddressInput, GenesisHashOptionsContext, PButton, ProxyTable, SelectChain } from '../../../components';
import { useApiWithChain, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata } from '../../../messaging';
import { HeaderBrand, Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import { addressToChain, getSubstrateAddress } from '../../../util/utils';

export default function AddAddressOnly(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const [realAddress, setRealAddress] = useState<string | null | undefined>();
  const [chain, setChain] = useState<Chain | null>();
  const [name, setName] = useState<string | null | undefined>();
  const [proxies, setProxies] = useState<ProxyItem[] | undefined>();
  const [isBusy, setIsBusy] = useState(false);

  const api = useApiWithChain(chain);
  const genesisOptions = useContext(GenesisHashOptionsContext);

  const disabledItems = useMemo(() => (['Allow use on any chain']), []);

  const getChain = useCallback((genesisHash: string) => {
    getMetadata(genesisHash, true).then(setChain).catch((error): void => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    (!realAddress || !chain) && setProxies(undefined);
  }, [realAddress, chain]);

  useEffect(() => {
    if (realAddress) {
      const addressChain = addressToChain(realAddress);

      addressChain?.genesisHash && getChain(addressChain.genesisHash);

      api?.query['proxy']?.['proxies'](realAddress)
        .then((proxies) => {
          const fetchedProxyItems = (JSON.parse(JSON.stringify((proxies as unknown as unknown[])?.[0])) as Proxy[])?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

          setProxies(fetchedProxyItems);
        })
        .catch(console.error);
    }
  }, [api, getChain, realAddress]);

  const goHome = useCallback(() => onAction('/'), [onAction]);
  const goToAccountDetail = useCallback((genesisHash: string, address: string) => onAction(`/account/${genesisHash}/${address}/`), [onAction]);

  const onNameChange = useCallback((name: string | null) => setName(name), []);

  const onChangeGenesis = useCallback((genesisHash?: string | null): void => {
    setProxies(undefined);
    genesisHash && getChain(genesisHash);
  }, [getChain]);

  const handleAdd = useCallback(() => {
    if (name && realAddress && chain?.genesisHash) {
      setIsBusy(true);

      const substrateAddress = getSubstrateAddress(realAddress);

      createAccountExternal(name, realAddress, chain.genesisHash as HexString)
        .then(() => {
          setStorage('profile', PROFILE_TAGS.WATCH_ONLY).catch(console.error);
        })
        .finally(() => chain.genesisHash && substrateAddress
          ? goToAccountDetail(chain.genesisHash, substrateAddress)
          : goHome)
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [chain?.genesisHash, goHome, goToAccountDetail, name, realAddress]);

  return (
    <>
      <HeaderBrand
        onBackClick={goHome}
        showBackArrow
        text={t('Add Watch-Only')}
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
        label={t('Account ID')}
        setAddress={setRealAddress}
        style={{ m: '15px auto 0', width: '92%' }}
      />
      <Name
        onChange={onNameChange}
      />
      <SelectChain
        address={realAddress}
        defaultValue={chain?.genesisHash}
        disabledItems={disabledItems}
        icon={getLogo(chain ?? undefined)}
        label={t('Select the chain')}
        onChange={onChangeGenesis}
        options={genesisOptions}
        style={{ m: '15px auto 0', width: '92%' }}
      />
      <ProxyTable
        chain={realAddress ? chain : undefined}
        label={t('Proxies')}
        mode='Availability'
        proxies={proxies}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      <PButton
        _isBusy={isBusy}
        _onClick={handleAdd}
        disabled={!name || !realAddress || !chain}
        text={t('Add')}
      />
    </>
  );
}
