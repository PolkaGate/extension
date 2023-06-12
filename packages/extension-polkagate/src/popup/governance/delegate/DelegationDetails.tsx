// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import { KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN } from '@polkadot/util';

import { Identity, Motion, TwoButtons } from '../../../components';
import { useApi, useChain, useDecimal, useToken, useTracks, useTranslation } from '../../../hooks';
import { Lock } from '../../../hooks/useAccountLocks';
import { BalancesInfo, TxInfo } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import DisplayValue from '../post/castVote/partial/DisplayValue';
import ReferendaTable from './partial/ReferendaTable';
import ModifyDelegate from './modify/ModifyDelegate';
import RemoveDelegate from './RemoveDelegate';
import { AlreadyDelegateInformation, DelegateInformation, STEPS } from '.';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  filteredDelegation: AlreadyDelegateInformation[] | null | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  setStatus: React.Dispatch<React.SetStateAction<'Delegate' | 'Remove' | 'Modify'>>;
  setSelectedTracksLength: React.Dispatch<React.SetStateAction<number | undefined>>;
  lockedAmount: BN | undefined;
  balances: BalancesInfo | undefined;
  accountLocks: Lock[] | null | undefined;
  setDelegateInformation: React.Dispatch<React.SetStateAction<DelegateInformation | undefined>>;
}

