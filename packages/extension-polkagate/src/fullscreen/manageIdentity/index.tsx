// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Data } from '@polkadot/types';
import type { PalletIdentityLegacyIdentityInfo, PalletIdentityRegistration } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountsStore } from '@polkadot/extension-base/stores';
import { sanitizeChainName } from '@polkadot/extension-polkagate/src/util/utils';
import keyring from '@polkadot/ui-keyring';
import { BN, BN_ZERO, hexToString, isHex, u8aToString } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { Progress, Warning } from '../../components';
import { useApiWithChain2, useFormatted, useFullscreen, usePeopleChain, useTranslation } from '../../hooks';
import { FULLSCREEN_WIDTH } from '../../util/constants';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import Bread from '../partials/Bread';
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
  PROXY: 100,
  SIGN_QR: 200
};

type SubAccounts = [string, string[]];
export type Mode = 'Set' | 'Clear' | 'Modify' | 'ManageSubId' | 'RequestJudgement' | 'CancelJudgement' | undefined;
export type SubIdAccountsToSubmit = { address: string | undefined; name: string | undefined; status: 'current' | 'new' | 'remove' }[];
export type SubIdsParams = (string | Data | undefined)[][] | undefined;
export type IdJudgement = 'Reasonable' | 'KnownGood' | 'FeePaid' | null | undefined;

function getRawValue(value: Data) {
  if (!value) {
    return;
  }

  const text = u8aToString(value.asRaw.toU8a(true));

  return text === ''
    ? undefined
    : text;
}

export function setData(value: string | undefined): Data {
  return value
    ? { raw: value }
    : { none: null };
}

export default function ManageIdentity(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);

  const { peopleChain: chain } = usePeopleChain(address);
  const api = useApiWithChain2(chain);
  const chainName = sanitizeChainName(chain?.name);

  const [identity, setIdentity] = useState<DeriveAccountRegistration | null | undefined>();
  const [identityToSet, setIdentityToSet] = useState<DeriveAccountRegistration | null | undefined>();
  const [infoParams, setInfoParams] = useState<PalletIdentityLegacyIdentityInfo | null | undefined>();
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
  // TODO: fieldDeposit is removed on people chain on favour of byteDeposit
  const fieldDepositValue = useMemo(() => api ? getConstantValue(api, 'fieldDeposit') : BN_ZERO, [api]);
  const subAccountDeposit = useMemo(() => api ? getConstantValue(api, 'subAccountDeposit') : BN_ZERO, [api]);

  const totalDeposit = useMemo(() => {
    const discord = identityToSet?.other?.discord || identityToSet?.discord as string;

    if (mode === 'Set' || step === STEPS.INDEX) {
      return basicDepositValue.add(discord ? fieldDepositValue : BN_ZERO);
    }

    if (mode === 'Modify' || step === STEPS.MODIFY) {
      return basicDepositValue.add(discord ? fieldDepositValue : BN_ZERO);
    }

    if (mode === 'Clear' || step === STEPS.REMOVE || step === STEPS.PREVIEW) {
      return basicDepositValue.add(discord ? fieldDepositValue : BN_ZERO).add(subIdAccounts ? subAccountDeposit.muln(subIdAccounts.length) : BN_ZERO);
    }

    if (mode === 'ManageSubId' || step === STEPS.MANAGE_SUBID) {
      const remainSubIds = subIdAccountsToSubmit?.filter((subs) => subs.status !== 'remove');

      return subAccountDeposit.muln(remainSubIds?.length ?? 0);
    }

    return BN_ZERO;
  }, [basicDepositValue, fieldDepositValue, identityToSet, mode, step, subAccountDeposit, subIdAccounts, subIdAccountsToSubmit]);

  const depositToPay = useMemo(() => {
    const discord = identity?.other?.discord || identity?.discord as string;

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
      const alreadyIdDeposit = basicDepositValue.add(discord ? fieldDepositValue : BN_ZERO);

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
  }, [basicDepositValue, fieldDepositValue, identity?.discord, identity?.other?.discord, maxFeeValue, mode, subAccountDeposit, subIdAccounts, subIdAccountsToSubmit, totalDeposit]);

  const fetchIdentity = useCallback(() => {
    setStep(STEPS.CHECK_SCREEN);
    setFetching(true);
    clear();

    try {
      api?.query.identity.identityOf(address)
        .then((id) => {
          if (!id.isEmpty) {
            const { info, judgements } = id.unwrap()[0] as PalletIdentityRegistration;

            const idToSet: DeriveAccountRegistration | null = {
              discord: getRawValue(info.discord),
              display: getRawValue(info.display),
              email: getRawValue(info.email),
              github: getRawValue(info.github),
              legal: getRawValue(info.legal),
              matrix: getRawValue(info.matrix),
              other: {
                discord: info.additional?.length > 0
                  ? getRawValue(info.additional[0][1])
                  : undefined
              }, // deprecated
              riot: getRawValue(info.riot), // deprecated
              twitter: getRawValue(info.twitter),
              web: getRawValue(info.web),
              judgements
            };

            if (judgements.isEmpty) {
              setIdJudgement(null);
            } else {
              const judgementInHuman = judgements.toHuman();
              const judgementType = judgementInHuman[0][1] as string;
              const registrar = judgementInHuman[0][0] as string;

              if (['Reasonable', 'KnownGood'].includes(judgementType)) {
                setSelectedRegistrar(registrar);
                setIdJudgement(judgementType as 'Reasonable' | 'KnownGood');
              } else {
                setIdJudgement('FeePaid');
                setSelectedRegistrar(registrar);
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

    const _identity: PalletIdentityLegacyIdentityInfo = {
      discord: setData(identityToSet?.other?.discord || identityToSet?.discord as string),
      display: { raw: identityToSet?.display },
      email: setData(identityToSet?.email),
      legal: setData(identityToSet?.legal),
      twitter: setData(identityToSet?.twitter),
      web: setData(identityToSet?.web)
    };

    if (identityToSet?.riot) {
      _identity.riot = setData(identityToSet?.riot);
    }

    if (identityToSet?.matrix) {
      _identity.matrix = setData(identityToSet?.matrix as string);
    }

    if (identityToSet?.github) {
      _identity.github = setData(identityToSet?.github as string);
    }

    setInfoParams(_identity);
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
  }, [chain?.genesisHash, clear]);

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

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='manageIdentity' />
      <Grid container item justifyContent='flex-start' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '3%' }}>
        <Bread />
        {step === STEPS.CHECK_SCREEN &&
          <Progress
            gridSize={200}
            pt='250px'
            title={t('Checking account\'s on-chain Identity, please wait...')}
            type='grid'
          />
        }
        {step === STEPS.UNSUPPORTED &&
          <Grid alignItems='center' container direction='column' display='block' item>
            <Typography fontSize='30px' fontWeight={700} p='30px 0 60px 80px'>
              {t('Manage Identity')}
            </Typography>
            <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', width: '400px' }}>
              <Warning
                fontWeight={500}
                isBelowInput
                theme={theme}
              >
                {t('The chosen blockchain does not support on-chain identity.')}
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
        {[STEPS.REVIEW, STEPS.WAIT_SCREEN, STEPS.CONFIRM, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <Review
            address={address}
            api={api}
            chain={chain}
            depositToPay={depositToPay}
            depositValue={totalDeposit}
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
