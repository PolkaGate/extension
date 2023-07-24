// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { ShowBalance, TwoButtons, Warning } from '../../components';
import { useTranslation } from '../../components/translate';
import DisplaySubId from './partial/DisplaySubId';
import { Mode, setData, STEPS, SubIdAccountsToSubmit, SubIdsParams } from '.';

interface Props {
  parentAddress: string;
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

export default function SetSubId({ api, mode, parentAddress, parentDisplay, setDepositValue, setMode, setStep, setSubIdsParams, subIdAccounts, subIdsParams }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const maxSubAccounts = api && api.consts.identity.maxSubAccounts.toString();
  const subAccountDeposit = api ? api.consts.identity.subAccountDeposit as unknown as BN : BN_ZERO;

  const [disableAddSubId, setDisableAddSubId] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<Set<number> | boolean>(false);
  const [subIdAccountsToSubmit, setSubIdAccountsToSubmit] = useState<SubIdAccountsToSubmit>();
  const [subIdModified, setSubIdModified] = useState<boolean>(false);
  const [noNewNoRemove, setNoChanges] = useState<boolean>(false);

  const subIdsLength = useMemo(() => subIdAccountsToSubmit?.filter((subs) => subs.status !== 'remove').length ?? 0, [subIdAccountsToSubmit]);

  const toRemoveSubs = useMemo(() => subIdAccountsToSubmit && subIdAccountsToSubmit.filter((subs) => subs.status === 'remove').length > 0, [subIdAccountsToSubmit]);

  const nextButtonDisable = useMemo(() =>
    (!subIdAccountsToSubmit || subIdAccountsToSubmit.length === 0 || disableAddSubId || !!duplicateError || (noNewNoRemove && !subIdModified))
    , [disableAddSubId, duplicateError, noNewNoRemove, subIdAccountsToSubmit, subIdModified]);

  useEffect(() => {
    if (!subIdAccounts) {
      return;
    }

    const oldIds = subIdAccounts.map((idAccount) => ({ ...idAccount, status: 'current' })) as SubIdAccountsToSubmit;

    setSubIdAccountsToSubmit(oldIds);
  }, [subIdAccounts]);

  // useEffect(() => {
  //   if (!subIdAccounts || !subIdAccountsToSubmit) {
  //     return;
  //   }

  //   const modified = subIdAccounts.some((sub) => subIdAccountsToSubmit.find((subId) => subId.status === 'current' && subId.address !== sub.address));

  //   setSubIdModified(modified);
  // }, [subIdAccounts, subIdAccountsToSubmit]);

  // useEffect(() => {
  //   if (!subIdAccountsToSubmit) {
  //     return;
  //   }

  //   const emptyElement = !!subIdAccountsToSubmit.find((idAccount) => idAccount.status !== 'remove' && (idAccount.address === undefined || idAccount.name === undefined || idAccount.address === '' || idAccount.name === ''));

  //   setDisableAddSubId(emptyElement);
  // }, [subIdAccountsToSubmit]);

  // useEffect(() => {
  //   if (!subIdAccountsToSubmit) {
  //     return;
  //   }

  //   const indexs = new Set<number>();

  //   subIdAccountsToSubmit.forEach((sub, index) => {
  //     subIdAccountsToSubmit.forEach((subId, i) => {
  //       if (subId.address === sub.address && i !== index) {
  //         indexs.add(i);
  //       }
  //     });

  //     if (sub.address === parentAddress) {
  //       indexs.add(index);
  //     }
  //   });

  //   setDuplicateError(indexs.size > 0 ? indexs : false);
  // }, [subIdAccountsToSubmit, parentAddress]);
  useEffect(() => {
    if (!subIdAccountsToSubmit || !subIdAccounts) {
      return;
    }

    // Check for modified subIdAccounts
    const modified = subIdAccounts.some((sub) =>
      subIdAccountsToSubmit.find((subId) => subId.status === 'current' && subId.address !== sub.address)
    );

    setSubIdModified(modified);

    // Check for empty elements in subIdAccountsToSubmit
    const emptyElement = !!subIdAccountsToSubmit.find((idAccount) =>
      idAccount.status !== 'remove' && (idAccount.address === undefined || idAccount.name === undefined || idAccount.address === '' || idAccount.name === '')
    );

    setDisableAddSubId(emptyElement);

    // Check for duplicate addresses in subIdAccountsToSubmit
    const indexs = new Set<number>();

    subIdAccountsToSubmit.forEach((sub, index) => {
      subIdAccountsToSubmit.forEach((subId, i) => {
        if (subId.address === sub.address && i !== index) {
          indexs.add(i);
        }
      });

      if (sub.address === parentAddress) {
        indexs.add(index);
      }
    });

    setDuplicateError(indexs.size > 0 ? indexs : false);

    // Check for no changes in subIdAccountsToSubmit
    const noChanges = subIdAccountsToSubmit?.filter((subs) => subs.status !== 'current').length === 0;

    setNoChanges(noChanges);
  }, [subIdAccounts, subIdAccountsToSubmit, parentAddress]);

  const totalSubIdsDeposit = useMemo(() => subAccountDeposit.muln(subIdsLength), [subAccountDeposit, subIdsLength]);

  const makeSubIdParams = useMemo(() => {
    if (!subIdAccountsToSubmit) {
      return undefined;
    }

    const params = subIdAccountsToSubmit.filter((subIds) => subIds.status !== 'remove').map((subs) => ([subs.address, setData(subs.name)]));

    return params;
  }, [subIdAccountsToSubmit]);

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

  const goReview = useCallback(() => {
    setMode('ManageSubId');
    setDepositValue(totalSubIdsDeposit);
    setSubIdsParams(makeSubIdParams);
    makeSubIdParams && setStep(STEPS.REVIEW);
  }, [setMode, setDepositValue, totalSubIdsDeposit, setSubIdsParams, makeSubIdParams, setStep]);

  const goBack = useCallback(() => {
    setSubIdsParams(undefined);
    setStep(STEPS.PREVIEW);
    setMode(undefined);
  }, [setMode, setStep, setSubIdsParams]);

  return (
    <>
      <Grid container item sx={{ display: 'block', maxWidth: '840px', position: 'relative', px: '10%' }}>
        <Typography fontSize='22px' fontWeight={700} pb={(subIdAccounts || subIdsLength > 0) ? '10px' : '45px'} pt='30px'>
          {t<string>('Set on-chain Sub-identity')}
        </Typography>
        {!subIdAccounts && subIdsLength === 0 &&
          <Typography fontSize='14px' fontWeight={400}>
            {t<string>('With Sub-Identities, you can create multiple identities for privacy, security, and control. Sub-identity accounts inherit features from their parent account, such as the name and parent\'s indicators. Separate personal and business transactions, manage diverse projects, and enjoy the benefits of compartmentalization with Sub-Identities.')}
          </Typography>
        }
        <Grid container item justifyContent='space-between' mb={toRemoveSubs ? 0 : '15px'} mt='15px'>
          <AddSubIdButton />
          {(subIdAccounts || subIdsLength > 0) &&
            <Grid container direction='column' item sx={{ width: 'fit-content' }}>
              <Grid container item justifyContent='flex-end'>
                <Typography fontSize='20px'>
                  {`${subIdsLength ?? 0} of ${maxSubAccounts ?? 1}`}
                </Typography>
              </Grid>
              <Grid container item width='fit-content'>
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
              </Grid>
            </Grid>}
        </Grid>
        {toRemoveSubs &&
          <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px' }}>
            <Warning
              fontWeight={400}
              isBelowInput
              theme={theme}
            >
              {t<string>('You still need to confirm deleting sub-ID(s) on the next step.')}
            </Warning>
          </Grid>
        }
        <Grid container gap='10px' item maxHeight='calc(100vh - 300px)' overflow='scroll'>
          {subIdAccountsToSubmit && subIdAccountsToSubmit.length > 0 &&
            subIdAccountsToSubmit.map((idAccount, index) => (
              <DisplaySubId
                error={typeof (duplicateError) !== 'boolean' && duplicateError.has(index)}
                index={index}
                key={index}
                onRemove={onRemoveNewSubIds}
                parentName={parentDisplay}
                setSubAddress={changeNewSubIdAddress}
                setSubName={changeNewSubIdName}
                subIdInfo={idAccount}
                toModify={idAccount.status === 'new'}
              />
            ))}
        </Grid>
      </Grid>
      <Grid container item justifyContent='flex-end' sx={{ '> div': { bottom: '10px', width: '400px' }, bgcolor: '#F1F1F1', bottom: '0', boxShadow: '0px -1px 4px 0px #00000040', height: '60px', left: 0, position: 'absolute', pr: '25%' }}>
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
    </>
  );
}
