// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { AccountContext, Identity, Motion, ShowValue, WrongPasswordAlert } from '../../../components';
import { useAccountInfo, useAccountName, useApi, useChain, useDecimal, useToken, useTracks, useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import { signAndSend } from '../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../components/PasswordWithTwoButtonsAndUseProxy';
import DisplayValue from '../post/castVote/partial/DisplayValue';
import TracksList from './partial/tracksList';
import { DelegateInformation, STEPS } from '.';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  delegateInformation: DelegateInformation;
  handleClose: () => void;
  estimatedFee: Balance | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  setModalHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedProxy: Proxy | undefined;
  proxyItems: ProxyItem[] | undefined;
}

export default function Review({ address, delegateInformation, estimatedFee, formatted, proxyItems, selectedProxy, setModalHeight, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const name = useAccountName(address);
  const api = useApi(address);
  const chain = useChain(address);
  const ref = useRef(null);
  const { tracks } = useTracks(address);
  const delegateeName = useAccountInfo(api, delegateInformation.delegateeAddress)?.identity.display;
  const { accounts } = useContext(AccountContext);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const delegate = api && api.tx.convictionVoting.delegate;
  const batch = api && api.tx.utility.batchAll;

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, [setModalHeight]);

  const params = useMemo(() =>
    delegateInformation.delegatedTracks.map((track) =>
      [track, delegateInformation.delegateeAddress, delegateInformation.delegateConviction, delegateInformation.delegateAmountBN]
    ), [delegateInformation]);

  const confirmDelegate = useCallback(async () => {
    try {
      if (!formatted || !delegate || !api || !decimal || !params || !batch) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;

      const signer = keyring.getPair(from);

      signer.unlock(password);

      const txList = params.map((param) => delegate(...param));

      setStep(STEPS.WAIT_SCREEN);

      const calls = txList.length > 1 ? batch(txList) : txList[0];
      const mayBeProxiedTx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, calls) : calls;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, mayBeProxiedTx, signer, formatted);

      const info = {
        action: 'Governance',
        amount: delegateInformation.delegateAmount,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: formatted, name },
        subAction: 'Delegate',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        to: { address: delegateInformation.delegateeAddress, name: delegateeName },
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, batch, chain, decimal, delegate, delegateInformation.delegateAmount, delegateInformation.delegateeAddress, delegateeName, estimatedFee, formatted, name, params, password, selectedProxy, selectedProxyAddress, selectedProxyName, setStep, setTxInfo]);

  const backToChooseDelegatee = useCallback(() => setStep(STEPS.CHOOSE_DELEGATOR), [setStep]);

  return (
    <Motion style={{ height: '100%' }}>
      {step === STEPS.REVIEW &&
        <Grid container ref={ref}>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: isPasswordError ? 0 : '10px', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Delegate from')}
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
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Delegate to')}
            </Typography>
            <Identity
              address={delegateInformation.delegateeAddress}
              api={api}
              chain={chain}
              direction='row'
              identiconSize={31}
              showSocial={false}
              style={{ maxWidth: '100%', width: 'fit-content' }}
              withShortAddress
            />
          </Grid>
          <DisplayValue title={t<string>('Delegated Value ({{token}})', { replace: { token } })}>
            <Typography fontSize='28px' fontWeight={400}>
              {delegateInformation.delegateAmount}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Vote Multiplier')}>
            <Typography fontSize='28px' fontWeight={400}>
              {`${delegateInformation.delegateConviction ? delegateInformation.delegateConviction : 0.1}x`}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Number of Referenda Categories')}>
            <Grid container direction='row'>
              <Typography fontSize='28px' fontWeight={400} width='fit-content'>
                {`${delegateInformation.delegatedTracks.length} of ${tracks?.length ?? 15}`}
              </Typography>
              <TracksList selectedTracks={delegateInformation.delegatedTracks} tracks={tracks} />
            </Grid>
          </DisplayValue>
          <DisplayValue title={t<string>('Fee')}>
            <ShowValue height={20} value={estimatedFee?.toHuman()} />
          </DisplayValue>
          <PasswordWithTwoButtonsAndUseProxy
            chain={chain}
            isPasswordError={isPasswordError}
            label={`${t<string>('Password')} for ${selectedProxyName || name}`}
            onChange={setPassword}
            onPrimaryClick={confirmDelegate}
            onSecondaryClick={backToChooseDelegatee}
            primaryBtnText={t<string>('Confirm')}
            proxiedAddress={formatted}
            proxies={proxyItems}
            proxyTypeFilter={['Any']}
            selectedProxy={selectedProxy}
            setIsPasswordError={setIsPasswordError}
            setStep={setStep}
          />
        </Grid>
      }
    </Motion>
  );
}
