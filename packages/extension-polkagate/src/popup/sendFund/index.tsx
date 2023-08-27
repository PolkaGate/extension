// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */


import { Grid, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useApi, useBalances, useChainName, useFullscreen, useTranslation } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import Review from '../manageIdentity/Review';
import SetValues from './SetValues';

export const STEPS = {
  INDEX: 0,
  REVIEW: 1,
  WAIT_SCREEN: 2,
  CONFIRM: 3,
  PROXY: 100
};

export type Mode = 'Set' | 'Clear' | undefined;

export default function SendFund(): React.ReactElement {
  useFullscreen();
  const { address, assetId } = useParams<{ address: string }>();
  const api = useApi(address);
  const { t } = useTranslation();
  const parsedAssetId = assetId === undefined || assetId === 'undefined' ? undefined : parseInt(assetId);

  const balances = useBalances(address, undefined, undefined, undefined, parsedAssetId);
  const theme = useTheme();

  const [identityToSet, setIdentityToSet] = useState<DeriveAccountRegistration | null | undefined>();
  const [step, setStep] = useState<number>(0);
  const [mode, setMode] = useState<Mode>();

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette.background.paper, theme.palette.mode]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette.background.paper, theme.palette.mode]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {

  }, []);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader page='send' />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        {(step === STEPS.INDEX) &&
          <SetValues
            address={address}
            assetId={parsedAssetId}
            balances={balances}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM || step === STEPS.PROXY) &&
          <Review

          />
        }
      </Grid>
    </Grid>
  );
}