interface ArrowsProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function DelegationDetails({ accountLocks, address, balances, filteredDelegation, formatted, lockedAmount, setDelegateInformation, setSelectedTracksLength, setStatus, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const api = useApi(address);
  const chain = useChain(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const { tracks } = useTracks(address);
  const ref = useRef(null);

  const [delegateeIndex, setDelegateeIndex] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<number | undefined>();

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
      console.log('ref.current?.offsetHeight:', ref.current?.offsetHeight)
    }
  }, []);

  const variousDelegation = useMemo(() => {
    if (!filteredDelegation) {
      return;
    }

    const compareArray = filteredDelegation[delegateeIndex].info;

    for (let i = 0; i < compareArray.length - 1; i++) {
      if (compareArray[i].conviction !== compareArray[i + 1].conviction || !compareArray[i].delegatedBalance.eq(compareArray[i + 1].delegatedBalance)) {
        return true;
      }
    }

    return false;
  }, [delegateeIndex, filteredDelegation]);

  const delegateAmountInHuman = useMemo(() =>
    filteredDelegation && !variousDelegation
      ? amountToHuman(filteredDelegation[delegateeIndex].info[0].delegatedBalance, decimal)
      : undefined
    , [decimal, delegateeIndex, variousDelegation, filteredDelegation]);

  const delegatePower = useCallback((conviction: number, delegateAmountBN: BN) => {
    if (conviction === undefined || delegateAmountBN.isZero()) {
      return 0;
    }

    const bn = conviction !== 0.1 ? delegateAmountBN.muln(conviction) : delegateAmountBN.divn(10);

    return Number(amountToHuman(bn, decimal));
  }, [decimal]);

  const classicDelegation: DelegateInformation | undefined = useMemo(() =>
    filteredDelegation && !variousDelegation && delegateAmountInHuman
      ? {
        delegateAmount: delegateAmountInHuman,
        delegateAmountBN: filteredDelegation[delegateeIndex].info[0].delegatedBalance,
        delegateConviction: filteredDelegation[delegateeIndex].info[0].conviction,
        delegatePower: delegatePower(filteredDelegation[delegateeIndex].info[0].conviction, filteredDelegation[0].info[0].delegatedBalance),
        delegatedTracks: filteredDelegation[delegateeIndex].info.map((value) => value.track),
        delegateeAddress: filteredDelegation[delegateeIndex].delegatee
      }
      : undefined
    , [delegateAmountInHuman, delegatePower, filteredDelegation, variousDelegation, delegateeIndex]);

  const delegatedConviction = useMemo(() =>
    filteredDelegation
      ? filteredDelegation[delegateeIndex].info[0].conviction
        ? filteredDelegation[delegateeIndex].info[0].conviction
        : 0.1
      : undefined, [delegateeIndex, filteredDelegation]);

  const Arrows = ({ onNext, onPrevious }: ArrowsProps) => (
    <Grid container justifyContent='space-between' m='10px auto 0'>
      <Grid alignItems='center' container item onClick={onPrevious} sx={{ cursor: 'pointer' }} xs={1}>
        <KeyboardDoubleArrowLeftIcon sx={{ color: 'secondary.light', fontSize: '25px' }} />
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' xs={10}>
        <Grid alignItems='center' container direction='column' justifyContent='center' width='90%'>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Delegate To')}:
          </Typography>
          <Identity
            formatted={filteredDelegation[delegateeIndex].delegatee}
            api={api}
            chain={chain}
            identiconSize={31}
            showSocial={false}
            style={{ maxWidth: '100%', width: 'fit-content' }}
          />
        </Grid>
      </Grid>
      <Grid alignItems='center' container onClick={onNext} sx={{ cursor: 'pointer' }} xs={1}>
        <KeyboardDoubleArrowRightIcon sx={{ color: 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );

  const nextDelegatee = useCallback(() => {
    filteredDelegation && (delegateeIndex === filteredDelegation.length - 1 ? setDelegateeIndex(0) : setDelegateeIndex(delegateeIndex + 1));
  }, [delegateeIndex, filteredDelegation]);

  const previousDelegatee = useCallback(() => {
    filteredDelegation && (delegateeIndex === 0 ? setDelegateeIndex(filteredDelegation.length - 1) : setDelegateeIndex(delegateeIndex - 1));
  }, [delegateeIndex, filteredDelegation]);

  const goModify = useCallback(() => {
    setStep(STEPS.MODIFY);
    setStatus('Modify');
  }, [setStatus, setStep]);

  const goRemove = useCallback(() => {
    setStep(STEPS.REMOVE);
    setStatus('Remove');
  }, [setStatus, setStep]);

  return (
    <Motion style={{ height: '100%' }}>
      {step === STEPS.PREVIEW &&
        <Grid container ref={ref}>
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
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
          {filteredDelegation &&
            (filteredDelegation.length > 1
              ? <Arrows onNext={nextDelegatee} onPrevious={previousDelegatee} />
              : <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '10px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Delegatee')}:
                </Typography>
                <Identity
                  api={api}
                  chain={chain}
                  formatted={filteredDelegation[0].delegatee}
                  identiconSize={31}
                  showSocial={false}
                  style={{ maxWidth: '100%', width: 'fit-content' }}
                />
              </Grid>)
          }
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
          {filteredDelegation && variousDelegation &&
            <Grid container item mb='70px' mt='15px'>
              <ReferendaTable
                decimal={decimal}
                delegatedInfo={filteredDelegation[delegateeIndex].info}
                token={token}
                tracks={tracks}
              />
            </Grid>
          }
          {filteredDelegation && !variousDelegation &&
            <>
              <DisplayValue title={t<string>('Delegated Value ({{token}})', { replace: { token } })} topDivider={false}>
                <Typography fontSize='28px' fontWeight={400}>
                  {delegateAmountInHuman}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Vote Multiplier')}>
                <Typography fontSize='28px' fontWeight={400}>
                  {`${delegatedConviction}x`}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Number of Referenda Categories')}>
                <Typography fontSize='28px' fontWeight={400}>
                  {`${filteredDelegation[delegateeIndex].info.length} of ${tracks?.length ?? 15}`}
                </Typography>
              </DisplayValue>
            </>
          }
          <Grid container item sx={{ '> div': { marginLeft: 0 }, bottom: '35px', position: 'absolute' }}>
            <TwoButtons
              mt='1px'
              onPrimaryClick={goModify}
              onSecondaryClick={goRemove}
              primaryBtnText={t<string>('Modify')}
              secondaryBtnText={t<string>('Remove')}
            />
          </Grid>
        </Grid>
      }
      {(step === STEPS.REMOVE || step === STEPS.PROXY) && filteredDelegation && variousDelegation !== undefined &&
        <RemoveDelegate
          address={address}
          classicDelegateInformation={variousDelegation ? undefined : classicDelegation}
          formatted={formatted}
          mixedDelegateInformation={variousDelegation ? filteredDelegation[delegateeIndex] : undefined}
          modalHeight={modalHeight}
          setSelectedTracksLength={setSelectedTracksLength}
          setStep={setStep}
          setTxInfo={setTxInfo}
          step={step}
        />
      }
      {(step === STEPS.MODIFY || step === STEPS.PROXY) && filteredDelegation && variousDelegation !== undefined &&
        <ModifyDelegate
          accountLocks={accountLocks}
          address={address}
          balances={balances}
          classicDelegateInformation={variousDelegation ? undefined : classicDelegation}
          formatted={formatted}
          lockedAmount={lockedAmount}
          mixedDelegateInformation={variousDelegation ? filteredDelegation[delegateeIndex] : undefined}
          modalHeight={modalHeight}
          setDelegateInformation={setDelegateInformation}
          setSelectedTracksLength={setSelectedTracksLength}
          setStep={setStep}
          setTxInfo={setTxInfo}
          step={step}
        />
      }
    </Motion>
  );
}
