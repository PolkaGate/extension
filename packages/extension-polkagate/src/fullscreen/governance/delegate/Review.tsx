// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens Delegate review page
 * */

import type { Balance } from '@polkadot/types/interfaces';
import type { Proxy, TxInfo } from '../../../util/types';
import type { DelegateInformation } from '.';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Identity, Motion, ShowValue, SignArea2, WrongPasswordAlert } from '../../../components';
import { useIdentity, useInfo, useTracks, useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import { PROXY_TYPE } from '../../../util/constants';
import DisplayValue from '../post/castVote/partial/DisplayValue';
import TracksList from './partial/TracksList';
import { STEPS } from '.';

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
}

export default function Review({ address, delegateInformation, estimatedFee, selectedProxy, setModalHeight, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, chain, genesisHash, token } = useInfo(address);
  const ref = useRef(null);
  const { tracks } = useTracks(address);
  const delegateeName = useIdentity(genesisHash, delegateInformation.delegateeAddress)?.identity?.display;

  const [isPasswordError, setIsPasswordError] = useState(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const delegate = api?.tx['convictionVoting']['delegate'];
  const batch = api?.tx['utility']['batchAll'];

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, [setModalHeight]);

  const params = useMemo(() =>
    delegateInformation.delegatedTracks.map((track) =>
      [track, delegateInformation.delegateeAddress, delegateInformation.delegateConviction, delegateInformation.delegateAmountBN]
    ), [delegateInformation]);

  const tx = useMemo(() => {
    if (!delegate || !params || !batch) {
      return;
    }

    const txList = params.map((param) => delegate(...param));
    const calls = txList.length > 1 ? batch(txList) : txList[0];

    return calls;
  }, [batch, delegate, params]);

  const extraInfo = useMemo(() => ({
    action: 'Governance',
    amount: delegateInformation.delegateAmount,
    fee: String(estimatedFee || 0),
    subAction: 'Delegate',
    to: { address: delegateInformation.delegateeAddress, name: delegateeName }
  }), [delegateInformation, delegateeName, estimatedFee]);

  const onBackClick = useCallback(() => setStep(STEPS.CHOOSE_DELEGATOR), [setStep]);

  return (
    <Motion style={{ height: '100%' }}>
      <Grid container ref={ref}>
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
            {t('Delegate to')}
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
        <DisplayValue title={t('Delegated Value ({{token}})', { replace: { token } })}>
          <Typography fontSize='28px' fontWeight={400}>
            {delegateInformation.delegateAmount}
          </Typography>
        </DisplayValue>
        <DisplayValue title={t('Vote Multiplier')}>
          <Typography fontSize='28px' fontWeight={400}>
            {`${delegateInformation.delegateConviction ? delegateInformation.delegateConviction : 0.1}x`}
          </Typography>
        </DisplayValue>
        <DisplayValue title={t('Number of Referenda Categories')}>
          <Grid container direction='row'>
            <Typography fontSize='28px' fontWeight={400} width='fit-content'>
              {`${delegateInformation.delegatedTracks.length} of ${tracks?.length ?? 15}`}
            </Typography>
            <TracksList selectedTracks={delegateInformation.delegatedTracks} tracks={tracks} />
          </Grid>
        </DisplayValue>
        <DisplayValue title={t('Fee')}>
          <ShowValue height={20} value={estimatedFee?.toHuman()} />
        </DisplayValue>
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
    </Motion>
  );
}
