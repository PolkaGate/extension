// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { Proxy, ProxyItem } from '../../util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { Warning } from '../../components';
import { useFullscreen, useInfo, useTranslation } from '../../hooks';
import { FULLSCREEN_WIDTH, PROXY_CHAINS } from '../../util/constants';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import AddProxy from './AddProxy';
import Manage from './Manage';
import Review from './Review';

export const STEPS = {
  ADD_PROXY: 3,
  CHECK: 0,
  CONFIRM: 6,
  MANAGE: 2,
  PROXY: 100,
  REVIEW: 4,
  SIGN_QR: 200,
  UNSUPPORTED: 1,
  WAIT_SCREEN: 5
};

function ManageProxies(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string; }>();
  const { account, api, chain, decimal, token } = useInfo(address);

  const [step, setStep] = useState<number>(STEPS.CHECK);
  const [proxyItems, setProxyItems] = useState<ProxyItem[] | null | undefined>();
  const [depositedValue, setDepositedValue] = useState<BN | null | undefined>();
  const [newDepositValue, setNewDepositedValue] = useState<BN | undefined>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);

  const isDisabledAddProxyButton = useMemo(() => !account || proxyItems === undefined, [account, proxyItems]);

  const fetchProxies = useCallback((_address: string, _api: ApiPromise) => {
    setRefresh(false);
    setFetching(true);

    _api.query.proxy?.proxies(_address).then((_proxies) => {
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
    if (!account?.genesisHash) {
      setStep(STEPS.CHECK);
    } else if (!PROXY_CHAINS.includes(account.genesisHash ?? '')) {
      setStep(STEPS.UNSUPPORTED);
    } else {
      setStep(STEPS.MANAGE);
    }
  }, [account?.genesisHash, chain, refresh]);

  useEffect(() => {
    setProxyItems(undefined);
    setDepositedValue(undefined);
  }, [chain?.genesisHash, refresh]);

  useEffect(() => {
    if (!api || proxyItems !== undefined || fetching) {
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
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='proxyManagement' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', position: 'relative', px: '10%' }}>
          {step === STEPS.UNSUPPORTED &&
            <Grid alignItems='center' container direction='column' display='block' item>
              <Typography fontSize='30px' fontWeight={700} p='30px 0 60px 30px'>
                {t('Proxy Management')}
              </Typography>
              <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', width: '500px' }}>
                <Warning
                  fontWeight={500}
                  isBelowInput
                  theme={theme}
                >
                  {t('The chosen blockchain does not support proxy management.')}
                </Warning>
              </Grid>
            </Grid>
          }
          {step === STEPS.MANAGE &&
            <Manage
              api={api}
              chain={chain as any}
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
              chain={chain as any}
              proxiedAddress={address}
              proxyItems={proxyItems}
              setProxyItems={setProxyItems}
              setStep={setStep}
            />
          }
          {[STEPS.REVIEW, STEPS.PROXY, STEPS.WAIT_SCREEN, STEPS.CONFIRM, STEPS.SIGN_QR].includes(step) &&
            <Review
              address={address}
              api={api}
              chain={chain as any}
              depositedValue={BN_ZERO}
              newDepositValue={newDepositValue}
              proxyItems={proxyItems}
              setRefresh={setRefresh}
              setStep={setStep}
              step={step}
            />
          }
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(ManageProxies);
