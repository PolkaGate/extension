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
import { useAccountInfo, useAccountName, useApi, useChain, useDecimal, useProxies, useToken, useTracks, useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import { signAndSend } from '../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../components/SelectProxyModal';
import WaitScreen from '../partials/WaitScreen';
import Confirmation from './Confirmation';
import { DELEGATE_STEPS, DelegateInformation } from '.';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  delegateInformation: DelegateInformation;
  handleClose: () => void;
  estimatedFee: Balance | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
}

export default function Review({ address, delegateInformation, estimatedFee, formatted, handleClose, setStep, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const name = useAccountName(address)
  const { accounts } = useContext(AccountContext);
  const api = useApi(address);
  const chain = useChain(address);
  const proxies = useProxies(api, formatted);
  const ref = useRef(null);
  const tracks = useTracks(address);
  const delegateeName = useAccountInfo(api, delegateInformation.delegateeAddress)?.identity.display;

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [modalHeight, setModalHeight] = useState<number | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const delegate = api && api.tx.convictionVoting.delegate;
  const batch = api && api.tx.utility.batchAll;

  const DisplayValue = ({ children, title, topDivider = true }: { children: React.ReactNode, topDivider?: boolean, title: string }) => {
    return (
      <Grid alignItems='center' container direction='column' justifyContent='center'>
        <Grid item>
          {topDivider && <Divider sx={{ bgcolor: 'secondary.main', height: '2px', my: '5px', width: '170px' }} />}
        </Grid>
        <Grid item>
          <Typography>
            {title}
          </Typography>
        </Grid>
        <Grid fontSize='28px' fontWeight={400} item>
          {children}
        </Grid>
      </Grid>
    );
  };

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const params = useMemo(() =>
    delegateInformation.delegatedTracks.map((track) =>
      [track, delegateInformation.delegateeAddress, delegateInformation.delegateConviction, delegateInformation.delegateAmountBN]
    )
    , [delegateInformation]);

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
      console.log('ref.current?.offsetHeight:', ref.current?.offsetHeight)
    }
  }, []);

  const confirmDelegate = useCallback(async () => {
    try {
      if (!formatted || !delegate || !api || !decimal || !params || !batch) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;

      const signer = keyring.getPair(from);

      signer.unlock(password);

      const txList = params.map((param) => delegate(...param));

      setStep(DELEGATE_STEPS.WAIT_SCREEN);

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

      setStep(DELEGATE_STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [formatted, delegate, api, decimal, params, batch, selectedProxyAddress, password, setStep, selectedProxy, delegateInformation.delegateAmount, delegateInformation.delegateeAddress, estimatedFee, name, selectedProxyName, delegateeName, chain]);

  const backToChooseDelegatee = useCallback(() => setStep(DELEGATE_STEPS.CHOOSE_DELEGATOR), [setStep]);

  return (
    <Motion style={{ height: '100%' }}>
      {step === DELEGATE_STEPS.REVIEW &&
        <Grid container ref={ref}>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '30px', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Delegate from')}:
            </Typography>
            <Identity
              address={address}
              api={api}
              chain={chain}
              identiconSize={31}
              showSocial={false}
              style={{ maxWidth: '100%', width: 'fit-content' }}
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
              {t<string>('Delegate to')}:
            </Typography>
            <Identity
              address={delegateInformation.delegateeAddress}
              api={api}
              chain={chain}
              identiconSize={31}
              showSocial={false}
              style={{ maxWidth: '100%', width: 'fit-content' }}
            />
          </Grid>
          <DisplayValue title={t<string>('Delegated Value ({{token}})', { replace: { token } })}>
            <Typography fontSize='28px' fontWeight={400}>
              {delegateInformation.delegateAmount}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Vote Multiplier')}>
            <Typography fontSize='28px' fontWeight={400}>
              {`${delegateInformation.delegateConviction}x`}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Number of Referenda Categories')}>
            <Typography fontSize='28px' fontWeight={400}>
              {`${delegateInformation.delegatedTracks.length} of ${tracks?.length ?? 15}`}
            </Typography>
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
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
          />
        </Grid>
      }
      {step === DELEGATE_STEPS.WAIT_SCREEN &&
        <WaitScreen />
      }
      {step === DELEGATE_STEPS.CONFIRM &&
        <Confirmation
          address={address}
          allCategoriesLength={tracks?.length}
          delegateInformation={delegateInformation}
          handleClose={handleClose}
          txInfo={txInfo}
        />
      }
      {step === DELEGATE_STEPS.PROXY &&
        <SelectProxyModal
          address={address}
          height={modalHeight}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'Governance', 'NonTransfer']}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
          setStep={setStep}
          nextStep={DELEGATE_STEPS.REVIEW}
        />
      }
    </Motion>
  );
}
