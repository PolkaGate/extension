// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Data } from '@polkadot/types';
import type { PalletIdentityIdentityInfo, PalletIdentityRegistration } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO, hexToString, isHex, u8aToString } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { Warning } from '../../components';
import { useApi, useChain, useChainName, useFormatted, useFullscreen, useTranslation } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import PreviewIdentity from './Preview';
import RequestJudgement from './RequestJudgement';
import Review from './Review';
import SetIdentity from './SetIdentity';
import SetSubId from './SetSubId';

export const STEPS = {
  CHECK_SCREEN: 0,
  INDEX: 1,
  PREVIEW: 2,
  MODIFY: 3,
  REMOVE: 4,
  MANAGE_SUBID: 5,
  JUDGEMENT: 6,
  REVIEW: 7,
  WAIT_SCREEN: 8,
  CONFIRM: 9,
  UNSUPPORTED: 10,
  PROXY: 100
};

type SubAccounts = [string, string[]];
export type Mode = 'Set' | 'Clear' | 'Modify' | 'ManageSubId' | 'RequestJudgement' | 'CancelJudgement' | undefined;
export type SubIdAccountsToSubmit = { address: string | undefined; name: string | undefined; status: 'current' | 'new' | 'remove' }[];
export type SubIdsParams = (string | Data | undefined)[][] | undefined;
export type IdJudgement = 'Reasonable' | 'KnownGood' | 'FeePaid' | null | undefined;

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
  const chainName = useChainName(address);
  const formatted = useFormatted(address);

  const [identity, setIdentity] = useState<DeriveAccountRegistration | null | undefined>();
  const [identityToSet, setIdentityToSet] = useState<DeriveAccountRegistration | null | undefined>();
  const [infoParams, setInfoParams] = useState<PalletIdentityIdentityInfo | null | undefined>();
  const [subIdsParams, setSubIdsParams] = useState<SubIdsParams | undefined>();
  const [idJudgement, setIdJudgement] = useState<IdJudgement>();
  const [subIdAccounts, setSubIdAccounts] = useState<{ address: string, name: string }[] | null | undefined>();
  const [maxFeeValue, setMaxFeeValue] = useState<BN>();
  const [fetching, setFetching] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [mode, setMode] = useState<Mode>();
  const [selectedRegistrar, setSelectedRegistrar] = useState<number | string>();
  const [selectedRegistrarName, setSelectedRegistrarName] = useState<string>();
  const [subIdAccountsToSubmit, setSubIdAccountsToSubmit] = useState<SubIdAccountsToSubmit>();
  const [resetSubId, setResetSubId] = useState<boolean>(false);

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  const clear = useCallback(() => {
    setIdentity(undefined);
    setSubIdAccounts(undefined);
    setSubIdsParams(undefined);
    setInfoParams(undefined);
    setIdentityToSet(undefined);
    setIdJudgement(undefined);
    setMode(undefined);
    setSelectedRegistrar(undefined);
    setSubIdAccountsToSubmit(undefined);
  }, []);

  const getConstantValue = (api: ApiPromise, constantName: string) => {
    try {
      return api ? api.consts.identity?.[constantName] as unknown as BN || BN_ZERO : BN_ZERO;
    } catch (error) {
      setStep(STEPS.UNSUPPORTED);

      return BN_ZERO;
    }
  };

  const basicDepositValue = useMemo(() => api ? getConstantValue(api, 'basicDeposit') : BN_ZERO, [api]);
  const fieldDepositValue = useMemo(() => api ? getConstantValue(api, 'fieldDeposit') : BN_ZERO, [api]);
  const subAccountDeposit = useMemo(() => api ? getConstantValue(api, 'subAccountDeposit') : BN_ZERO, [api]);

  const totalDeposit = useMemo(() => {
    if (mode === 'Set' || step === STEPS.INDEX) {
      return basicDepositValue.add(identityToSet?.other?.discord ? fieldDepositValue : BN_ZERO);
    }

    if (mode === 'Modify' || step === STEPS.MODIFY) {
      return basicDepositValue.add(identityToSet?.other?.discord ? fieldDepositValue : BN_ZERO);
    }

    if (mode === 'Clear' || step === STEPS.REMOVE || step === STEPS.PREVIEW) {
      return basicDepositValue.add(identity?.other?.discord ? fieldDepositValue : BN_ZERO).add(subIdAccounts ? subAccountDeposit.muln(subIdAccounts.length) : BN_ZERO);
    }

    if (mode === 'ManageSubId' || step === STEPS.MANAGE_SUBID) {
      const remainSubIds = subIdAccountsToSubmit?.filter((subs) => subs.status !== 'remove');

      return subAccountDeposit.muln(remainSubIds?.length ?? 0);
    }

    return BN_ZERO;
  }, [basicDepositValue, fieldDepositValue, identity?.other?.discord, identityToSet?.other?.discord, mode, step, subAccountDeposit, subIdAccounts, subIdAccountsToSubmit]);

  const depositToPay = useMemo(() => {
    if (!mode || ['Clear', 'CancelJudgement'].includes(mode)) {
      return BN_ZERO;
    }

    if (mode === 'Set') {
      return totalDeposit;
    }

    if (mode === 'RequestJudgement') {
      return maxFeeValue;
    }

    if (mode === 'Modify') {
      const alreadyIdDeposit = basicDepositValue.add(identity?.other?.discord ? fieldDepositValue : BN_ZERO);

      return totalDeposit.gt(alreadyIdDeposit) ? totalDeposit.sub(alreadyIdDeposit) : BN_ZERO;
    }

    if (mode === 'ManageSubId') {
      if (subIdAccounts && subIdAccounts.length > 0) {
        const newSubs = (subIdAccountsToSubmit || []).filter((subId) => subId.status === 'new').length;
        const removeSubs = (subIdAccountsToSubmit || []).filter((subId) => subId.status === 'remove').length;

        return newSubs > removeSubs ? subAccountDeposit.muln(newSubs - removeSubs) : BN_ZERO;
      }

      return totalDeposit;
    }

    return BN_ZERO;
  }, [basicDepositValue, fieldDepositValue, identity?.other?.discord, maxFeeValue, mode, subAccountDeposit, subIdAccounts, subIdAccountsToSubmit, totalDeposit]);

  const fetchIdentity = useCallback(() => {
    setStep(STEPS.CHECK_SCREEN);
    setFetching(true);
    clear();

    try {
      api?.query.identity.identityOf(address)
        .then((id) => {
          if (!id.isEmpty) {
            const { info, judgements } = id.unwrap() as PalletIdentityRegistration;

            const idToSet: DeriveAccountRegistration | null = {
              display: getRawValue(info.display),
              email: getRawValue(info.email),
              legal: getRawValue(info.legal),
              other: { discord: info.additional.length > 0 ? getRawValue(info.additional[0][1]) : undefined },
              riot: getRawValue(info.riot),
              twitter: getRawValue(info.twitter),
              web: getRawValue(info.web),
              judgements
            };

            if (judgements.isEmpty) {
              setIdJudgement(null);
            } else {
              const judgementInHuman = judgements.toHuman();
              const judgementType = judgementInHuman[0][1] as string;

              if (['Reasonable', 'KnownGood'].includes(judgementType)) {
                setIdJudgement(judgementType as 'Reasonable' | 'KnownGood');
              } else {
                const feePaidReg = judgementInHuman[0][0] as string;

                setIdJudgement('FeePaid');
                setSelectedRegistrar(feePaidReg);
              }
            }

            setIdentity(idToSet);
          } else {
            setIdentity(null);
          }

          setRefresh(false);
          setFetching(false);
        })
        .catch(console.error);
    } catch (error) {
      setStep(STEPS.UNSUPPORTED);
    }
  }, [address, api?.query.identity, clear]);

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
        subIdAccounts !== undefined && idJudgement !== undefined && setStep(2);
        break;
    }
  }, [idJudgement, identity, subIdAccounts]);

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
  }, [address, api, fetchIdentity, fetching, refresh]);

  useEffect(() => {
    clear();
  }, [chain?.genesisHash, chainName, clear]);

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

              return { address: subAddr, name: isHex(subName) ? hexToString(subName) : subName };
            })
          );

          setSubIdAccounts(subAccountsAndNames);
        } else {
          setSubIdAccounts(null);
        }
      } catch (error) {
        console.error(error);
        setStep(STEPS.UNSUPPORTED);
      }
    };

    fetchSubAccounts().catch(console.error);
  }, [address, api, identity]);

  useEffect(() => {
    if (!subIdAccounts) {
      return;
    }

    const oldIds = subIdAccounts.map((idAccount) => ({ ...idAccount, status: 'current' })) as SubIdAccountsToSubmit;

    setSubIdAccountsToSubmit(oldIds);
    setResetSubId(false);
  }, [subIdAccounts, resetSubId]);

  const resetSubIds = useCallback(() => setResetSubId(true), []);

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
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader page='manageIdentity' />
      <Grid container item justifyContent='center' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        {step === STEPS.CHECK_SCREEN &&
          <IdentityCheckProgress />
        }
        {step === STEPS.UNSUPPORTED &&
          <Grid alignItems='center' container direction='column' display='block' item>
            <Typography fontSize='30px' fontWeight={700} p='30px 0 60px 80px'>
              {t<string>('Manage  Identity')}
            </Typography>
            <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', width: '400px' }}>
              <Warning
                fontWeight={500}
                isBelowInput
                theme={theme}
              >
                {t<string>('The chosen blockchain does not support on-chain identity.')}
              </Warning>
            </Grid>
          </Grid>
        }
        {(step === STEPS.INDEX || (step === STEPS.MODIFY && mode === 'Modify')) &&
          <SetIdentity
            api={api}
            chainName={chainName}
            identity={identity}
            identityToSet={identityToSet}
            mode={mode}
            setIdentityToSet={setIdentityToSet}
            setMode={setMode}
            setStep={setStep}
            totalDeposit={totalDeposit}
          />
        }
        {step === STEPS.PREVIEW && identity &&
          <PreviewIdentity
            api={api}
            identity={identity}
            judgement={idJudgement}
            setIdentityToSet={setIdentityToSet}
            setMode={setMode}
            setStep={setStep}
            subIdAccounts={subIdAccounts}
            totalDeposit={totalDeposit}
          />
        }
        {step === STEPS.MANAGE_SUBID && identity?.display && formatted &&
          <SetSubId
            api={api}
            mode={mode}
            parentAddress={String(formatted)}
            parentDisplay={identity.display}
            resetSubIds={resetSubIds}
            setMode={setMode}
            setStep={setStep}
            setSubIdAccountsToSubmit={setSubIdAccountsToSubmit}
            setSubIdsParams={setSubIdsParams}
            subIdAccounts={subIdAccounts}
            subIdAccountsToSubmit={subIdAccountsToSubmit}
            subIdsParams={subIdsParams}
            totalSubIdsDeposit={totalDeposit}
          />
        }
        {step === STEPS.JUDGEMENT && idJudgement !== undefined &&
          <RequestJudgement
            address={address}
            api={api}
            idJudgement={idJudgement}
            maxFeeValue={maxFeeValue}
            selectedRegistrar={selectedRegistrar}
            setMaxFeeValue={setMaxFeeValue}
            setMode={setMode}
            setSelectedRegistrar={setSelectedRegistrar}
            setSelectedRegistrarName={setSelectedRegistrarName}
            setStep={setStep}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM || step === STEPS.PROXY) &&
          <Review
            address={address}
            api={api}
            chain={chain}
            depositValue={totalDeposit}
            depositToPay={depositToPay}
            identityToSet={identityToSet}
            infoParams={infoParams}
            maxFeeAmount={maxFeeValue}
            mode={mode}
            parentDisplay={identity?.display}
            selectedRegistrar={selectedRegistrar}
            selectedRegistrarName={selectedRegistrarName}
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
