// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { AccountWithProxyInConfirmation, ActionContext, Motion, PasswordUseProxyConfirm, Popup, ShowBalance, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useEstimatedFee, useInfo, useProxies, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { PROXY_TYPE } from '../../../../util/constants';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import ShowPool from '../../partial/ShowPool';

interface Props {
  address: string;
  formatted: AccountId | string;
  pool: MyPoolInfo;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  state: string;
  helperText: string;
  headerText: string;
}

export default function SetState({ address, formatted, headerText, helperText, pool, setRefresh, setShow, show, state }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { api, chain } = useInfo(address);
  const proxies = useProxies(api, formatted);
  const name = useAccountDisplay(address);
  const onAction = useContext(ActionContext);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const batchAll = api?.tx['utility']['batchAll'];
  const chilled = api?.tx['nominationPools']['chill'];
  const poolSetState = api?.tx['nominationPools']['setState'](pool.poolId.toString(), state); // (poolId, state)
  const estimatedFee = useEstimatedFee(address, poolSetState);

  const backToStake = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/pool/${address}`);
  }, [address, onAction, setShow]);

  const goToMyPool = useCallback(() => {
    setShowConfirmation(false);
    setShow(false);

    onAction(`/pool/myPool/${address}`);
  }, [address, onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const changeState = useCallback(async () => {
    setRefresh(false);

    try {
      if (!formatted || !api || !batchAll || !poolSetState || !chilled) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const mayNeedChill = state === 'Destroying' && pool.stashIdAccount?.nominators?.length && (String(pool.bondedPool?.roles.root) === String(formatted) || String(pool.bondedPool?.roles.nominator) === String(formatted)) ? chilled(pool.poolId) : undefined;
      const calls = mayNeedChill ? batchAll([mayNeedChill, poolSetState]) : poolSetState;

      const tx = selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, calls) : calls;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, tx, signer, String(formatted));

      const subAction = state === 'Destroying' ? 'Destroy Pool' : state === 'Open' ? 'Unblock Pool' : 'Block Pool';

      const info = {
        action: 'Pool Staking',
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted as unknown as string, name },
        subAction,
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain: chain as any });

      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
      setRefresh(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [setRefresh, formatted, api, batchAll, poolSetState, chilled, selectedProxyAddress, password, state, pool.stashIdAccount?.nominators?.length, pool.bondedPool?.roles.root, pool.bondedPool?.roles.nominator, pool.poolId, selectedProxy, estimatedFee, selectedProxyName, name, chain]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={backToStake}
          shortBorder
          showBackArrow
          showClose
          text={headerText}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <ShowPool
          api={api}
          chain={chain}
          mode='Default'
          pool={pool}
          showInfo
          style={{
            m: '20px auto',
            width: '92%'
          }}
        />
        <Grid container m='auto' width='92%'>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t('Fee')}:
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={estimatedFee}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Typography fontSize='12px' fontWeight={300} m='20px auto 0' textAlign='left' width='90%'>
          {helperText}
        </Typography>
        <PasswordUseProxyConfirm
          api={api}
          confirmDisabled={!estimatedFee}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={changeState}
          proxiedAddress={formatted}
          proxies={proxyItems}
          proxyTypeFilter={PROXY_TYPE.NOMINATION_POOLS}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setSelectedProxy={setSelectedProxy}
          style={{
            bottom: '80px',
            left: '4%',
            position: 'absolute',
            width: '92%'
          }}
        />
        <WaitScreen
          show={showWaitScreen}
          title={t(`${state} Pool`)}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Pool Staking')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyPool}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My pool')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <>
              <AccountWithProxyInConfirmation
                txInfo={txInfo}
              />
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t('Pool')}:
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'                >
                  {pool.metadata}
                </Typography>
              </Grid>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            </>
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
