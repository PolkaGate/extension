// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { ShowBalance, TwoButtons } from '../../components';
import { useTranslation } from '../../components/translate';
import DisplaySubId from './partial/DisplaySubId';
import { Mode, setData, STEPS, SubIdAccountsToSubmit, SubIdsParams } from '.';

interface Props {
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  parentDisplay: string;
  subIdAccounts: { address: string; name: string; }[] | null | undefined;
  setSubIdsParams: React.Dispatch<React.SetStateAction<SubIdsParams>>;
  subIdsParams: SubIdsParams;
  mode: Mode;
  setDepositValue: React.Dispatch<React.SetStateAction<BN>>;
}

export default function SetSubId({ api, parentDisplay, mode, setMode, setStep, setDepositValue, setSubIdsParams, subIdAccounts, subIdsParams }: Props): React.ReactElement {
  const { t } = useTranslation();

  const maxSubAccounts = api && api.consts.identity.maxSubAccounts.toString();
  const subAccountDeposit = api ? api.consts.identity.subAccountDeposit as unknown as BN : BN_ZERO;

  const [disableAddSubId, setDisableAddSubId] = useState<boolean>(false);
  const [subIdAccountsToSubmit, setSubIdAccountsToSubmit] = useState<SubIdAccountsToSubmit>();

  const subIdsLength = useMemo(() => subIdAccountsToSubmit?.filter((subs) => subs.status !== 'remove').length ?? 0, [subIdAccountsToSubmit]);

  const nextButtonDisable = useMemo(() => {
    const noChanges = subIdAccountsToSubmit?.filter((subs) => subs.status !== 'current').length === 0;

    return !subIdAccountsToSubmit || subIdAccountsToSubmit.length === 0 || noChanges || disableAddSubId;
  }, [disableAddSubId, subIdAccountsToSubmit]);

  useEffect(() => {
    if (!subIdAccounts) {
      return;
    }

    const oldIds = subIdAccounts.map((idAccount) => ({ ...idAccount, status: 'current' })) as SubIdAccountsToSubmit;

    setSubIdAccountsToSubmit(oldIds);
  }, [subIdAccounts]);

  useEffect(() => {
    if (!subIdAccountsToSubmit) {
      return;
    }

    const emptyElement = !!subIdAccountsToSubmit.find((idAccount) => idAccount.address === undefined || idAccount.name === undefined);

    setDisableAddSubId(emptyElement);
  }, [subIdAccountsToSubmit]);

  const totalSubIdsDeposit = useMemo(() => subAccountDeposit.muln(subIdsLength), [subAccountDeposit, subIdsLength]);

  const onAddNewSubId = useCallback(() => {
    if (disableAddSubId) {
      return;
    }

    setSubIdAccountsToSubmit([...(subIdAccountsToSubmit ?? []), { address: undefined, name: undefined, status: 'new' }]);
  }, [disableAddSubId, subIdAccountsToSubmit]);

  const AddSubIdButton = () => (
    <Grid container item onClick={onAddNewSubId} sx={{ cursor: disableAddSubId ? 'context-menu' : 'pointer', width: 'fit-content' }}>
      <AddRoundedIcon
        sx={{
          bgcolor: 'primary.main',
          borderRadius: '50px',
          color: '#fff',
          fontSize: '36px'
        }}
      />
      <Typography fontSize='16px' fontWeight={400} lineHeight='36px' sx={{ pl: '8px', textDecoration: 'underline' }}>
        {t<string>('Add SubID')}
      </Typography>
    </Grid>
  );

  const onRemoveNewSubIds = useCallback((index: number | undefined) => {
    if (index !== undefined && subIdAccountsToSubmit) {
      if (subIdAccountsToSubmit[index].status === 'current') {
        subIdAccountsToSubmit[index].status = 'remove';

        setSubIdAccountsToSubmit([...subIdAccountsToSubmit]);
      } else if (subIdAccountsToSubmit[index].status === 'remove') {
        subIdAccountsToSubmit[index].status = 'current';

        setSubIdAccountsToSubmit([...subIdAccountsToSubmit]);
      } else {
        const removeItem = subIdAccountsToSubmit.filter((idAccount) => idAccount !== subIdAccountsToSubmit[index]);

        setSubIdAccountsToSubmit(removeItem);
      }
    }
  }, [subIdAccountsToSubmit]);

  const changeNewSubIdAddress = useCallback((address: string | null | undefined, index: number | undefined) => {
    if (index !== undefined && subIdAccountsToSubmit) {
      subIdAccountsToSubmit[index].address = address ?? '';

      setSubIdAccountsToSubmit([...subIdAccountsToSubmit]);
    }
  }, [subIdAccountsToSubmit]);

  const changeNewSubIdName = useCallback((name: string | null | undefined, index: number | undefined) => {
    if (index !== undefined && subIdAccountsToSubmit) {
      subIdAccountsToSubmit[index].name = name ?? '';

      setSubIdAccountsToSubmit([...subIdAccountsToSubmit]);
    }
  }, [subIdAccountsToSubmit]);

  const makeSubIdParams = useMemo(() => {
    if (!subIdAccountsToSubmit) {
      return undefined;
    }

    const params = subIdAccountsToSubmit.filter((subIds) => subIds.status !== 'remove').map((subs) => ([subs.address, setData(subs.name)]));

    return params;
  }, [subIdAccountsToSubmit]);

  useEffect(() => {
    if (!subIdsParams || mode !== 'ManageSubId') {
      return;
    }

    setStep(STEPS.REVIEW);
  }, [mode, setStep, subIdsParams]);

  const goReview = useCallback(() => {
    setMode('ManageSubId');
    setDepositValue(totalSubIdsDeposit);
    setSubIdsParams(makeSubIdParams);
  }, [setMode, setDepositValue, totalSubIdsDeposit, setSubIdsParams, makeSubIdParams]);

  const goBack = useCallback(() => {
    setSubIdsParams(undefined);
    setStep(STEPS.PREVIEW);
    setMode(undefined);
  }, [setMode, setStep, setSubIdsParams]);

  return (
    <Grid container item sx={{ display: 'block', maxWidth: '840px', position: 'relative', px: '10%' }}>
      <Typography fontSize='22px' fontWeight={700} pb={subIdsLength > 0 ? '10px' : '45px'} pt='30px'>
        {t<string>('Set on-chain Sub-identity')}
      </Typography>
      {subIdAccounts?.length === 0 &&
        <Typography fontSize='14px' fontWeight={400}>
          {t<string>('With Sub-Identities, you can create multiple identities for privacy, security, and control. Sub-identity accounts inherit features from their parent account, such as the name and parent\'s indicators. Separate personal and business transactions, manage diverse projects, and enjoy the benefits of compartmentalization with Sub-Identities.')}
        </Typography>
      }
      {subIdAccounts?.length !== 0 &&
        <Grid container item justifyContent='flex-end'>
          <Typography fontSize='20px' pb='10px'>
            {`${subIdsLength ?? 0} of ${maxSubAccounts ?? 1}`}
          </Typography>
        </Grid>
      }
      <Grid container gap='10px' item>
        {subIdAccountsToSubmit && subIdAccountsToSubmit.length > 0 &&
          subIdAccountsToSubmit.map((idAccount, index) => (
            <DisplaySubId
              index={index}
              key={index}
              onRemove={onRemoveNewSubIds}
              parentName={parentDisplay}
              setSubAddress={changeNewSubIdAddress}
              setSubName={changeNewSubIdName}
              subIdInfo={idAccount}
              toModify={idAccount.status === 'new'}
            />
          ))
        }
      </Grid>
      <Grid alignItems='center' container item justifyContent='space-between' mb='80px' mt='25px'>
        <AddSubIdButton />
        {subIdAccounts?.length !== 0 &&
          <Grid container item sx={{ width: 'fit-content' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Deposit:')}
            </Typography>
            <Grid item lineHeight='22px' pl='5px'>
              <ShowBalance
                api={api}
                balance={totalSubIdsDeposit}
                decimalPoint={4}
                height={22}
              />
            </Grid>
          </Grid>}
      </Grid>
      <Grid container item sx={{ bottom: '30px', height: 'fit-content', position: 'absolute', right: '30px', width: '60%' }}>
        <TwoButtons
          disabled={nextButtonDisable}
          isBusy={mode === 'ManageSubId' && !subIdsParams}
          mt={'1px'}
          onPrimaryClick={goReview}
          onSecondaryClick={goBack}
          primaryBtnText={t<string>('Next')}
          secondaryBtnText={t<string>('Back')}
        />
      </Grid>
    </Grid>
  );
}
