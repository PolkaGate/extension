// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Proxy, ProxyItem } from '../../util/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BN, BN_ZERO } from '@polkadot/util';

import { useAccount, useChainInfo, useFullscreen, useTranslation, useUpdateSelectedAccount } from '../../hooks';
import { PROXY_CHAINS } from '../../util/constants';
import { EmptyListBox } from '../components';
import HomeLayout from '../components/layout';
import AddProxy from './AddProxy';
import Manage from './Manage';
import TransactionFlow from './TransactionFlow';
import { STEPS } from './types';

function ManageProxies (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string; }>();
  const account = useAccount(address);
  const { api, chain, decimal, token } = useChainInfo(genesisHash);

  useUpdateSelectedAccount(address);

  const [step, setStep] = useState(STEPS.CHECK);
  const [proxyItems, setProxyItems] = useState<ProxyItem[] | null | undefined>();
  const [depositedValue, setDepositedValue] = useState<BN | null | undefined>();
  const [newDepositValue, setNewDepositedValue] = useState<BN | undefined>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);

  const isDisabledAddProxyButton = useMemo(() => !account || proxyItems === undefined, [account, proxyItems]);

  const fetchProxies = useCallback((_address: string, _api: ApiPromise) => {
    setRefresh(false);
    setFetching(true);

    _api.query['proxy']?.['proxies'](_address).then((_proxies) => {
      const fetchedProxies = _proxies.toHuman() as [Proxy[], string];

      const _proxyItems = fetchedProxies[0].map((_proxy) => ({ proxy: _proxy, status: 'current' })) as ProxyItem[];
      const deposit = fetchedProxies[1].replaceAll(',', '');

      if (_proxyItems.length > 0) {
        setProxyItems(_proxyItems);
        setDepositedValue(new BN(deposit));
      } else {
        setProxyItems(null);
        setDepositedValue(null);
      }

      setFetching(false);
    }).catch(console.error);
  }, []);

  useLayoutEffect(() => {
    if (!genesisHash) {
      setStep(STEPS.CHECK);
    } else if (!PROXY_CHAINS.includes(genesisHash ?? '')) {
      setStep(STEPS.UNSUPPORTED);
    } else {
      setStep(STEPS.MANAGE);
    }
  }, [genesisHash, chain, refresh]);

  useEffect(() => {
    setProxyItems(undefined);
    setDepositedValue(undefined);
  }, [chain?.genesisHash, refresh]);

  useEffect(() => {
    if (!address || !api || proxyItems !== undefined || fetching) {
      return;
    }

    if (api.genesisHash.toString() !== chain?.genesisHash) {
      setProxyItems(undefined);
      setDepositedValue(undefined);

      return;
    }

    fetchProxies(address, api);
  }, [address, api, chain?.genesisHash, fetchProxies, fetching, proxyItems, refresh]);

  return (
    <HomeLayout childrenStyle={{ marginLeft: '25px' }}>
      <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
        {t('Proxy Management')}
      </Typography>
      <Typography color='text.secondary' sx={{ m: '10px 0 20px' }} variant='B-4'>
        {t('You can add new proxies or remove existing ones for the account here. Keep in mind that you need to reserve a deposit to have proxies.')}
      </Typography>
      <Grid container item sx={{ display: 'block', position: 'relative' }}>
        {step === STEPS.UNSUPPORTED &&
          <EmptyListBox
            style={{ marginTop: '20px' }}
            text={t('The chosen blockchain does not support proxy management.')}
          />
        }
        {step === STEPS.MANAGE &&
          <Manage
            api={api}
            chain={chain}
            decimal={decimal}
            depositedValue={depositedValue}
            isDisabledAddProxyButton={!!isDisabledAddProxyButton}
            newDepositValue={newDepositValue}
            proxyItems={proxyItems}
            setNewDepositedValue={setNewDepositedValue}
            setProxyItems={setProxyItems}
            setStep={setStep}
            token={token}
          />
        }
        {step === STEPS.ADD_PROXY &&
          <AddProxy
            chain={chain}
            proxiedAddress={address}
            proxyItems={proxyItems}
            setProxyItems={setProxyItems}
            setStep={setStep}
            step={step}
          />
        }
        {[STEPS.REVIEW, STEPS.WAIT_SCREEN, STEPS.CONFIRMATION, STEPS.SIGN_QR].includes(step) &&
          <TransactionFlow
            address={address}
            api={api}
            chain={chain}
            depositedValue={BN_ZERO}
            newDepositValue={newDepositValue}
            proxyItems={proxyItems}
            setRefresh={setRefresh}
            setStep={setStep}
            step={step}
          />
        }
      </Grid>
    </HomeLayout>
  );
}

export default React.memo(ManageProxies);
