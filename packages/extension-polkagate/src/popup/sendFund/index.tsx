// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AnyTuple } from '@polkadot/types/types';

import { Grid, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useBalances, useChain, useFullscreen, useTranslation } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import InputPage from './InputPage';
import Review from './Review';

export const STEPS = {
  INDEX: 0,
  REVIEW: 1,
  WAIT_SCREEN: 2,
  CONFIRM: 3,
  PROXY: 100
};

export interface Inputs {
  amount: string | undefined;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  params: unknown[] | (() => unknown[]);
  recipientAddress: string | undefined;
  recipientGenesisHashOrParaId: string | undefined;
  totalFee: BN;
  recipientChainName: string | undefined;
}
type StepsType = typeof STEPS[keyof typeof STEPS];
export type Mode = 'Set' | 'Clear' | undefined;

export default function SendFund(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address, assetId } = useParams<{ address: string }>();
  const chain = useChain(address);
  const ref = useRef(chain);
  const history = useHistory();

  const parsedAssetId = assetId === undefined || assetId === 'undefined' ? undefined : parseInt(assetId);
  const balances = useBalances(address, undefined, undefined, undefined, parsedAssetId);

  const [refresh, setRefresh] = useState<boolean>(false);
  const [step, setStep] = useState<StepsType>(STEPS.INDEX);
  const [inputs, setInputs] = useState<Inputs>();

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette.background.paper, theme.palette.mode]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette.background.paper, theme.palette.mode]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    /** To remove assetId from the url when chain has changed */
    if (!chain) {
      return;
    }

    if (ref.current && ref.current !== chain) {
      history.push({
        pathname: `/send/${address}`
      });
      setInputs(undefined);
    }

    ref.current = chain;
  }, [address, chain, history]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader page='send' />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        {(step === STEPS.INDEX) &&
          <InputPage
            address={address}
            assetId={parsedAssetId}
            balances={balances}
            inputs={inputs}
            setInputs={setInputs}
            setStep={setStep}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM || step === STEPS.PROXY) &&
          <Review
            address={address}
            inputs={inputs}
            setRefresh={setRefresh}
            setStep={setStep}
            step={step}
          />
        }
      </Grid>
    </Grid>
  );
}
