// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';

import { Container, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import { setting } from '../../../../assets/icons';
import { AccountContext, ActionContext, Identity, Motion, PasswordUseProxyConfirm, Popup, ShortAddress, ShowValue, Warning } from '../../../../components';
import { useAccountName, useChain, useFormatted, useProxies, useToken, useTranslation } from '../../../../hooks';
import { updateMeta } from '../../../../messaging';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { Proxy, ProxyItem, SoloSettings, TransactionDetail, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../util/utils';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  settings: SoloSettings,
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  newSettings: SoloSettings | undefined
}

function RewardsDestination({ chain, newSettings, settings }: { settings: SoloSettings, newSettings: SoloSettings, chain: Chain | undefined }) {
  const { t } = useTranslation();
  const destinationAddress: string = newSettings.payee === 'Stash' ? settings.stashId : newSettings.payee === 'Controller' ? setting.controllerId : newSettings.payee.Account;

  console.log('newSettings newSettings:', newSettings);
  
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

export default function Review({ address, api, newSettings, setShow, settings, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, settings.stashId);
  const name = useAccountName(address);
  const theme = useTheme();
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const token = useToken(address);
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
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

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  useEffect(() => {
    if (!setController || !setPayee || !batchAll || !formatted) {
      return;
    }

    const txs = [];

    if (newSettings?.controllerId && settings.controllerId !== newSettings?.controllerId) {
      txs.push(setController(newSettings?.controllerId));
    }

    if (newSettings?.payee && JSON.stringify(settings.payee) !== JSON.stringify(newSettings?.payee)) {
      txs.push(setPayee(newSettings?.payee));
    }

    const tx = txs.length === 2 ? batchAll(txs) : txs[0];

    setTx(tx);
    tx.paymentInfo(formatted).then((i) => setEstimatedFee(api.createType('Balance', i?.partialFee ?? BN_ZERO))).catch(console.error);
  }, [api, batchAll, formatted, newSettings?.controllerId, newSettings?.payee, setController, setPayee, settings.controllerId, settings.payee]);

  function saveHistory(chain: Chain, hierarchy: AccountWithChildren[], address: string, history: TransactionDetail[]) {
    if (!history.length) {
      return;
    }

    const accountSubstrateAddress = getSubstrateAddress(address);

    if (!accountSubstrateAddress) {
      return; // should not happen !
    }

    const savedHistory: TransactionDetail[] = getTransactionHistoryFromLocalStorage(chain, hierarchy, accountSubstrateAddress);

    savedHistory.push(...history);

    updateMeta(accountSubstrateAddress, prepareMetaData(chain, 'history', savedHistory)).catch(console.error);
  }

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
  }, [address, onAction, setShow]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const applySettings = useCallback(async () => {
    const history: TransactionDetail[] = []; /** collects all records to save in the local history at the end */

    try {
      if (!settings.stashId || !api || !tx) {
        return;
      }

      const signer = keyring.getPair(selectedProxyAddress ?? settings.stashId);

      signer.unlock(password);
      setShowWaitScreen(true);

      const ptx = selectedProxy ? api.tx.proxy.proxy(settings.stashId, selectedProxy.proxyType, tx) : tx;
      const { block, failureText, fee, status, txHash } = await signAndSend(api, ptx, signer, settings.stashId);

      const info = {
        action: 'solo_stake_settings',
        // amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: settings.stashId, name },
        status,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      history.push(info);
      setTxInfo({ ...info, api, chain });

      saveHistory(chain, hierarchy, settings.stashId, history);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [settings.stashId, api, tx, selectedProxyAddress, password, selectedProxy, estimatedFee, name, selectedProxyName, chain, hierarchy]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const Controller = useCallback(() => (
    <Grid alignItems='center' container direction='column' justifyContent='center' my='5px'>
      <Typography fontSize='16px' fontWeight={300} textAlign='center'>
        {t<string>('Controller account')}
      </Typography>
      <Identity chain={chain} formatted={newSettings.controllerId} identiconSize={31} style={{ height: '40px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
      <ShortAddress address={newSettings.controllerId} />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
    </Grid>
  ), [chain, newSettings?.controllerId, t]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Solo Staking Settings')}
          withSteps={{ current: 2, total: 2 }}
        />
        {isPasswordError &&
          <Grid color='red' height='30px' m='auto' mt='-10px' width='92%'>
            <Warning fontWeight={400} isBelowInput isDanger theme={theme}>
              {t<string>('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '30px' }}>
          {/* <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
            title={settings.controllerId !== settings.stashId ? t('Stash account') : t('Account holder')}
          /> */}
          {newSettings?.controllerId &&
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
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
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
          title={t('Solo Staking Settings')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Solo Staking Settings')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail newSettings={newSettings} txInfo={txInfo} />
          </Confirmation>)
        }
      </Popup>
    </Motion>
  );
}
