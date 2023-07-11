// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletIdentityIdentityInfo } from '@polkadot/types/lookup';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE } from '@polkadot/util';

import { AccountHolderWithProxy, Motion, ShowBalance, WrongPasswordAlert } from '../../components';
import { useAccountDisplay, useFormatted, useProxies } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { SubTitle } from '../../partials';
import { signAndSend } from '../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../util/utils';
import { DraggableModal } from '../governance/components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../governance/components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../governance/components/SelectProxyModal';
import WaitScreen from '../governance/partials/WaitScreen';
import Confirmation from './partial/Confirmation';
import IdentityTable from './partial/IdentityTable';
import { STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain;
  depositValue: BN;
  identityToSet: DeriveAccountRegistration | null;
  infoParams: PalletIdentityIdentityInfo | null;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  mode: 'Set' | 'Remove' | 'Modify' | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Review({ address, api, chain, depositValue, identityToSet, infoParams, mode, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const name = useAccountDisplay(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const setIdentity = api && api.tx.identity.setIdentity;

  const tx = useMemo(() => {
    if (!setIdentity) {
      return undefined;
    }

    if (mode === 'Set') {
      return setIdentity(infoParams);
    }
  }, [infoParams, mode, setIdentity]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect(() => {
    if (!formatted || !setIdentity) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    void setIdentity(infoParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [api, formatted, infoParams, setIdentity]);

  const onNext = useCallback(async (): Promise<void> => {
    try {
      if (!formatted || !tx || !api) {
        return;
      }

      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setShowWaitScreen(true);

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
        subAction: 'Add/Remove/Modify Identity',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);
      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, chain, estimatedFee, formatted, name, password, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  const handleClose = useCallback(() => setStep(mode === 'Set' || mode === 'Modify' ? STEPS.INDEX : STEPS.PREVIEW), [mode, setStep]);
  const closeConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setRefresh(true);
    setStep(0);
  }, [setRefresh, setStep]);

  return (
    <DraggableModal onClose={handleClose} open={step === STEPS.REVIEW || step === STEPS.PROXY}>
      <Motion style={{ height: '100%' }}>
        {step === STEPS.REVIEW && !showWaitScreen && !showConfirmation &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container my='20px'>
              <SubTitle label={t<string>('Review')} />
            </Grid>
            <AccountHolderWithProxy
              address={address}
              chain={chain}
              selectedProxyAddress={selectedProxyAddress}
              showDivider
              style={{ mt: '-5px' }}
              title={t('Account holder')}
            />
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
            <Grid alignItems='center' container justifyContent='center' m='20px auto 5px' width='92%'>
              <Grid display='inline-flex' item>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Deposit:')}
                </Typography>
                <Grid item lineHeight='22px' pl='5px'>
                  <ShowBalance
                    api={api}
                    balance={depositValue}
                    decimalPoint={4}
                    height={22}
                  />
                </Grid>
              </Grid>
              <Divider orientation='vertical' sx={{ backgroundColor: 'secondary.main', height: '30px', mx: '5px', my: 'auto' }} />
              <Grid display='inline-flex' item>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Fee:')}
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
            </Grid>
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
        {showWaitScreen &&
          <WaitScreen />
        }
        {txInfo && showConfirmation &&
          <Confirmation
            handleClose={closeConfirmation}
            identity={identityToSet}
            status={'set'}
            txInfo={txInfo}
          />
        }
      </Motion>
    </DraggableModal>
  );
}
