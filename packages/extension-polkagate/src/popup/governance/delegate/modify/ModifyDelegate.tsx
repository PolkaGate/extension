// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { Identity, Motion, ShowValue, WrongPasswordAlert } from '../../../../components';
import { useAccountDisplay, useAccountInfo, useApi, useChain, useCurrentBlockNumber, useDecimal, useToken, useTracks, useTranslation } from '../../../../hooks';
import { Lock } from '../../../../hooks/useAccountLocks';
import { ThroughProxy } from '../../../../partials';
import { signAndSend } from '../../../../util/api';
import { BalancesInfo, Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { amountToHuman, amountToMachine, getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../../components/PasswordWithTwoButtonsAndUseProxy';
import DisplayValue from '../../post/castVote/partial/DisplayValue';
import { GOVERNANCE_PROXY } from '../../utils/consts';
import TracksList from '../partial/TracksList';
import { AlreadyDelegateInformation, DelegateInformation, STEPS } from '..';
import Modify from './Modify';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  classicDelegateInformation: DelegateInformation | undefined;
  mixedDelegateInformation: AlreadyDelegateInformation | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  step: number;
  setSelectedTracksLength: React.Dispatch<React.SetStateAction<number | undefined>>;
  lockedAmount: BN | undefined;
  balances: BalancesInfo | undefined;
  accountLocks: Lock[] | null | undefined;
  setDelegateInformation: React.Dispatch<React.SetStateAction<DelegateInformation | undefined>>;
  otherDelegatedTracks: BN[] | undefined;
  setModalHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedProxy: Proxy | undefined;
  proxyItems: ProxyItem[] | undefined;
  setMode: React.Dispatch<React.SetStateAction<ModifyModes>>;
  mode: ModifyModes;
}

export type ModifyModes = 'Modify' | 'ReviewModify';

export default function ModifyDelegate({ accountLocks, address, balances, classicDelegateInformation, formatted, lockedAmount, mixedDelegateInformation, mode, otherDelegatedTracks, proxyItems, selectedProxy, setDelegateInformation, setModalHeight, setMode, setSelectedTracksLength, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const name = useAccountDisplay(address);
  const api = useApi(address);
  const chain = useChain(address);
  const { tracks } = useTracks(address);
  const currentBlock = useCurrentBlockNumber(address);
  const ref = useRef(null);

  const delegateeAddress = classicDelegateInformation
    ? classicDelegateInformation.delegateeAddress
    : mixedDelegateInformation
      ? mixedDelegateInformation.delegatee
      : undefined;
  const delegateeName = useAccountInfo(api, delegateeAddress)?.identity.display;

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [delegateAmount, setDelegateAmount] = useState<string>('0');
  const [conviction, setConviction] = useState<number | undefined>();
  const [selectedTracks, setSelectedTracks] = useState<BN[]>([]);

  const [newSelectedTracks, setNewSelectedTracks] = useState<BN[]>([]);
  const [newDelegateAmount, setNewDelegateAmount] = useState<string>();
  const [newConviction, setNewConviction] = useState<number | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  const undelegate = api && api.tx.convictionVoting.undelegate;
  const delegate = api && api.tx.convictionVoting.delegate;
  const batch = api && api.tx.utility.batchAll;

  const acceptableConviction = useMemo(() => newConviction !== undefined ? newConviction === 0.1 ? 0 : newConviction : conviction === 0.1 ? 0 : conviction, [conviction, newConviction]);

  const delegateAmountBN = useMemo(() => newDelegateAmount ? amountToMachine(newDelegateAmount, decimal) : classicDelegateInformation ? classicDelegateInformation.delegateAmountBN : BN_ZERO, [classicDelegateInformation, decimal, newDelegateAmount]);
  const delegatePower = useMemo(() => {
    if (acceptableConviction === undefined || delegateAmountBN.isZero()) {
      return 0;
    }

    const bn = acceptableConviction !== 0 ? delegateAmountBN.muln(acceptableConviction) : delegateAmountBN.divn(10);

    return Number(amountToHuman(bn, decimal));
  }, [acceptableConviction, decimal, delegateAmountBN]);

  const newDelegateAmountBN = useMemo(() => newDelegateAmount !== delegateAmount ? amountToMachine(newDelegateAmount, decimal) : BN_ZERO, [decimal, delegateAmount, newDelegateAmount]);

  const delegatedTracks = useMemo(() => {
    if (classicDelegateInformation) {
      return classicDelegateInformation.delegatedTracks;
    }

    if (mixedDelegateInformation) {
      return mixedDelegateInformation.info.map((value) => value.track);
    }

    return undefined;
  }, [classicDelegateInformation, mixedDelegateInformation]);

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, [setModalHeight]);

  useEffect(() => {
    conviction === undefined && classicDelegateInformation && setConviction(classicDelegateInformation.delegateConviction);
  }, [classicDelegateInformation, conviction]);

  useEffect(() => {
    if (!delegatedTracks || !classicDelegateInformation) {
      return;
    }

    setNewSelectedTracks(delegatedTracks);
    setSelectedTracks(delegatedTracks);
    setDelegateAmount(classicDelegateInformation.delegateAmount);
    conviction === undefined && setConviction(classicDelegateInformation.delegateConviction);
  }, [classicDelegateInformation, conviction, delegatedTracks]);

  const compareSelectedTracks = useCallback((arrNew: BN[], arrOld: BN[]) => {
    const tracksToAdd = [];
    const tracksToRemove = [];

    arrNew.sort((trackA, trackB) => trackA.gt(trackB) ? -1 : 1);
    arrOld.sort((trackA, trackB) => trackA.gt(trackB) ? -1 : 1);

    if (JSON.stringify(arrNew) !== JSON.stringify(arrOld)) {
      const add = arrNew.filter((newTrack) => !arrOld.find((oldTrack) => oldTrack.eq(newTrack)));
      const remove = arrOld.filter((oldTrack) => !arrNew.find((newTrack) => oldTrack.eq(newTrack)));

      tracksToAdd.push(...add);
      tracksToRemove.push(...remove);
    }

    return tracksToAdd.length !== 0 || tracksToRemove.length !== 0 ? { tracksToAdd, tracksToRemove } : false;
  }, []);

  const txList = useMemo((): SubmittableExtrinsic<'promise', ISubmittableResult>[] | undefined => {
    if (!undelegate || !delegate || !batch) {
      return undefined;
    }

    const modifiedTracks = compareSelectedTracks(newSelectedTracks, selectedTracks);

    const transactions: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

    if (modifiedTracks !== false && modifiedTracks.tracksToRemove) {
      modifiedTracks.tracksToRemove.forEach((track) => transactions.push(undelegate(track)));
    }

    if (!newDelegateAmountBN.isZero() || (newConviction !== undefined && newConviction !== conviction)) {
      const toChangeUpdate = newSelectedTracks.filter((newTracks) => selectedTracks.find((oldTracks) => newTracks.eq(oldTracks)));

      toChangeUpdate.length > 0 && toChangeUpdate.forEach((track) => transactions.push(undelegate(track)));
      toChangeUpdate.length > 0 && toChangeUpdate.forEach((track) => transactions.push(delegate(track, delegateeAddress, acceptableConviction, newDelegateAmountBN.isZero() ? delegateAmountBN : newDelegateAmountBN)));
      modifiedTracks !== false && modifiedTracks.tracksToAdd.forEach((track) => transactions.push(delegate(track, delegateeAddress, acceptableConviction, newDelegateAmountBN.isZero() ? delegateAmountBN : newDelegateAmountBN)));
    } else if (modifiedTracks !== false && modifiedTracks.tracksToAdd) {
      modifiedTracks.tracksToAdd.forEach((track) => transactions.push(delegate(track, delegateeAddress, acceptableConviction, delegateAmountBN)));
    }

    return transactions;
  }, [acceptableConviction, batch, compareSelectedTracks, conviction, delegate, delegateAmountBN, delegateeAddress, newConviction, newDelegateAmountBN, newSelectedTracks, selectedTracks, undelegate]);

  useEffect(() => {
    if (!formatted || !undelegate || !txList || !batch) {
      setEstimatedFee(undefined);

      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    txList.length === 1
      ? txList[0].paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error)
      : batch(txList).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, batch, formatted, txList, undelegate]);

  const modifyDelegate = useCallback(async () => {
    try {
      if (!formatted || !api || !decimal || !txList || !batch) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;

      const signer = keyring.getPair(from);

      signer.unlock(password);
      setDelegateInformation({
        delegateAmount: newDelegateAmount ?? delegateAmount,
        delegateAmountBN: newDelegateAmountBN.isZero() ? delegateAmountBN : newDelegateAmountBN,
        delegateConviction: acceptableConviction,
        delegatedTracks: newSelectedTracks ?? selectedTracks,
        delegatePower,
        delegateeAddress
      });
      setStep(STEPS.WAIT_SCREEN);
      // setSelectedTracksLength(params.length);

      const calls = txList.length > 1 ? batch(txList) : txList[0];
      const mayBeProxiedTx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, calls) : calls;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, mayBeProxiedTx, signer, formatted);

      const info = {
        action: 'Governance',
        amount: newDelegateAmount ?? delegateAmount,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: formatted, name },
        subAction: 'ModifyDelegate',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        to: { address: delegateeAddress, name: delegateeName },
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [acceptableConviction, api, batch, chain, decimal, delegateAmount, delegateAmountBN, delegatePower, delegateeAddress, delegateeName, estimatedFee, formatted, name, newDelegateAmount, newDelegateAmountBN, newSelectedTracks, password, selectedProxy, selectedProxyAddress, selectedProxyName, selectedTracks, setDelegateInformation, setStep, setTxInfo, txList]);

  const backToModify = useCallback(() => setMode('Modify'), []);

  const nextButtonDisabled = useMemo(() => (!newDelegateAmount || newDelegateAmount === delegateAmount) && (newConviction === undefined || conviction === newConviction) && compareSelectedTracks(newSelectedTracks, selectedTracks) === false, [compareSelectedTracks, conviction, delegateAmount, newConviction, newDelegateAmount, newSelectedTracks, selectedTracks]);

  return (
    <Motion>
      {step === STEPS.MODIFY &&
        <Grid container ref={ref}>
          {mode === 'Modify' &&
            <Modify
              accountLocks={accountLocks}
              address={address}
              api={api}
              balances={balances}
              chain={chain}
              conviction={newConviction ?? conviction}
              currentBlock={currentBlock}
              decimal={decimal}
              delegateAmount={newDelegateAmount ?? delegateAmount}
              delegatePower={delegatePower}
              delegatedTracks={delegatedTracks}
              delegateeAddress={delegateeAddress}
              estimatedFee={estimatedFee}
              lockedAmount={lockedAmount}
              nextButtonDisabled={nextButtonDisabled}
              otherDelegatedTracks={otherDelegatedTracks}
              selectedTracks={newSelectedTracks}
              setConviction={setNewConviction}
              setDelegateAmount={setNewDelegateAmount}
              setMode={setMode}
              setSelectedTracks={setNewSelectedTracks}
              setStep={setStep}
              token={token}
              tracks={tracks}
            />
          }
          {mode === 'ReviewModify' &&
            <>
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
                  showShortAddress
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
                  {t<string>('Delegatee')}
                </Typography>
                <Identity
                  api={api}
                  chain={chain}
                  direction='row'
                  formatted={delegateeAddress}
                  identiconSize={31}
                  showShortAddress
                  showSocial={false}
                  style={{ maxWidth: '100%', width: 'fit-content' }}
                  withShortAddress
                />
              </Grid>
              <DisplayValue title={t<string>('Delegated Value ({{token}})', { replace: { token } })}>
                <Typography fontSize='28px' fontWeight={400}>
                  {newDelegateAmount ?? delegateAmount}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Vote Multiplier')}>
                <Typography fontSize='28px' fontWeight={400}>
                  {`${acceptableConviction === 0 ? 0.1 : acceptableConviction}x`}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Number of Referenda Categories')}>
                <Grid container direction='row'>
                  <Typography fontSize='28px' fontWeight={400} width='fit-content'>
                    {`${newSelectedTracks.length ?? selectedTracks.length} of ${tracks?.length ?? 15}`}
                  </Typography>
                  <TracksList selectedTracks={newSelectedTracks ?? selectedTracks} tracks={tracks} />
                </Grid>
              </DisplayValue>
              <DisplayValue title={t<string>('Fee')}>
                <ShowValue height={20} value={estimatedFee?.toHuman()} />
              </DisplayValue>
              <Grid container item pt='10px'>
                <PasswordWithTwoButtonsAndUseProxy
                  chain={chain}
                  isPasswordError={isPasswordError}
                  label={`${t<string>('Password')} for ${selectedProxyName || name}`}
                  onChange={setPassword}
                  onPrimaryClick={modifyDelegate}
                  onSecondaryClick={backToModify}
                  primaryBtnText={t<string>('Confirm')}
                  proxiedAddress={formatted}
                  proxies={proxyItems}
                  proxyTypeFilter={GOVERNANCE_PROXY}
                  selectedProxy={selectedProxy}
                  setIsPasswordError={setIsPasswordError}
                  setStep={setStep}
                />
              </Grid>
            </>
          }
        </Grid>
      }
    </Motion>
  );
}
