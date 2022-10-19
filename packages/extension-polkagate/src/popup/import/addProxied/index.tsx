// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady, decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext } from '../../../../../extension-ui/src/components/contexts';
import { ActionContext, DropdownWithIcon, InputWithLabelAndIdenticon, PButton, ProxyTable } from '../../../components'
import { useApi, useEndpoint, useGenesisHashOptions, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata } from '../../../messaging';
import { HeaderBrand, Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import { nameAddress, Proxy } from '../../../util/types';

interface Props {
  className?: string;
}

export default function AddProxy({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);

  const [addressesOnThisChain, setAddressesOnThisChain] = useState<nameAddress[]>([]);
  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [chain, setChain] = useState<Chain>();
  const [name, setName] = useState<string | null | undefined>();
  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const endpoint = useEndpoint(realAddress, chain);
  const api = useApi(endpoint);
  const genesisOptions = useGenesisHashOptions();

  const handleAllAddressesOnThisChain = useCallback((prefix: number): void => {
    const allAddressesOnSameChain = accounts.reduce(function (result: nameAddress[], acc): nameAddress[] {
      const publicKey = decodeAddress(acc.address);

      result.push({ address: encodeAddress(publicKey, prefix), name: acc?.name });

      return result;
    }, []);

    setAddressesOnThisChain(allAddressesOnSameChain);
  }, [accounts]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    chain?.ss58Format !== undefined && handleAllAddressesOnThisChain(chain.ss58Format);
  }, [chain, handleAllAddressesOnThisChain]);

  useEffect(() => {
    (!realAddress || !chain) && setProxies(undefined);
  }, [realAddress, chain]);
  useEffect(() => {
    realAddress && api && api.query.proxy?.proxies(realAddress).then((proxies) => {
      setProxies(JSON.parse(JSON.stringify(proxies[0])));
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
        text={t<string>('Add proxied account')}
      />
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='18px auto 0'
        width='90%'
      >
        {t('Enter just your account\'s public information (no private key), this can be used as e.g., watch only, and proxied account.')}
      </Typography>
      <Name
        label={t<string>('Name')}
        onChange={_onNameChange}
      />
      <DropdownWithIcon
        defaultValue={genesisOptions[0].text}
        icon={getLogo(chain ?? undefined)}
        label={t<string>('Select the chain')}
        onChange={_onChangeGenesis}
        options={genesisOptions}
        style={{ m: '12px auto 20px', width: '92%' }}
      />
      <InputWithLabelAndIdenticon
        address={realAddress}
        chain={chain}
        label={t<string>('Account ID')}
        setAddress={setRealAddress}
        style={{ m: 'auto', width: '92%' }}
      />
      <ProxyTable
        addressesOnThisChain={addressesOnThisChain}
        chain={realAddress ? chain : undefined}
        label={t<string>('Proxies')}
        proxies={proxies}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      <PButton
        _onClick={handleAdd}
        disabled={!name || !realAddress}// || !proxies?.length}
        text={t('Add')}
      />
    </>
  );
}
