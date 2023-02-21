// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AccountContext, ActionContext, Infotip, PasswordUseProxyConfirm, Popup, ShowValue, WrongPasswordAlert } from '../../../../../components';
import { useAccountName, useProxies, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import Confirmation from '../../../../../partials/Confirmation';
import { signAndSend } from '../../../../../util/api';
import { MyPoolInfo, Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import ShowPoolRole from './ShowPoolRole';
import TxDetail from './TxDetail';
import { ChangesProps } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain | undefined;
  changes?: ChangesProps;
  formatted: string;
  pool: MyPoolInfo;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMyPool: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  state: string;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Review({ address, api, chain, changes, formatted, pool, setRefresh, setShow, setShowMyPool, show, state }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, formatted);
  const name = useAccountName(address);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [txCalls, setTxCalls] = useState<SubmittableExtrinsic<'promise'>[]>();

  const batchAll = api && api.tx.utility.batchAll;
  const setMetadata = api && api.tx.nominationPools.setMetadata;

  const onBackClick = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  useEffect(() => {
    if (!api || !setMetadata) {
      return;
    }

    const calls = [];

    const getRole = (role: string | undefined) => {
      if (role === undefined) {
        return 'Noop';
      } else if (role === null) {
        return 'Remove';
      } else {
        return { set: role };
      }
    };

    changes?.newPoolName !== undefined &&
      calls.push(setMetadata(pool.poolId, changes?.newPoolName));
    changes?.newRoles !== undefined &&
      calls.push(api.tx.nominationPools.updateRoles(pool.poolId, getRole(changes?.newRoles.newRoot), getRole(changes?.newRoles.newNominator), getRole(changes?.newRoles.newStateToggler)));

    setTxCalls(calls);

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    calls.length && calls[0].paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    });

    calls.length > 1 && calls[1].paymentInfo(formatted).then((i) => {
      setEstimatedFee((prevEstimatedFee) => api.createType('Balance', (prevEstimatedFee ?? BN_ZERO).add(i?.partialFee)));
    });
  }, [api, changes?.newPoolName, changes?.newRoles, formatted, pool.metadata, pool.poolId, setMetadata, setTxCalls]);

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/pool/${address}`);
  }, [address, onAction, setShow]);

  const goToMyPool = useCallback(() => {
    setShowMyPool(false);
  }, [setShowMyPool]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const goEditPool = useCallback(async () => {
    try {
      if (!formatted || !txCalls || !api || !batchAll || !chain) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(selectedProxyAddress ?? formatted);

      signer.unlock(password);
      setShowWaitScreen(true);

      const updated = txCalls.length > 1 ? batchAll(txCalls) : txCalls[0];
      const tx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, updated) : updated;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, tx, signer, formatted);

      const info = {
        action: 'Pool Staking',
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: from, name: selectedProxyName || name },
        subAction: 'Edit Pool',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
      setRefresh(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, batchAll, chain, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, setRefresh, txCalls]);

  return (
    <Popup show={show}>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Edit Pool')}
        withSteps={{ current: 2, total: 2 }}
      />
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      <SubTitle label={t<string>('Review')} />
      {changes?.newPoolName !== undefined &&
        <>
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '8px', width: '90%' }}>
            <Infotip showQuestionMark text={changes?.newPoolName}>
              <Typography fontSize='16px' fontWeight={300} lineHeight='23px'>
                {t<string>('Pool name')}
              </Typography>
            </Infotip>
            <Typography fontSize='25px' fontWeight={400} lineHeight='42px' maxWidth='100%' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
              {changes?.newPoolName}
            </Typography>
          </Grid>
          {changes?.newRoles &&
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
          }
        </>}
      {changes?.newRoles?.newRoot !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes?.newRoles?.newRoot}
          roleTitle={t<string>('Root')}
          showDivider
        />
      }
      {changes?.newRoles?.newNominator !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes?.newRoles?.newNominator}
          roleTitle={t<string>('Nominator')}
          showDivider
        />
      }
      {changes?.newRoles?.newStateToggler !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes?.newRoles?.newStateToggler}
          roleTitle={t<string>('State toggler')}
          showDivider
        />
      }
      <Grid alignItems='center' container item justifyContent='center' lineHeight='20px'>
        <Grid item>
          {t('Fee')}:
        </Grid>
        <Grid item sx={{ pl: '5px' }}>
          <ShowValue height={16} value={estimatedFee?.toHuman()} />
        </Grid>
      </Grid>
      <PasswordUseProxyConfirm
        api={api}
        estimatedFee={estimatedFee}
        genesisHash={chain?.genesisHash}
        isPasswordError={isPasswordError}
        label={`${t<string>('Password')} for ${selectedProxyName || name}`}
        onChange={setPassword}
        onConfirmClick={goEditPool}
        proxiedAddress={formatted}
        proxies={proxyItems}
        proxyTypeFilter={['Any', 'NonTransfer']}
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
      {
        txInfo && (
          <Confirmation
            headerTitle={t('Pool Staking')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyPool}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My pool')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail
              pool={pool}
              txInfo={txInfo}
            />
          </Confirmation>)
      }
    </Popup>
  );
}
