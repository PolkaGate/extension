// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { AnyTuple } from '@polkadot/types/types';

import { Typography } from '@mui/material';
import { getAllAssetsSymbols, getAssetDecimals, getAssetId, getAssetMultiLocation, getAssetsObject, getFeeAssets, getNativeAssets, getNativeAssets, getOtherAssets, getParaId, getRelayChainSymbol, getTNode, hasSupportForAsset, NODE_NAMES } from '@paraspell/sdk'
import { ArrowLeft } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { type BN } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { DecisionButtons } from '../../components';
import { useBalances, useChain, useFullscreen, useTeleport, useTranslation } from '../../hooks';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import HomeLayout from '../components/layout';
import Step1Account from './Step1Account';
import Step2Recipient from './Step2Recipient';
import Step3Amount from './Step3Amount';
import Step4Summary from './Step4Summary';
import StepsRow, { INPUT_STEPS } from './StepsRow';

export const STEPS = {
  INDEX: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROGRESS: 5,
  PROXY: 100,
  SIGN_QR: 200
};

export interface Inputs {
  amount?: string | undefined;
  call?: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  params?: unknown[] | (() => unknown[]);
  recipientAddress?: string | undefined;
  recipientGenesisHashOrParaId?: string | undefined;
  totalFee?: BN;
  recipientChainName?: string | undefined;
}
type StepsType = typeof STEPS[keyof typeof STEPS];

export default function SendFund (): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();
  const { address, assetId, genesisHash } = useParams<{ genesisHash: string, address: string, assetId: string }>();
  const chain = useChain(address);
  const ref = useRef(chain);
  const navigate = useNavigate();
  const teleportState = useTeleport(genesisHash);

  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh, undefined, assetId);

  const [step, setStep] = useState<StepsType>(STEPS.INDEX);
  const [inputStep, setInputStep] = useState<INPUT_STEPS>(INPUT_STEPS.ACCOUNT);
  const [inputs, setInputs] = useState<Inputs>();

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    /** To remove assetId from the url when chain has changed */
    if (!chain) {
      return;
    }

    if (ref.current && ref.current !== chain) {
      navigate(`/send/${address}`);
      setInputs(undefined);
      setStep(STEPS.INDEX); // to return back to index when change is changed on review of confirm page!
    }

    ref.current = chain;
  }, [address, chain, navigate]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    openOrFocusTab(`/accountfs/${address}/${assetId}`, true);
  }, [address, assetId]);

  const onNext = useCallback(() => {
    setInputStep((prevStep) => prevStep + 1);
  }, []);

  const onBack = useCallback(() => {
    setInputStep((prevStep) => prevStep - 1);
  }, []);

  const buttonDisable = useMemo(() =>
    (inputStep === INPUT_STEPS.RECIPIENT && (!inputs?.recipientAddress || inputs?.recipientGenesisHashOrParaId === undefined)) ||
    (inputStep === INPUT_STEPS.AMOUNT && !inputs?.amount) ||
    (inputStep === INPUT_STEPS.SUMMARY && !!inputs?.totalFee)
    , [inputStep, inputs?.amount, inputs?.recipientAddress, inputs?.recipientGenesisHashOrParaId, inputs?.totalFee]);

  return (
    <HomeLayout childrenStyle={{ paddingLeft: '25px', zIndex: 1 }}>
      <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
        {t('Send funds')}
      </Typography>
      <StepsRow inputStep={inputStep} />
      {
        inputStep === INPUT_STEPS.ACCOUNT &&
        <Step1Account />
      }
      {
        inputStep === INPUT_STEPS.RECIPIENT &&
        <Step2Recipient
          assetId={assetId}
          genesisHash={genesisHash}
          setInputs={setInputs}
          teleportState={teleportState}
        />
      }
      {
        inputStep === INPUT_STEPS.AMOUNT &&
        <Step3Amount
          inputs={inputs}
          setInputs={setInputs}
          teleportState={teleportState}
        />
      }
      {
        inputStep === INPUT_STEPS.SUMMARY &&
        <Step4Summary
          inputs={inputs}
          teleportState={teleportState}
        />
      }
      <DecisionButtons
        cancelButton
        direction='horizontal'
        disabled={buttonDisable}
        divider
        onPrimaryClick={onNext}
        onSecondaryClick={onBack}
        primaryBtnText={t('Next')}
        secondaryBtnText={t('Back')}
        secondaryButtonProps={{
          StartIcon: ArrowLeft,
          disabled: inputStep === INPUT_STEPS.ACCOUNT,
          iconVariant: 'Linear',
          style: { width: '15%' }
        }}
        style={{ justifyContent: 'start', margin: '0', marginTop: '32px', width: '79%' }}
      />
    </HomeLayout>
  );
}
