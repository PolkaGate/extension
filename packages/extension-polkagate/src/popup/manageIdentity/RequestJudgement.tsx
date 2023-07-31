// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { PalletIdentityRegistrarInfo } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';

import { Identity, Select, ShowBalance, TwoButtons } from '../../components';
import { useTranslation } from '../../components/translate';
import { useChain, useChainName } from '../../hooks';
import { REGISTRARS_LIST } from '../../util/constants';
import { DropdownOption } from '../../util/types';
import { IdJudgement, Mode, STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  maxFeeValue: BN | undefined;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  mode: Mode;
  setSelectedRegistrar: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  selectedRegistrar: string | number | undefined;
  setMaxFeeValue: React.Dispatch<React.SetStateAction<BN | undefined>>;
  setSelectedRegistrarName: React.Dispatch<React.SetStateAction<string | undefined>>;
  idJudgement: IdJudgement;
}

export default function RequestJudgement({ address, api, idJudgement, maxFeeValue, mode, selectedRegistrar, setMaxFeeValue, setMode, setSelectedRegistrar, setSelectedRegistrarName, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chainName = useChainName(address);
  const chain = useChain(address);

  const isWestend = chainName?.toLowerCase() === 'westend';

  const [registrarsList, setRegistrarsList] = useState<DropdownOption[] | undefined>();
  const [registrarsMaxFee, setRegistrarsMaxFee] = useState<{ text: string, fee: BN }[] | undefined>();

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.identity.registrars().then((registrars) => {
      const registrarsInfo: PalletIdentityRegistrarInfo[] = registrars.toJSON() as unknown as PalletIdentityRegistrarInfo[];

      const registrar: DropdownOption[] = [];
      const registrarsFee: { text: string, fee: BN }[] = [];

      registrarsInfo.forEach((regInfo) => {
        const found = REGISTRARS_LIST.find((reg) => reg.addresses.includes(String(regInfo.account)));

        if (found) {
          registrar.push({
            text: found.name,
            value: isWestend
              ? '0'
              : found.index.toString()
          });

          registrarsFee.push({
            fee: regInfo.fee,
            text: found.name
          });
        }
      });

      setRegistrarsMaxFee(registrarsFee);
      setRegistrarsList(registrar);
    }).catch(console.error);
  }, [api, isWestend]);

  useEffect(() => {
    if (!registrarsList || selectedRegistrar !== undefined) {
      return;
    }

    setSelectedRegistrar(registrarsList[0].value);
  }, [registrarsList, selectedRegistrar, setSelectedRegistrar]);

  useEffect(() => {
    if (!registrarsMaxFee || !registrarsList) {
      return;
    }

    const registrar = registrarsMaxFee.find((maxFee) => registrarsList.find((reg) => String(reg.value) === String(selectedRegistrar))?.text === maxFee.text);

    setSelectedRegistrarName(registrar?.text);
    setMaxFeeValue(registrar?.fee);
  }, [registrarsList, registrarsMaxFee, selectedRegistrar, setMaxFeeValue, setSelectedRegistrarName]);

  const DisplayIdentity = () => (
    <Grid container item py='15px'>
      <Typography fontSize='16px' fontWeight={400}>
        {t<string>('Identity')}
      </Typography>
      <Grid container item sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', p: '8px 12px' }}>
        <Identity
          address={address}
          api={api}
          chain={chain}
          identiconSize={25}
          showSocial
          style={{ fontSize: '16px' }}
        />
      </Grid>
    </Grid>
  );

  const selectRegistrar = useCallback((value: string | number) => {
    setSelectedRegistrar(value);
  }, [setSelectedRegistrar]);

  const goReview = useCallback(() => {
    idJudgement !== 'FeePaid'
      ? setMode('RequestJudgement')
      : setMode('CancelJudgement');
    setStep(STEPS.REVIEW);
  }, [idJudgement, setMode, setStep]);

  const goBack = useCallback(() => {
    setMode(undefined);
    setStep(STEPS.PREVIEW);
  }, [setMode, setStep]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Typography fontSize='22px' fontWeight={700} pb='25px' pt='40px'>
        {t<string>('Request Judgement')}
      </Typography>
      <Typography fontSize='14px' fontWeight={400}>
        {t<string>('{{chainName}} provides a naming system that allows participants to add personal information to their on-chain account and subsequently ask for verification of this information by registrars.', { replace: { chainName } })}
      </Typography>
      <DisplayIdentity />
      <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ '> div div div': { fontSize: '16px', fontWeight: 400 }, position: 'relative' }}>
        <Select
          defaultValue={selectedRegistrar ?? registrarsList?.at(0)?.value}
          isDisabled={!registrarsList || idJudgement === 'FeePaid' || (idJudgement !== null && idJudgement !== 'FeePaid')}
          label={t<string>('Registrar')}
          onChange={selectRegistrar}
          options={registrarsList || []}
          value={selectedRegistrar ?? registrarsList?.at(0)?.value}
        />
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '1px', my: '25px', opacity: 0.2, width: '100%' }} />
      <Grid alignItems='center' container item justifyContent='space-between' m='auto' pt='15px'>
        <Grid container item sx={{ width: 'fit-content' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Registrar fee:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={maxFeeValue}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Grid container item sx={{ '> div': { bottom: '10px', width: '100%' } }} width={mode === 'Set' ? '40%' : '70%'}>
          <TwoButtons
            disabled={!registrarsList || selectedRegistrar === undefined || (idJudgement !== null && idJudgement !== 'FeePaid')}
            mt={'1px'}
            onPrimaryClick={goReview}
            onSecondaryClick={goBack}
            primaryBtnText={idJudgement !== 'FeePaid'
              ? t<string>('Next')
              : t<string>('Cancel request')}
            secondaryBtnText={t<string>('Back')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
