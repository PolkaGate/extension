// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens stake review page
 * */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { AnyTuple } from '@polkadot/types/types';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, ActionContext, AmountFee, FormatBalance, Identity, Infotip, Motion, PasswordUseProxyConfirm, Popup, ShortAddress, WrongPasswordAlert } from '../../../../components';
import { useAccountName, useFormatted, useProxies, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../partials';
import Confirmation from '../../../../partials/Confirmation';
import { signAndSend } from '../../../../util/api';
import { SYSTEM_SUGGESTION_TEXT } from '../../../../util/constants';
import { Proxy, ProxyItem, SoloSettings, TxInfo, ValidatorInfo } from '../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import RewardsDestination from './partials/RewardDestination';
import ShowValidators from './partials/ShowValidators';
import TxDetail from './partials/TxDetail';

interface Props {
  address: string;
  amount: string;
  api: ApiPromise;
  chain: Chain;
  estimatedFee: Balance | undefined;
  settings: SoloSettings,
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  total: BN | undefined;
  params: (string | BN | AccountId | { Account: string; } | undefined)[];
  tx: SubmittableExtrinsicFunction<'promise', AnyTuple>;
  isFirstTimeStaking?: boolean;
  selectedValidators: ValidatorInfo[] | null | undefined;
}

export default function Review({ address, amount, api, chain, estimatedFee, isFirstTimeStaking, params, selectedValidators, setShow, settings, show, total, tx }: Props): React.ReactElement {
  const { t } = useTranslation();
  const proxies = useProxies(api, settings.stashId);
  const name = useAccountName(address);
  const token = useToken(address);
  const formatted = useFormatted(address);
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showSelectedValidators, setShowSelectedValidators] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const goToStakingHome = useCallback(() => {
    setShow(false);

    onAction(`/solo/${address}`);
  }, [address, onAction, setShow]);

  const goToMyAccounts = useCallback(() => {
    setShow(false);

    onAction('/');
  }, [onAction, setShow]);

  const openValidatorsTable = useCallback(() => setShowSelectedValidators(true), []);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const stake = useCallback(async () => {
    try {
      if (!settings.stashId || !tx) {
        return;
      }

      const from = selectedProxyAddress ?? settings.stashId;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

      let batchCall;

      if (isFirstTimeStaking && selectedValidators) {
        const nominated = api.tx.staking.nominate;
        const setController = api.tx.staking.setController;
        const isControllerDeprecated = setController.meta.args.length === 0;
        const ids = selectedValidators.map((v) => v.accountId);
        const txs = [tx(...params), nominated(ids)];

        settings.controllerId !== settings.stashId && !isControllerDeprecated && txs.push(setController(settings.controllerId));
        batchCall = api.tx.utility.batchAll(txs);
      }

      const extrinsic = batchCall || tx(...params);
      const ptx = selectedProxy ? api.tx.proxy.proxy(settings.stashId, selectedProxy.proxyType, extrinsic) : extrinsic;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, ptx, signer, settings.stashId);

      const info = {
        action: 'Solo Staking',
        amount,
        block,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: formatted, name },
        subAction: isFirstTimeStaking && selectedValidators ? 'Stake/Nominate' : 'Stake',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [settings.stashId, settings.controllerId, formatted, tx, selectedProxyAddress, password, isFirstTimeStaking, selectedValidators, api, params, selectedProxy, amount, estimatedFee, name, selectedProxyName, chain]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const Controller = useCallback(() => (
    <Grid alignItems='center' container direction='column' justifyContent='center'>
      <Typography fontSize='16px' fontWeight={300} textAlign='center'>
        {t<string>('Controller account')}
      </Typography>
      <Identity chain={chain} formatted={settings.controllerId} identiconSize={31} style={{ height: '35px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
      <ShortAddress address={settings.controllerId} />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
    </Grid>
  ), [chain, settings?.controllerId, t]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Staking')}
          withSteps={{
            current: 2,
            total: 2
          }}
        />
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <SubTitle label={t('Review')} />
        <Container disableGutters sx={{ px: '30px' }}>
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            showDivider
            style={{ mt: '-5px' }}
            title={settings.controllerId !== settings.stashId ? t('Stash account') : t('Account holder')}
          />
          {settings.controllerId !== settings.stashId &&
            <Controller />
          }
          <AmountFee
            address={address}
            amount={amount}
            fee={estimatedFee}
            label={t('Amount')}
            showDivider
            token={token}
            withFee
          />
          {isFirstTimeStaking
            ? <Grid alignContent='center' container justifyContent='center'>
              <Grid item sx={{ alignSelf: 'center', mr: '8px', width: '60%' }}>
                <Infotip fontSize='13px' iconLeft={-15} iconTop={5} showQuestionMark text={t<string>(SYSTEM_SUGGESTION_TEXT)}>
                  <Typography sx={{ fontWeight: 300 }}>
                    {t('Selected Validators ({{count}})', { replace: { count: selectedValidators?.length } })}
                  </Typography>
                </Infotip>
              </Grid>
              <Grid item onClick={openValidatorsTable} sx={{ cursor: 'pointer', mt: '5px' }} width='8%'>
                <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '27px' }} />
              </Grid>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
              <RewardsDestination settings={settings} />
            </Grid>
            : <AmountFee
              address={address}
              amount={
                <FormatBalance
                  api={api}
                  value={total}
                />
              }
              label={t('Total stake after')}
              style={{ pt: '5px' }}
            />
          }
        </Container>
        <PasswordUseProxyConfirm
          api={api}
          estimatedFee={estimatedFee}
          genesisHash={chain?.genesisHash}
          isPasswordError={isPasswordError}
          label={`${t<string>('Password')} for ${selectedProxyName || name}`}
          onChange={setPassword}
          onConfirmClick={stake}
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
          title={t('Staking')}
        />
        {txInfo && (
          <Confirmation
            headerTitle={t('Staking')}
            onPrimaryBtnClick={goToStakingHome}
            onSecondaryBtnClick={goToMyAccounts}
            primaryBtnText={t('Staking Home')}
            secondaryBtnText={t('My Accounts')}
            showConfirmation={showConfirmation}
            txInfo={txInfo}
          >
            <TxDetail settings={settings} txInfo={txInfo} />
          </Confirmation>)
        }
        {showSelectedValidators && !!selectedValidators?.length &&
          <ShowValidators address={address} api={api} chain={chain} selectedValidators={selectedValidators} setShowSelectedValidators={setShowSelectedValidators} showSelectedValidators={showSelectedValidators} staked={total} />
        }
      </Popup>
    </Motion>
  );
}
