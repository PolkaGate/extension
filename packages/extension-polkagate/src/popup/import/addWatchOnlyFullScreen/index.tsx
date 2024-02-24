// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ActionContext, AddressInput, ProxyTable, SelectChain, TwoButtons } from '../../../components';
import { useApiWithChain, useFullscreen, useGenesisHashOptions, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata } from '../../../messaging';
import { Name } from '../../../partials';
import getLogo from '../../../util/getLogo';
import { ProxyItem } from '../../../util/types';
import { FullScreenHeader } from '../../governance/FullScreenHeader';

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

export default function AddWatchOnly(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [isBusy, setIsBusy] = useState(false);
  const [realAddress, setRealAddress] = useState<string | undefined>();
  const [chain, setChain] = useState<Chain>();
  const [name, setName] = useState<string | null | undefined>();
  const [proxies, setProxies] = useState<ProxyItem[] | undefined>();

  const api = useApiWithChain(chain);
  const genesisOptions = useGenesisHashOptions();
  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);
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

  const onAdd = useCallback(() => {
    if (name && realAddress && chain?.genesisHash) {
      setIsBusy(true);

      createAccountExternal(name, realAddress, chain.genesisHash)
        .then(() => onAction('/'))
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [chain?.genesisHash, name, onAction, realAddress]);

  const onCancel = useCallback(() => onAction('/'), [onAction]);

  const onNameChange = useCallback((name: string | null) => setName(name), []);

  const onChangeGenesis = useCallback((genesisHash?: string | null): void => {
    setProxies(undefined);
    genesisHash && getMetadata(genesisHash, true).then(setChain).catch((error): void => {
      console.error(error);
    });
  }, []);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:tag' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Add Watch-Only Account')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t<string>('Enter the watch-only address. It can also serve as a proxied account, but without transaction signing. A proxy account in the extension is needed for signing.')}
          </Typography>
          <AddressInput
            addWithQr
            address={realAddress}
            chain={chain}
            label={t<string>('Account ID')}
            setAddress={setRealAddress}
            style={{ m: '30px auto 0', width: '100%' }}
          />
          <Grid container justifyContent='space-between'>
            <Grid item md={5.5} xs={12}>
              <Name
                onChange={onNameChange}
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <SelectChain
                address={realAddress}
                defaultValue={chain?.genesisHash}
                disabledItems={disabledItems}
                icon={getLogo(chain ?? undefined)}
                label={t<string>('Select the chain')}
                onChange={onChangeGenesis}
                options={genesisOptions}
                style={{ my: '13px', width: '100%' }}
              />
            </Grid>
          </Grid>
          <ProxyTable
            chain={realAddress ? chain : undefined}
            label={t<string>('Proxies')}
            mode='Availability'
            proxies={proxies}
            style={{
              m: '30px auto',
              width: '100%'
            }}
          />
          <Grid container item justifyContent='flex-end' pt='10px'>
            <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={!name || !realAddress || !chain}
                isBusy={isBusy}
                mt='1px'
                onPrimaryClick={onAdd}
                onSecondaryClick={onCancel}
                primaryBtnText={t<string>('Add')}
                secondaryBtnText={t<string>('Cancel')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
