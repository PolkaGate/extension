// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletIdentityIdentityInfo } from '@polkadot/types/lookup';
import { Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { useApi, useChain, useFullscreen, useTranslation } from '../../hooks';
import { Header } from '../governance/Header';
import DisplayIdentityInformation from './partial/DisplayIdentityInformation';
import PreviewIdentity from './Preview';
import Review from './Review';
import SetIdentity from './SetIdentity';

export const STEPS = {
  CHECK_SCREEN: 0,
  INDEX: 1,
  PREVIEW: 2,
  MODIFY: 3,
  REMOVE: 4,
  REVIEW: 5,
  WAIT_SCREEN: 6,
  CONFIRM: 7,
  PROXY: 100
};

type SubAccounts = [string, string[]];

export default function ManageIdentity(): React.ReactElement {
  useFullscreen();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);

  const [identity, setIdentity] = useState<DeriveAccountRegistration | null | undefined>();
  const [identityToSet, setIdentityToSet] = useState<DeriveAccountRegistration | null | undefined>();
  const [subAccounts, setSubAccounts] = useState<SubAccounts | null | undefined>();
  const [depositValue, setDepositValue] = useState<BN>(BN_ZERO);
  const [step, setStep] = useState<number>(0);
  const [mode, setMode] = useState<'Set' | 'Remove' | 'Modify'>();

  const basicDepositValue = useMemo(() => api && api.consts.identity.basicDeposit as unknown as BN, [api]);
  const fieldDepositValue = useMemo(() => api && api.consts.identity.fieldDeposit as unknown as BN, [api]);

  useEffect(() => {
    switch (identity) {
      case undefined:
        setStep(0);
        break;
      case null:
        setStep(1);
        break;

      default:
        setStep(2);
        break;
    }
  }, [identity]);

  useEffect(() => {
    if (!address || !api) {
      return;
    }

    api.query.identity.identityOf(address)
      .then((id) => {
        const rawIdentity = id.toHuman();
        const idToSet: DeriveAccountRegistration | null = rawIdentity === null
          ? null
          : {
            display: rawIdentity.info.display.Raw,
            legal: rawIdentity.info.legal.Raw !== 'None' ? rawIdentity.info.legal.Raw : undefined,
            email: rawIdentity.info.email.Raw !== 'None' ? rawIdentity.info.email.Raw : undefined,
            web: rawIdentity.info.web.Raw !== 'None' ? rawIdentity.info.web.Raw : undefined,
            twitter: rawIdentity.info.twitter.Raw !== 'None' ? rawIdentity.info.twitter.Raw : undefined,
            riot: rawIdentity.info.riot.Raw !== 'None' ? rawIdentity.info.riot.Raw : undefined,
            other: { discord: rawIdentity.info.additional.length > 0 ? rawIdentity.info.additional[0][1].Raw : undefined }
          };

        setIdentity(idToSet);
      })
      .catch(console.error);
    // api.derive.accounts.info(address)
    //   .then((id) => {
    //     setIdentity(id.identity.display ? id.identity : null);
    //   })
    //   .catch(console.error);
  }, [address, api]);

  useEffect(() => {
    if (!address || !api || !identity) {
      return;
    }

    api.query.identity.subsOf(address)
      .then((subs) => {
        setSubAccounts(subs.toHuman() as unknown as SubAccounts);
      })
      .catch(console.error);
  }, [address, api, identity]);

  const IdentityCheckProgress = () => {
    return (
      <Grid alignItems='center' container direction='column' height='100%' item justifyContent='center'>
        <CubeGrid col={3} color={theme.palette.secondary.main} row={3} size={200} style={{ opacity: '0.4' }} />
        <Typography pt='15px'>
          {t<string>('Checking account\'s on-chain Identity, please wait...')}
        </Typography>
      </Grid>
    );
  };

  return (
    <Grid bgcolor='#DFDFDF' container item justifyContent='center'>
      <Header />
      <Grid container item justifyContent='center' sx={{ bgcolor: '#F1F1F1', height: 'calc(100vh - 70px)', maxWidth: '840px' }}>
        {step === STEPS.CHECK_SCREEN &&
          <IdentityCheckProgress />
        }
        {(step === STEPS.INDEX || (mode === 'Set' && (step === STEPS.REVIEW || step === STEPS.PROXY))) &&
          <SetIdentity
            api={api}
            basicDeposit={basicDepositValue}
            fieldDeposit={fieldDepositValue}
            identity={identity}
            setDepositValue={setDepositValue}
            setIdentityToSet={setIdentityToSet}
            setMode={setMode}
            setStep={setStep}
            totalDeposit={depositValue}
          />
        }
        {step === STEPS.PREVIEW && identity &&
          <PreviewIdentity
            identity={identity}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.PROXY) &&
          <Review
            address={address}
            api={api}
            chain={chain}
            depositValue={depositValue}
            identityToSet={identityToSet}
            mode={mode}
            setStep={setStep}
            step={step}
          />
        }
      </Grid>
    </Grid>
  );
}
