// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens Modify Delegate review page
 * */

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Lock } from '../../../../hooks/useAccountLocks';
import type { BalancesInfo, Proxy, TxInfo } from '../../../../util/types';
import type { AlreadyDelegateInformation, DelegateInformation } from '..';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { Identity, Motion, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../components';
import { useCurrentBlockNumber, useIdentity, useInfo, useTracks, useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import { PROXY_TYPE } from '../../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../../util/utils';
import DisplayValue from '../../post/castVote/partial/DisplayValue';
import TracksList from '../partial/TracksList';
import { STEPS } from '..';
import Modify from './Modify';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  classicDelegateInformation: DelegateInformation | undefined;
  mixedDelegateInformation: AlreadyDelegateInformation | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  step: number;
  lockedAmount: BN | undefined;
  balances: BalancesInfo | undefined;
  accountLocks: Lock[] | null | undefined;
  setDelegateInformation: React.Dispatch<React.SetStateAction<DelegateInformation | undefined>>;
  otherDelegatedTracks: BN[] | undefined;
  setModalHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedProxy: Proxy | undefined;
  setMode: React.Dispatch<React.SetStateAction<ModifyModes>>;
  mode: ModifyModes;
}

export type ModifyModes = 'Modify' | 'ReviewModify';

export default function ModifyDelegate({ accountLocks, address, balances, classicDelegateInformation, formatted, lockedAmount, mixedDelegateInformation, mode, otherDelegatedTracks, selectedProxy, setDelegateInformation, setModalHeight, setMode, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, chain, decimal, genesisHash, token } = useInfo(address);
  const { tracks } = useTracks(address);
  const currentBlock = useCurrentBlockNumber(address);
  const ref = useRef(null);

  const delegateeAddress = classicDelegateInformation
    ? classicDelegateInformation.delegateeAddress
    : mixedDelegateInformation
      ? mixedDelegateInformation.delegatee
      : undefined;
  const delegateeName = useIdentity(genesisHash, delegateeAddress)?.identity?.display;

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [delegateAmount, setDelegateAmount] = useState<string>('0');
  const [conviction, setConviction] = useState<number | undefined>();
  const [selectedTracks, setSelectedTracks] = useState<BN[]>([]);

  const [newSelectedTracks, setNewSelectedTracks] = useState<BN[]>([]);
  const [newDelegateAmount, setNewDelegateAmount] = useState<string>();
  const [newConviction, setNewConviction] = useState<number | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const undelegate = api?.tx['convictionVoting']['undelegate'];
  const delegate = api?.tx['convictionVoting']['delegate'];
  const batch = api?.tx['utility']['batchAll'];

  const acceptableConviction = useMemo(() =>
    newConviction !== undefined
      ? newConviction === 0.1
        ? 0
        : newConviction
      : conviction === 0.1
        ? 0
        : conviction
    , [conviction, newConviction]);

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
      // @ts-ignore
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

    if (!api?.call?.['transactionPaymentApi']) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    txList.length === 1
      ? txList[0].paymentInfo(formatted).then((i) => setEstimatedFee(api?.createType('Balance', i?.partialFee))).catch(console.error)
      : batch(txList).paymentInfo(formatted).then((i) => setEstimatedFee(api?.createType('Balance', i?.partialFee))).catch(console.error);
  }, [api, batch, formatted, txList, undelegate]);

  const extraInfo = useMemo(() => ({
    action: 'Governance',
    amount: newDelegateAmount ?? delegateAmount,
    fee: String(estimatedFee || 0),
    subAction: 'Modify Delegate',
    to: { address: delegateeAddress, name: delegateeName }
  }), [delegateAmount, delegateeAddress, delegateeName, estimatedFee, newDelegateAmount]);

  useEffect(() => {
    console.log('resets');
    setDelegateInformation({
      delegateAmount: newDelegateAmount ?? delegateAmount,
      delegateAmountBN: newDelegateAmountBN.isZero() ? delegateAmountBN : newDelegateAmountBN,
      delegatePower,
      delegateConviction: acceptableConviction,
      delegatedTracks: newSelectedTracks ?? selectedTracks,
      delegateeAddress
    });
  }, [acceptableConviction, delegateAmount, delegateAmountBN, delegatePower, delegateeAddress, newDelegateAmount, newDelegateAmountBN, newSelectedTracks, selectedTracks, setDelegateInformation]);

  const tx = useMemo(() => {
    if (!txList || !batch) {
      return;
    }

    return txList.length > 1 ? batch(txList) : txList[0];
  }, [batch, txList]);

  const onBackClick = useCallback(() => setMode('Modify'), [setMode]);

  const nextButtonDisabled = useMemo(() => (!newDelegateAmount || newDelegateAmount === delegateAmount) && (newConviction === undefined || conviction === newConviction) && compareSelectedTracks(newSelectedTracks, selectedTracks) === false, [compareSelectedTracks, conviction, delegateAmount, newConviction, newDelegateAmount, newSelectedTracks, selectedTracks]);

  return (
    <Motion>
      <Grid container ref={ref}>
        {mode === 'Modify' &&
          <Modify
            accountLocks={accountLocks}
            address={address}
            api={api}
            balances={balances}
            chain={chain as any}
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
                {t('Delegate from')}
              </Typography>
              <Identity
                address={address}
                api={api}
                chain={chain as any}
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
                <ThroughProxy address={selectedProxyAddress} chain={chain as any} />
              </Grid>
            }
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
            <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t('Delegatee')}
              </Typography>
              <Identity
                api={api}
                chain={chain as any}
                direction='row'
                formatted={delegateeAddress}
                identiconSize={31}
                showShortAddress
                showSocial={false}
                style={{ maxWidth: '100%', width: 'fit-content' }}
                withShortAddress
              />
            </Grid>
            <DisplayValue title={t('Delegated Value ({{token}})', { replace: { token } })}>
              <Typography fontSize='28px' fontWeight={400}>
                {newDelegateAmount ?? delegateAmount}
              </Typography>
            </DisplayValue>
            <DisplayValue title={t('Vote Multiplier')}>
              <Typography fontSize='28px' fontWeight={400}>
                {`${acceptableConviction === 0 ? 0.1 : acceptableConviction}x`}
              </Typography>
            </DisplayValue>
            <DisplayValue title={t('Number of Referenda Categories')}>
              <Grid container direction='row'>
                <Typography fontSize='28px' fontWeight={400} width='fit-content'>
                  {`${newSelectedTracks.length ?? selectedTracks.length} of ${tracks?.length ?? 15}`}
                </Typography>
                <TracksList selectedTracks={newSelectedTracks ?? selectedTracks} tracks={tracks} />
              </Grid>
            </DisplayValue>
            <DisplayValue title={t('Fee')}>
              <ShowValue height={20} value={estimatedFee?.toHuman()} />
            </DisplayValue>
            <Grid container item pt='10px'>
              <SignArea2
                address={address}
                call={tx}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onBackClick}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
                secondaryBtnText={t('Back')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
              />
            </Grid>
          </>
        }
      </Grid>
    </Motion>
  );
}
