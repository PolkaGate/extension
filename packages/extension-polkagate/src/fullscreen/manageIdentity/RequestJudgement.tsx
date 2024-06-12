// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { PalletIdentityRegistrarInfo } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';

import { PButton, Select, ShowBalance, TwoButtons } from '../../components';
import { useTranslation } from '../../components/translate';
import { useInfo } from '../../hooks';
import FailSuccessIcon from '../../popup/history/partials/FailSuccessIcon';
import { REGISTRARS_LIST, TEST_NETS } from '../../util/constants';
import { DropdownOption } from '../../util/types';
import { pgBoxShadow } from '../../util/utils';
import { toTitleCase } from '../governance/utils/util';
import DisplayIdentity from './component/DisplayIdentity';
import { IdJudgement, Mode, STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  maxFeeValue: BN | undefined;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  setSelectedRegistrar: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  selectedRegistrar: string | number | undefined;
  setMaxFeeValue: React.Dispatch<React.SetStateAction<BN | undefined>>;
  setSelectedRegistrarName: React.Dispatch<React.SetStateAction<string | undefined>>;
  idJudgement: IdJudgement;
}

export default function RequestJudgement({ address, api, idJudgement, maxFeeValue, selectedRegistrar, setMaxFeeValue, setMode, setSelectedRegistrar, setSelectedRegistrarName, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chain, chainName } = useInfo(address);

  const [registrarsList, setRegistrarsList] = useState<DropdownOption[] | undefined>();
  const [registrarsMaxFee, setRegistrarsMaxFee] = useState<{ text: string, fee: BN }[] | undefined>();

  // Filtering out W3F as an option since their registrar is now closed!
  const filteredRegistrarsList = useMemo(() => registrarsList?.filter(({ text }) => text !== 'Web3Foundation'), [registrarsList]);

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

        const isWestend = TEST_NETS.includes(api.genesisHash.toHex());

        if (found) {
          registrar.push({
            text: found.name,
            value: isWestend
              ? '0'
              : found.index.toString()
          });

          registrarsFee.push({
            fee: new BN(regInfo.fee.toString()),
            text: found.name
          });
        }
      });

      setRegistrarsMaxFee(registrarsFee);
      setRegistrarsList(registrar);
    }).catch(console.error);
  }, [api]);

  useEffect(() => {
    if (!filteredRegistrarsList?.length || selectedRegistrar !== undefined) {
      return;
    }

    setSelectedRegistrar(filteredRegistrarsList[0].value);
  }, [filteredRegistrarsList, selectedRegistrar, setSelectedRegistrar]);

  useEffect(() => {
    if (!registrarsMaxFee || !registrarsList?.length) {
      return;
    }

    const registrar = registrarsMaxFee.find((maxFee) => registrarsList.find((reg) => String(reg.value) === String(selectedRegistrar))?.text === maxFee.text);

    setSelectedRegistrarName(registrar?.text);
    setMaxFeeValue(registrar?.fee);
  }, [registrarsList, registrarsMaxFee, selectedRegistrar, setMaxFeeValue, setSelectedRegistrarName]);

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
    <Grid container item sx={{ display: 'block' }}>
      <Typography fontSize='30px' fontWeight={700} pb='25px' pt='25px'>
        {idJudgement
          ? <>
            {idJudgement === 'FeePaid'
              ? t('Judgment Requested')
              : t('Judgment Received')
            }</>
          : t('Request Judgment')

        }
      </Typography>
      {(!idJudgement || idJudgement === 'FeePaid')
        ? <>
          <Typography fontSize='14px' fontWeight={400}>
            {t('{{chainName}} provides a naming system that allows participants to add personal information to their on-chain account and subsequently ask for verification of this information by registrars.', { replace: { chainName } })}
          </Typography>
          <DisplayIdentity
            address={address}
            api={api}
            chain={chain}
          />
          <Grid alignItems='flex-end' container item justifyContent='space-between' m='auto'>
            <Grid alignContent='flex-start' container justifyContent='center' sx={{ '> div div div': { fontSize: '16px', fontWeight: 400 }, position: 'relative', width: '65%' }}>
              <Select
                defaultValue={selectedRegistrar ?? filteredRegistrarsList?.at(0)?.value}
                isDisabled={!filteredRegistrarsList?.length || idJudgement === 'FeePaid' || (idJudgement !== null && idJudgement !== 'FeePaid')}
                label={t('Registrar')}
                onChange={selectRegistrar}
                options={filteredRegistrarsList || []}
                value={selectedRegistrar ?? filteredRegistrarsList?.at(0)?.value}
              />
            </Grid>
            <Grid container item sx={{ pb: '4px', width: 'fit-content' }}>
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                {t('Registration fee:')}
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
          </Grid>
          <Grid container item justifyContent='flex-end' pt='50px' sx={{ '> div': { bottom: '10px', m: 0, width: '420px' } }}>
            <TwoButtons
              disabled={!registrarsList || selectedRegistrar === undefined || (idJudgement !== null && idJudgement !== 'FeePaid')}
              mt={'1px'}
              onPrimaryClick={goReview}
              onSecondaryClick={goBack}
              primaryBtnText={idJudgement !== 'FeePaid'
                ? t('Next')
                : t('Cancel request')}
              secondaryBtnText={t('Back')}
            />
          </Grid>
        </>
        : <>
          <Grid container justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), py: '20px' }}>
            <FailSuccessIcon
              showLabel={false}
              style={{ fontSize: '87px', m: '20px auto', textAlign: 'center', width: 'fit-content' }}
              success={true}
            />
            <Grid container item justifyContent='center'>
              <Typography fontSize='16px' fontWeight={400}>
                {t('Judgment Outcome')}:
              </Typography>
            </Grid>
            <Grid container item justifyContent='center' pt='5px'>
              <Typography fontSize='28px' fontWeight={400}>
                {toTitleCase(idJudgement)}
              </Typography>
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', my: '15px', width: '180px' }} />
            <Grid container item justifyContent='center'>
              <Typography fontSize='16px' fontWeight={400}>
                {t('Registrar')}:
              </Typography>
            </Grid>
            <Grid container item justifyContent='center' py='5px'>
              <Typography fontSize='16px' fontWeight={400}>
                {selectedRegistrar !== undefined && registrarsList?.find(({ value }) => String(value) === String(selectedRegistrar))?.text}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent='flex-end' sx={{ '> div': { bottom: '10px', m: 0, width: '420px' } }}>
            <PButton
              _mt='20px'
              _onClick={goBack}
              _variant='contained'
              _width={30}
              text={t('IDs home')}
            />
          </Grid>
        </>
      }
    </Grid>
  );
}
