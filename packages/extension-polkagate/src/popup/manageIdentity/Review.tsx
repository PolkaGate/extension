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
import IdentityTable from './partial/IdentityTable';
import { Mode, STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain;
  depositValue: BN;
  identityToSet: DeriveAccountRegistration | null;
  infoParams: PalletIdentityIdentityInfo | null;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  mode: Mode;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Review({ address, api, chain, depositValue, identityToSet, infoParams, mode, setRefresh, setStep, step }: Props): React.ReactElement {
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

  const tx = useMemo(() => {
    if (!setIdentity || !clearIdentity) {
      return undefined;
    }

    if (mode === 'Set' || mode === 'Modify') {
      return setIdentity(infoParams);
    }

    if (mode === 'Clear') {
      return clearIdentity();
    }
  }, [clearIdentity, infoParams, mode, setIdentity]);

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
        from: { address: formatted, name },
        subAction: `${mode} Identity`,
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);
      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, estimatedFee, formatted, mode, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, setStep, tx]);

  const handleClose = useCallback(() => setStep(mode === 'Set' || mode === 'Modify' ? STEPS.INDEX : STEPS.PREVIEW), [mode, setStep]);
  const closeProxy = useCallback(() => setStep(STEPS.REVIEW), [setStep]);
  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    setStep(0);
  }, [setRefresh, setStep]);

  return (
    <DraggableModal onClose={handleClose} open={step === STEPS.REVIEW || step === STEPS.PROXY || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM}>
      <Motion style={{ height: '100%' }}>
        <>
          <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
            <Grid item>
              <Typography fontSize='22px' fontWeight={700}>
                {step === STEPS.REVIEW && (
                  <>
                    {mode === 'Set' && t('Review Identity')}
                    {mode === 'Clear' && t('Clear Identity')}
                    {mode === 'Modify' && t('Modify Identity')}
                  </>
                )}
                {step === STEPS.WAIT_SCREEN && (
                  <>
                    {mode === 'Set' && t('Setting Identity')}
                    {mode === 'Clear' && t('Clearing Identity')}
                    {mode === 'Modify' && t('Modifying Identity')}
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
                {step === STEPS.PROXY && t('Select Proxy')}
              </Typography>
            </Grid>
            <Grid item>
              {step !== STEPS.WAIT_SCREEN && <CloseIcon onClick={step === STEPS.PROXY ? closeProxy : handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />}
            </Grid>
          </Grid>
          {step === STEPS.REVIEW &&
            <>
              {isPasswordError &&
                <WrongPasswordAlert />
              }
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: isPasswordError ? 0 : '10px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Account holder')}
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
              {identityToSet &&
                <>
                  <Typography sx={{ m: '10px auto' }}>
                    {t<string>('Identity')}
                  </Typography>
                  <IdentityTable
                    identity={identityToSet}
                  />
                </>
              }
              {mode === 'Clear' &&
                <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '70px', py: '20px' }}>
                  <Warning
                    fontWeight={400}
                    iconDanger
                    isBelowInput
                    theme={theme}
                  >
                    {t<string>('You are about to clear the on-chain identity for this account.')}
                  </Warning>
                </Grid>
              }
              <DisplayValue title={mode === 'Clear'
                ? t<string>('Deposit that will be released')
                : t<string>('Total Deposit')}
              >
                <ShowBalance
                  api={api}
                  balance={depositValue}
                  decimalPoint={4}
                  height={22}
                />
              </DisplayValue>
              <DisplayValue title={t<string>('Fee')}>
                <ShowBalance
                  api={api}
                  balance={estimatedFee}
                  decimalPoint={4}
                  height={22}
                />
              </DisplayValue>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || name}`}
                onChange={setPassword}
                onPrimaryClick={onNext}
                onSecondaryClick={handleClose}
                primaryBtnText={t<string>('Confirm')}
                proxiedAddress={formatted}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
              />
            </>
          }
          {step === STEPS.PROXY &&
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
          }
          {step === STEPS.WAIT_SCREEN &&
            <WaitScreen />
          }
          {txInfo && step === STEPS.CONFIRM &&
            <Confirmation
              handleClose={closeConfirmation}
              identity={identityToSet}
              status={'set'}
              txInfo={txInfo}
            />
          }
        </>
      </Motion>
    </DraggableModal>
  );
}
