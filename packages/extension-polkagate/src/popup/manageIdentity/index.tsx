// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Data } from '@polkadot/types';
import type { PalletIdentityIdentityInfo } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO, u8aToString } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useApi, useChain, useFullscreen, useTranslation } from '../../hooks';
import { Header } from '../governance/Header';
import PreviewIdentity from './Preview';
import Review from './Review';
import SetIdentity from './SetIdentity';
import SetSubId from './SetSubId';

export const STEPS = {
  CHECK_SCREEN: 0,
  INDEX: 1,
  PREVIEW: 2,
  MODIFY: 3,
  REMOVE: 4,
  MANAGESUBID: 5,
  REVIEW: 6,
  WAIT_SCREEN: 7,
  CONFIRM: 8,
  PROXY: 100
};

type SubAccounts = [string, string[]];
export type Mode = 'Set' | 'Clear' | 'Modify' | 'ManageSubId' | undefined;
export type SubIdAccountsToSubmit = { address: string | undefined; name: string | undefined; status: 'current' | 'new' | 'remove' }[];
export type SubIdsParams = (string | Data | undefined)[][] | undefined;

function getRawValue(value: Data) {
  const text = u8aToString(value.asRaw.toU8a(true));

  return text === ''
    ? undefined
    : text;
}

export function setData(value: string | undefined): Data {
  return value
    ? { ['raw']: value }
    : { ['none']: null };
}

export default function ManageIdentity(): React.ReactElement {
  useFullscreen();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);

  const [identity, setIdentity] = useState<DeriveAccountRegistration | null | undefined>();
  const [identityToSet, setIdentityToSet] = useState<DeriveAccountRegistration | null | undefined>();
  const [infoParams, setInfoParams] = useState<PalletIdentityIdentityInfo | null | undefined>();
  const [subIdsParams, setSubIdsParams] = useState<SubIdsParams | undefined>();
  const [subAccounts, setSubAccounts] = useState<{ address: string, name: string }[] | null | undefined>();
  const [depositValue, setDepositValue] = useState<BN>(BN_ZERO);
  const [fetching, setFetching] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [mode, setMode] = useState<Mode>();

  const basicDepositValue = useMemo(() => api && api.consts.identity.basicDeposit as unknown as BN, [api]);
  const fieldDepositValue = useMemo(() => api && api.consts.identity.fieldDeposit as unknown as BN, [api]);

  const fetchIdentity = useCallback(() => {
    setFetching(true);
    setIdentity(undefined);
    setSubAccounts(undefined);

    api.query.identity.identityOf(address)
      .then((id) => {
        if (id.isSome) {
          const { info } = id.unwrap();

          const idToSet: DeriveAccountRegistration | null = {
            display: getRawValue(info.display),
            legal: getRawValue(info.legal),
            email: getRawValue(info.email),
            web: getRawValue(info.web),
            twitter: getRawValue(info.twitter),
            riot: getRawValue(info.riot),
            other: { discord: info.additional.length > 0 ? getRawValue(info.additional[0][1]) : undefined }
          };

          setIdentity(idToSet);
        } else {
          setIdentity(null);
        }

        setRefresh(false);
        setFetching(false);
      })
      .catch(console.error);
  }, [address, api?.query?.identity]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    if (identityToSet === undefined) {
      return;
    }

    if (identityToSet === null) {
      setInfoParams(null);

      return;
    }

    setInfoParams({
      additional: identityToSet.other?.discord ? [[{ raw: 'Discord' }, { raw: identityToSet.other?.discord }]] : [],
      display: { ['raw']: identityToSet?.display },
      email: setData(identityToSet?.email),
      legal: setData(identityToSet?.legal),
      riot: setData(identityToSet?.riot),
      twitter: setData(identityToSet?.twitter),
      web: setData(identityToSet?.web)
    });
  }, [identityToSet]);

  useEffect(() => {
    switch (identity) {
      case undefined:
        setStep(0);
        break;
      case null:
        setMode('Set');
        setStep(1);
        break;

      default:
        subAccounts !== undefined && setStep(2);
        break;
    }
  }, [identity, subAccounts]);

  useEffect(() => {
    if (!address || !api) {
      return;
    }

    fetchIdentity();
  }, [address, api, fetchIdentity]);

  useEffect(() => {
    if (!address || !api || !(refresh && !fetching)) {
      return;
    }

    fetchIdentity();
  }, [address, api, fetchIdentity, fetching, identity, refresh]);

  useEffect(() => {
    const fetchSubAccounts = async () => {
      if (!address || !api || !identity) {
        return;
      }

      try {
        const subs = await api.query.identity.subsOf(address);
        const subAccs = subs.toHuman() as unknown as SubAccounts;

        if (subAccs[1].length > 0) {
          const subAccountsAndNames = await Promise.all(
            subAccs[1].map(async (subAddr) => {
              const subsNameFetched = await api.query.identity.superOf(subAddr);
              const subsNameToHuman = subsNameFetched.toHuman();
              const subName = subsNameToHuman[1].Raw as unknown as string;

              return { address: subAddr, name: subName };
            })
          );

          setSubAccounts(subAccountsAndNames);
        } else {
          setSubAccounts(null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubAccounts().catch(console.error);
  }, [address, api, identity]);

  useEffect(() => {
    if (!basicDepositValue || !fieldDepositValue || mode === 'ManageSubId') {
      return;
    }

    const totalDeposit = basicDepositValue.add(
      mode !== 'Clear'
        ? identityToSet?.other?.discord
          ? fieldDepositValue
          : BN_ZERO
        : identity?.other?.discord
          ? fieldDepositValue
          : BN_ZERO);

    setDepositValue(totalDeposit);
  }, [basicDepositValue, fieldDepositValue, identity, identityToSet?.other?.discord, setDepositValue, mode]);

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
      <Grid container item justifyContent='center' sx={{ bgcolor: '#F1F1F1', height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        {step === STEPS.CHECK_SCREEN &&
          <IdentityCheckProgress />
        }
        {(step === STEPS.INDEX || (step === STEPS.MODIFY && mode === 'Modify')) &&
          <SetIdentity
            api={api}
            identity={identity}
            identityToSet={identityToSet}
            mode={mode}
            setIdentityToSet={setIdentityToSet}
            setMode={setMode}
            setStep={setStep}
            totalDeposit={depositValue}
          />
        }
        {step === STEPS.PREVIEW && identity &&
          <PreviewIdentity
            identity={identity}
            setIdentityToSet={setIdentityToSet}
            setMode={setMode}
            setStep={setStep}
            subIdAccounts={subAccounts}
          />
        }
        {step === STEPS.MANAGESUBID && identity?.display &&
          <SetSubId
            api={api}
            mode={mode}
            parentDisplay={identity.display}
            setDepositValue={setDepositValue}
            setMode={setMode}
            setStep={setStep}
            setSubIdsParams={setSubIdsParams}
            subIdAccounts={subAccounts}
            subIdsParams={subIdsParams}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM || step === STEPS.PROXY) &&
          <Review
            address={address}
            api={api}
            chain={chain}
            depositValue={depositValue}
            identityToSet={identityToSet}
            infoParams={infoParams}
            mode={mode}
            parentDisplay={identity?.display}
            setRefresh={setRefresh}
            setStep={setStep}
            step={step}
            subIdsParams={subIdsParams}
          />
        }
      </Grid>
    </Grid>
  );
}
