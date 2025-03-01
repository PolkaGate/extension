// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens Remove Delegation review page
 * */

import type { Balance } from '@polkadot/types/interfaces';
import type { Proxy, TxInfo } from '../../../../util/types';
import type { AlreadyDelegateInformation, DelegateInformation } from '..';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AccountHolderWithProxy, Identity, Motion, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../components';
import { useIdentity, useInfo, useTracks, useTranslation } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import DisplayValue from '../../post/castVote/partial/DisplayValue';
import ReferendaTable from '../partial/ReferendaTable';
import TracksList from '../partial/TracksList';
import { STEPS } from '..';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  classicDelegateInformation: DelegateInformation | undefined;
  mixedDelegateInformation: AlreadyDelegateInformation | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  step: number;
  setSelectedTracksLength: React.Dispatch<React.SetStateAction<number | undefined>>;
  setModalHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedProxy: Proxy | undefined;
}

export default function RemoveDelegate({ address, classicDelegateInformation, formatted, mixedDelegateInformation, selectedProxy, setModalHeight, setSelectedTracksLength, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { api, chain, decimal, genesisHash, token } = useInfo(address);
  const { tracks } = useTracks(address);
  const ref = useRef<HTMLDivElement | null>(null);

  const delegateeAddress = classicDelegateInformation
    ? classicDelegateInformation.delegateeAddress
    : mixedDelegateInformation
      ? mixedDelegateInformation.delegatee
      : undefined;

  const delegateeName = useIdentity(genesisHash, delegateeAddress as string | undefined)?.identity?.display;

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const undelegate = api?.tx['convictionVoting']['undelegate'];
  const batch = api?.tx['utility']['batchAll'];

  const delegatedTracks = useMemo(() => {
    if (classicDelegateInformation) {
      return classicDelegateInformation.delegatedTracks;
    }

    if (mixedDelegateInformation) {
      return mixedDelegateInformation.info.map((value) => value.track);
    }

    return undefined;
  }, [classicDelegateInformation, mixedDelegateInformation]);

  const params = useMemo(() => {
    if (!delegatedTracks || delegatedTracks.length === 0) {
      return undefined;
    }

    return delegatedTracks;
  }, [delegatedTracks]);

  useEffect(() => {
    if (ref?.current?.offsetHeight) {
      setModalHeight(ref.current.offsetHeight);
    }
  }, [setModalHeight]);

  useEffect(() => {
    if (!formatted || !undelegate || !params || !batch) {
      return;
    }

    setSelectedTracksLength(params.length);

    if (!api?.call?.['transactionPaymentApi']) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE) as Balance);
    }

    params.length === 1
      ? undelegate(BN_ZERO).paymentInfo(formatted).then((i) => setEstimatedFee(api?.createType('Balance', i?.partialFee) as Balance)).catch(console.error)
      : batch(params.map((param) => undelegate(param))).paymentInfo(formatted).then((i) => setEstimatedFee(api?.createType('Balance', i?.partialFee) as Balance)).catch(console.error);
  }, [api, batch, formatted, params, setSelectedTracksLength, undelegate]);

  const extraInfo = useMemo(() => ({
    action: 'Governance',
    amount: '0',
    fee: String(estimatedFee || 0),
    subAction: 'Remove Delegate',
    to: { address: delegateeAddress, name: delegateeName }
  }), [delegateeAddress, delegateeName, estimatedFee]);

  const tx = useMemo(() => {
    if (!formatted || !undelegate || !params || !batch) {
      return;
    }

    const txList = params.map((param) => undelegate(param));

    return txList.length > 1 ? batch(txList) : txList[0];
  }, [batch, formatted, params, undelegate]);

  const onBackClick = useCallback(() => setStep(STEPS.PREVIEW), [setStep]);

  return (
    <Motion>
      <Grid container ref={ref}>
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          direction='row'
          selectedProxyAddress={selectedProxyAddress}
          style={{ mt: '-5px' }}
          title={t('Account')}
        />
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
        <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t('Delegatee')}
          </Typography>
          <Identity
            api={api}
            chain={chain}
            direction='row'
            formatted={delegateeAddress as string | undefined}
            identiconSize={31}
            showShortAddress
            showSocial={false}
            style={{ maxWidth: '100%', width: 'fit-content' }}
            withShortAddress
          />
        </Grid>
        {classicDelegateInformation &&
          <>
            <DisplayValue title={t('Delegated Value ({{token}})', { replace: { token } })}>
              <Typography fontSize='28px' fontWeight={400}>
                {classicDelegateInformation.delegateAmount}
              </Typography>
            </DisplayValue>
            <DisplayValue title={t('Vote Multiplier')}>
              <Typography fontSize='28px' fontWeight={400}>
                {`${classicDelegateInformation.delegateConviction ? classicDelegateInformation.delegateConviction : 0.1}x`}
              </Typography>
            </DisplayValue>
            <DisplayValue title={t('Number of Referenda Categories')}>
              <Grid container direction='row'>
                <Typography fontSize='28px' fontWeight={400} width='fit-content'>
                  {`${classicDelegateInformation.delegatedTracks.length} of ${tracks?.length ?? 15}`}
                </Typography>
                <TracksList selectedTracks={classicDelegateInformation.delegatedTracks} tracks={tracks} />
              </Grid>
            </DisplayValue>
          </>
        }
        {mixedDelegateInformation &&
          <>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
            <ReferendaTable
              decimal={decimal}
              delegatedInfo={mixedDelegateInformation.info}
              maxTableHeight={180}
              token={token}
              tracks={tracks}
            />
          </>
        }
        <DisplayValue title={t('Fee')}>
          <ShowValue height={20} value={estimatedFee?.toHuman()} />
        </DisplayValue>
        <Grid container item pt='10px'>
          <SignArea2
            address={address as string}
            call={tx}
            disabled={!delegatedTracks || delegatedTracks.length === 0}
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
      </Grid>
    </Motion>
  );
}
