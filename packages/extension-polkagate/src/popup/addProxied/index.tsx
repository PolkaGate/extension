// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, TextField, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AccountsStore } from '@polkadot/extension-base/stores';
import { Chain } from '@polkadot/extension-chains/types';
import { ActionContext, DropdownWithIcon, PButton, ProxyTable, InputWithLabelAndIdenticon } from '../../components'
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { AccountContext } from '../../../../extension-ui/src/components/contexts';
import { useTranslation, useGenesisHashOptions, useApi, useEndpoint } from '../../hooks';
import { createAccountExternal, getMetadata } from '../../messaging';
import { Name, HeaderBrand } from '../../partials';
import { NameAddress, Proxy } from '../../util/plusTypes';
import getLogo from '../../util/getLogo';

// import { Progress } from '../../components';
// import Identity2 from '../../components/Identity2';

// import AddressTextBox from './AddressTextBox';
// import SelectChain from './SelectChain';

interface Props {
  className?: string;
}

export default function AddProxy({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);

  const [addresesOnThisChain, setAddresesOnThisChain] = useState<NameAddress[]>([]);
  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [chain, setChain] = useState<Chain>();
  const [name, setName] = useState<string | null | undefined>();
  const [proxies, setProxies] = useState<Proxy[] | undefined>();

  const endpoint = useEndpoint(accounts, realAddress, chain);
  const api = useApi(endpoint);
  const genesisOptions = useGenesisHashOptions();

  const handleAlladdressesOnThisChain = useCallback((prefix: number): void => {
    const allAddresesOnSameChain = accounts.reduce(function (result: NameAddress[], acc): NameAddress[] {
      const publicKey = decodeAddress(acc.address);

      result.push({ address: encodeAddress(publicKey, prefix), name: acc?.name });

      return result;
    }, []);

    setAddresesOnThisChain(allAddresesOnSameChain);
  }, [accounts]);
  const isAvailable = useCallback((address: string): NameAddress => addresesOnThisChain?.find((a) => a.address === address), [addresesOnThisChain]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    chain?.ss58Format !== undefined && handleAlladdressesOnThisChain(chain.ss58Format);
  }, [chain, handleAlladdressesOnThisChain]);

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
      {/* <Container sx={{ px: '30px' }}> */}
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
        chain={chain}
        label={t<string>('Account ID')}
        style={{ m: 'auto', width: '92%' }}
      />
      <ProxyTable
        label={t<string>('Proxies')}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      {/* <Grid
        item
        sx={{
          color: '#000',
          fontSize: 16,
          p: '10px 50px 5px',
          textAlign: 'center'
        }}
        xs={12}
      >
        {t('PROXIES')}
      </Grid> */}
      {/* <Grid
        container
        item
        sx={{
          fontSize: 14,
          fontWeight: 500,
          bgcolor: '#000',
          borderTopRightRadius: '5px',
          borderTopLeftRadius: '5px',
          py: '5px',
          px: '10px'
        }}
      >
        <Grid item xs={6}>
          {t('address')}
        </Grid>
        <Grid item xs={2}>
          {t('type')}
        </Grid>
        <Grid item xs={2}>
          {t('delay')}
        </Grid>
        <Grid item xs={2}>
          {t('available')}
        </Grid>
      </Grid> */}
      {/* <Grid
        container
        item
        sx={{
          borderLeft: '2px solid',
          borderRight: '2px solid',
          borderBottom: '2px solid',
          borderBottomLeftRadius: '30px 10%',
          borderColor: '#000',
          display: 'block',
          pt: '15px',
          pl: '10px',
          height: 140,
          overflowY: 'auto'
        }}
        xs={12}
      > */}
      {/* {chain && realAddress &&
            <>
              {proxies
                ? proxies.length
                  ? proxies.map((proxy, index) => {
                    return (
                      <Grid container item key={index} sx={{ fontSize: 13 }}>
                        <Grid item xs={6}>
                          <Identity2 address={proxy.delegate} api={api} chain={chain} />
                        </Grid>
                        <Grid item xs={2}>
                          {proxy.proxyType}
                        </Grid>
                        <Grid item xs={2}>
                          {proxy.delay}
                        </Grid>
                        <Grid item xs={2}>
                          {isAvailable(proxy.delegate) ? 'Yes' : 'No'}
                        </Grid>
                      </Grid>
                    );
                  })
                  : <Grid item pt='20px' textAlign='center'>
                    {t('No proxies found for the entered account\'s address on {{chain}}', { replace: { chain: chain?.name } })}
                  </Grid>
                : <Progress pt={'10px'} title={'Loading proxies ...'} />
              }
            </>} */}
      {/* </Grid> */}
      <PButton
        _onClick={handleAdd}
        disabled={!name || !realAddress}// || !proxies?.length}
        text={t('Add')}
      />
      {/* </Container> */}
    </>
  );
}
