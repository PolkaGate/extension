// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';

import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { ActionContext, Identity, Motion, PasswordUseProxyConfirm, Popup, ShortAddress, ShowValue, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useChain, useFormatted, useProxies, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { Proxy, ProxyItem, SoloSettings, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  settings: SoloSettings;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  newSettings: SoloSettings;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

function RewardsDestination({ chain, newSettings, settings }: { settings: SoloSettings, newSettings: SoloSettings, chain: Chain | undefined }) {
  const { t } = useTranslation();
  const destinationAddress = useMemo(() =>
    newSettings.payee === 'Stash'
      ? settings.stashId
      : newSettings.payee === 'Controller'
        ? newSettings.controllerId || settings.controllerId
        : newSettings.payee.Account as string
    , [newSettings.controllerId, newSettings.payee, settings.controllerId, settings.stashId]);

  return (
    <Grid container item justifyContent='center' sx={{ alignSelf: 'center', my: '5px' }}>
      <Typography sx={{ fontWeight: 300 }}>
        {t('Rewards destination')}
      </Typography>
      <Grid container item justifyContent='center'>
        {newSettings.payee === 'Staked'
          ? <Typography sx={{ fontSize: '28px', fontWeight: 300 }}>
            {t('Add to staked amount')}
          </Typography>
          : <Grid container item justifyContent='center'>
            <Identity chain={chain} formatted={destinationAddress} identiconSize={31} style={{ height: '40px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
            <ShortAddress address={destinationAddress} />
          </Grid>
        }
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
    </Grid>
  );
}

export default function Review({ address, api, newSettings, setRefresh, setShow, setShowSettings, settings, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, settings.stashId);
  const name = useAccountDisplay(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const onAction = useContext(ActionContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [tx, setTx] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>>();

  const setController = api && api.tx.staking.setController; // sign by stash
  const setPayee = api && api.tx.staking.setPayee; // sign by Controller
  const batchAll = api && api.tx.utility.batchAll;
  const isControllerDeprecated = setController ? setController.meta.args.length === 0 : undefined;

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  useEffect(() => {
    if (!setController || !setPayee || !api || !batchAll || !formatted) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const txs = [];

    if (String(formatted) === String(settings.controllerId) && newSettings?.payee && JSON.stringify(settings.payee) !== JSON.stringify(newSettings?.payee)) {
      txs.push(setPayee(newSettings?.payee)); // First
    }

    if (String(formatted) === String(settings.stashId) && newSettings?.controllerId && settings.controllerId !== newSettings?.controllerId) {
      txs.push(setController(newSettings?.controllerId)); // Second, the order to execute, for non-deprecated case
    }

    if (String(formatted) === String(settings.stashId) && isControllerDeprecated && settings.controllerId !== formatted) {
      txs.push(setController()); // Second, for deprecated case
    }

    const tx = txs.length === 2 ? batchAll(txs) : txs[0];

    setTx(tx);
    tx && tx.paymentInfo(formatted).then((i) => setEstimatedFee(api.createType('Balance', i?.partialFee ?? BN_ZERO))).catch(console.error);
  }, [api, batchAll, formatted, isControllerDeprecated, newSettings?.controllerId, newSettings?.payee, setController, setPayee, settings.controllerId, settings.payee, settings.stashId]);

  const goToStakingHome = useCallback(() => {
    setShow(false);
    setShowSettings(false);
    onAction(`/solo/${address}`);
  }, [address, onAction, setShow, setShowSettings]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);
    setShowSettings(false);
    onAction('/');
  }, [onAction, setShow, setShowSettings]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const applySettings = useCallback(async () => {
    try {
      if (!formatted || !api || !tx) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      const ptx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, ptx, signer, formatted);

      const info = {
        action: 'Solo Staking',
        // amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: 'Settings',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);
      setShowWaitScreen(false);
      setShowConfirmation(true);
      setRefresh(true); // to refresh stakingAccount
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [formatted, api, tx, selectedProxyAddress, password, selectedProxy, estimatedFee, name, selectedProxyName, chain, setRefresh]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const Controller = useCallback(() => {
    const controllerId = isControllerDeprecated && formatted !== settings.controllerId ? formatted : newSettings.controllerId;

    return (<Grid alignItems='center' container direction='column' justifyContent='center' my='5px'>
      <Typography fontSize='16px' fontWeight={300} textAlign='center'>
        {t<string>('Controller account')}
      </Typography>
      <Identity chain={chain} formatted={controllerId} identiconSize={31} style={{ height: '40px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
      <ShortAddress address={controllerId} />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
    </Grid>
    );
  }, [chain, formatted, isControllerDeprecated, newSettings.controllerId, settings.controllerId, t]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Solo Settings')}
          withSteps={{ current: 2, total: 2 }}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '30px' }}>
          {(newSettings?.controllerId || (isControllerDeprecated && formatted !== settings.controllerId)) &&
            <Controller />
          }
          {newSettings?.payee &&
            <RewardsDestination chain={chain} settings={settings} newSettings={newSettings} />
          }
          <Grid alignItems='center' container item justifyContent='center' lineHeight='20px' mt='10px'>
            <Grid item>
              {t('Fee')}:
            </Grid>
            <Grid item sx={{ pl: '5px' }}>
              <ShowValue value={estimatedFee?.toHuman()} height={16} />
            </Grid>
          </Grid>
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || name || '' } })}
          onChange={setPassword}
          onConfirmClick={applySettings}
          proxiedAddress={settings.stashId}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'NonTransfer', 'Staking']}
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
          title={t('Solo Settings')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Solo Settings')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail
              newSettings={newSettings}
              txInfo={txInfo}
            />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
