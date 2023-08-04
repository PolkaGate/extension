// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletIdentityIdentityInfo } from '@polkadot/types/lookup';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';

import { Identity, Motion, ShowBalance, Warning, WrongPasswordAlert } from '../../components';
import { useAccountDisplay, useFormatted, useProxies } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { signAndSend } from '../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../util/utils';
import { DraggableModal } from '../governance/components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../governance/components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../governance/components/SelectProxyModal';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import Confirmation from './partial/Confirmation';
import DisplaySubId from './partial/DisplaySubId';
import IdentityTable from './partial/IdentityTable';
import { Mode, STEPS, SubIdAccountsToSubmit, SubIdsParams } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain;
  depositValue: BN;
  identityToSet: DeriveAccountRegistration | null | undefined;
  infoParams: PalletIdentityIdentityInfo | null | undefined;
  subIdsParams: SubIdsParams | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  mode: Mode;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  parentDisplay: string | undefined;
  selectedRegistrar: string | number | undefined;
  maxFeeAmount: BN | undefined;
  selectedRegistrarName: string | undefined;
}

export default function Review({ address, api, chain, depositValue, identityToSet, infoParams, maxFeeAmount, mode, parentDisplay, selectedRegistrar, selectedRegistrarName, setRefresh, setStep, step, subIdsParams }: Props): React.ReactElement {
  const { t } = useTranslation();
  const name = useAccountDisplay(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const theme = useTheme();

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const setIdentity = api && api.tx.identity.setIdentity;
  const clearIdentity = api && api.tx.identity.clearIdentity;
  const setSubs = api && api.tx.identity.setSubs;
  const requestJudgement = api && api.tx.identity.requestJudgement;
  const cancelRequest = api && api.tx.identity.cancelRequest;

  const subIdsToShow: SubIdAccountsToSubmit | undefined = useMemo(() => {
    if (mode !== 'ManageSubId' || !subIdsParams) {
      return undefined;
    }

    return subIdsParams.map((subs) => ({
      address: subs[0],
      name: subs[1]?.raw as string
    })) as SubIdAccountsToSubmit;
  }, [mode, subIdsParams]);

  const tx = useMemo(() => {
    if (!setIdentity || !clearIdentity || !setSubs || !requestJudgement || !cancelRequest) {
      return undefined;
    }

    if (mode === 'Set' || mode === 'Modify') {
      return setIdentity(infoParams);
    }

    if (mode === 'Clear') {
      return clearIdentity();
    }

    if (mode === 'ManageSubId' && subIdsParams) {
      return setSubs(subIdsParams);
    }

    if (mode === 'RequestJudgement' && selectedRegistrar !== undefined) {
      return requestJudgement(selectedRegistrar, maxFeeAmount);
    }

    if (mode === 'CancelJudgement' && selectedRegistrar !== undefined) {
      return cancelRequest(selectedRegistrar);
    }

    return undefined;
  }, [cancelRequest, clearIdentity, infoParams, maxFeeAmount, mode, requestJudgement, selectedRegistrar, setIdentity, setSubs, subIdsParams]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect(() => {
    if (!formatted || !tx) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    void tx.paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [api, formatted, tx]);

  const onNext = useCallback(async (): Promise<void> => {
    try {
      if (!formatted || !tx || !api) {
        return;
      }

      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(STEPS.WAIT_SCREEN);

      const decidedTx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, decidedTx, signer, selectedProxy?.delegate ?? formatted);

      const info = {
        action: 'Manage Identity',
        block: block || 0,
        chain,
        date: Date.now(),
        failureText,
        fee: fee || String(estimatedFee || 0),
        from: { address: String(formatted), name },
        subAction: `${mode} Identity`,
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(String(from), info);
      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, estimatedFee, formatted, mode, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, setStep, tx]);

  const handleClose = useCallback(() => {
    setStep(mode === 'Set' || mode === 'Modify'
      ? STEPS.INDEX
      : mode === 'ManageSubId'
        ? STEPS.MANAGESUBID
        : mode === 'RequestJudgement' || mode === 'CancelJudgement'
          ? STEPS.JUDGEMENT
          : STEPS.PREVIEW);
  }, [mode, setStep]);

  const closeSelectProxy = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.CHECK_SCREEN);
  }, [setRefresh, setStep]);

  return (
    <Motion style={{ height: '100%', paddingInline: '10%', width: '100%' }}>
      <>
        <Grid container py='20px'>
          <Typography fontSize='32px' fontWeight={700}>
            {(step === STEPS.REVIEW || step === STEPS.PROXY) && (
              <>
                {mode === 'Set' && t('Review Identity')}
                {mode === 'Clear' && t('Clear Identity')}
                {mode === 'Modify' && t('Modify Identity')}
                {mode === 'ManageSubId' && t('Review Sub-identity(ies)')}
                {mode === 'RequestJudgement' && t('Review Request Judgement')}
                {mode === 'CancelJudgement' && t('Review Cancel Judgement')}
              </>
            )}
            {step === STEPS.WAIT_SCREEN && (
              <>
                {mode === 'Set' && t('Setting Identity')}
                {mode === 'Clear' && t('Clearing Identity')}
                {mode === 'Modify' && t('Modifying Identity')}
                {mode === 'ManageSubId' && t('Setting Sub-identity(ies)')}
                {mode === 'RequestJudgement' && t('Requesting Request Judgement')}
                {mode === 'CancelJudgement' && t('Canceling Judgement')}
              </>
            )}
            {step === STEPS.CONFIRM && mode === 'Set' && (
              txInfo?.success ? t('Identity Set') : t('Identity Setup Failed')
            )}
            {step === STEPS.CONFIRM && mode === 'Modify' && (
              txInfo?.success ? t('Identity Modified') : t('Identity Modification Failed')
            )}
            {step === STEPS.CONFIRM && mode === 'Clear' && (
              txInfo?.success ? t('Identity Cleared') : t('Identity Clearing Failed')
            )}
            {step === STEPS.CONFIRM && mode === 'ManageSubId' && (
              txInfo?.success ? t('Sub-identity(ies) created') : t('Sub-identity(ies) creation failed')
            )}
            {step === STEPS.CONFIRM && mode === 'RequestJudgement' && (
              txInfo?.success ? t('Request Judgement Sent') : t('Request Judgement failed')
            )}
            {step === STEPS.CONFIRM && mode === 'CancelJudgement' && (
              txInfo?.success ? t('Judgement Canceled') : t('Cancel Judgement failed')
            )}
          </Typography>
        </Grid>
        {(step === STEPS.REVIEW || step === STEPS.PROXY) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {mode === 'ManageSubId'
                    ? t<string>('Parent account')
                    : t<string>('Account holder')}
                </Typography>
                <Identity
                  address={address}
                  api={api}
                  chain={chain}
                  direction='row'
                  identiconSize={31}
                  showSocial={false}
                  style={{ maxWidth: '100%', width: 'fit-content' }}
                  withShortAddress
                />
              </Grid>
              {selectedProxyAddress &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={selectedProxyAddress} chain={chain} />
                </Grid>
              }
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
              {identityToSet && (mode === 'Set' || mode === 'Modify') &&
                <>
                  <Typography sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                    {t<string>('Identity')}
                  </Typography>
                  <IdentityTable
                    identity={identityToSet}
                    style={{ width: '75%' }}
                  />
                </>
              }
              {(mode === 'Clear' || (subIdsToShow && subIdsToShow.length === 0)) &&
                <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, height: '70px', py: '20px' }}>
                  <Warning
                    fontWeight={400}
                    iconDanger
                    isBelowInput
                    theme={theme}
                  >
                    {mode === 'Clear'
                      ? t<string>('You are about to clear the on-chain identity for this account.')
                      : t<string>('You are about to clear the on-chain sub-identity(ies) for this account.')
                    }
                  </Warning>
                </Grid>
              }
              {mode === 'ManageSubId' && subIdsToShow && subIdsToShow.length > 0 && parentDisplay &&
                <Grid container item>
                  <Typography fontSize='14px' fontWeight={400} textAlign='center' width='100%'>
                    {t<string>('Sub-identity(ies)')}
                  </Typography>
                  <Grid container gap='10px' item sx={{ height: 'fit-content', maxHeight: '250px', overflow: 'hidden', overflowY: 'scroll' }}>
                    {subIdsToShow.map((subs, index) => (
                      <DisplaySubId
                        key={index}
                        noButtons
                        parentName={parentDisplay}
                        subIdInfo={subs}
                      />))}
                  </Grid>
                </Grid>
              }
              {mode === 'RequestJudgement' &&
                <Grid container direction='column' item>
                  <Typography fontSize='16px' fontWeight={400} textAlign='center' width='100%'>
                    {t<string>('Registrar')}
                  </Typography>
                  <Typography fontSize='28px' fontWeight={400} textAlign='center' width='100%'>
                    {selectedRegistrarName}
                  </Typography>
                </Grid>
              }
              {mode === 'CancelJudgement' &&
                <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, height: '70px', py: '20px' }}>
                  <Warning
                    fontWeight={400}
                    iconDanger
                    isBelowInput
                    theme={theme}
                  >
                    {t<string>('You are about to cancel your judgement request for this account.')}
                  </Warning>
                </Grid>
              }
              {mode !== 'CancelJudgement' &&
                <DisplayValue title={mode === 'Clear'
                  ? t<string>('Deposit that will be released')
                  : mode === 'RequestJudgement'
                    ? t<string>('Registration fee')
                    : t<string>('Total Deposit')}
                >
                  <ShowBalance
                    api={api}
                    balance={mode === 'RequestJudgement'
                      ? maxFeeAmount
                      : depositValue}
                    decimalPoint={4}
                    height={22}
                  />
                </DisplayValue>}
              <DisplayValue title={t<string>('Fee')}>
                <ShowBalance
                  api={api}
                  balance={estimatedFee}
                  decimalPoint={4}
                  height={22}
                />
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
                onChange={setPassword}
                onPrimaryClick={onNext}
                onSecondaryClick={handleClose}
                primaryBtnText={t<string>('Confirm')}
                proxiedAddress={formatted}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                secondaryBtnText={t<string>('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
              />
            </Grid>
          </>
        }
        {step === STEPS.PROXY &&
          <DraggableModal onClose={closeSelectProxy} open={step === STEPS.PROXY}>
            <Grid container item>
              <Grid alignItems='center' container item justifyContent='space-between'>
                <Typography fontSize='22px' fontWeight={700}>
                  {t<string>('Select Proxy')}
                </Typography>
                <Grid item>
                  <CloseIcon onClick={closeSelectProxy} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
                </Grid>
              </Grid>
              <SelectProxyModal
                address={address}
                height={500}
                nextStep={STEPS.REVIEW}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                selectedProxy={selectedProxy}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
              />
            </Grid>
          </DraggableModal>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            SubIdentityAccounts={subIdsToShow}
            handleClose={closeConfirmation}
            identity={identityToSet}
            maxFeeAmount={maxFeeAmount}
            selectedRegistrarName={selectedRegistrarName}
            status={mode}
            txInfo={txInfo}
          />
        }
      </>
    </Motion>
  );
}
