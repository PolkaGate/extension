// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AddRounded as AddRoundedIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { AccountContext, ShowBalance, TwoButtons, Warning } from '../../components';
import { useTranslation } from '../../components/translate';
import { useChain } from '../../hooks';
import getAllAddresses from '../../util/getAllAddresses';
import DisplaySubId from './partial/DisplaySubId';
import { Mode, setData, STEPS, SubIdAccountsToSubmit, SubIdsParams } from '.';

interface Props {
  parentAddress: string;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  parentDisplay: string;
  subIdAccounts: { address: string; name: string; }[] | null | undefined;
  subIdAccountsToSubmit: SubIdAccountsToSubmit | undefined;
  setSubIdAccountsToSubmit: React.Dispatch<React.SetStateAction<SubIdAccountsToSubmit | undefined>>;
  setSubIdsParams: React.Dispatch<React.SetStateAction<SubIdsParams>>;
  subIdsParams: SubIdsParams;
  mode: Mode;
  resetSubIds: () => void;
  totalSubIdsDeposit: BN;
}

export default function SetSubId({ api, mode, parentAddress, parentDisplay, resetSubIds, setMode, setStep, setSubIdAccountsToSubmit, setSubIdsParams, subIdAccounts, subIdAccountsToSubmit, subIdsParams, totalSubIdsDeposit }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(parentAddress);
  const { hierarchy } = useContext(AccountContext);

  const allAddresses = getAllAddresses(hierarchy, true, true, chain?.ss58Format, parentAddress);

  const maxSubAccounts = api && api.consts.identity.maxSubAccounts.toString();

  const [disableAddSubId, setDisableAddSubId] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<Set<number> | boolean>(false);
  const [subIdModified, setSubIdModified] = useState<boolean>(false);
  const [noNewNoRemove, setNoChanges] = useState<boolean>(false);

  const buttonsBoxColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette.background.default, theme.palette.mode]);

  const subIdsLength = useMemo(() => subIdAccountsToSubmit?.filter((subs) => subs.status !== 'remove').length ?? 0, [subIdAccountsToSubmit]);
  const toRemoveSubs = useMemo(() => subIdAccountsToSubmit && subIdAccountsToSubmit.filter((subs) => subs.status === 'remove').length > 0, [subIdAccountsToSubmit]);

  const nextButtonDisable = useMemo(() => {
    return (!subIdAccountsToSubmit || subIdAccountsToSubmit.length === 0 || disableAddSubId || !!duplicateError || (noNewNoRemove && !subIdModified));
  }, [disableAddSubId, duplicateError, noNewNoRemove, subIdAccountsToSubmit, subIdModified]);

  const addressesToSelect = useMemo(() => {
    if (!allAddresses || !(allAddresses.length >= 1)) {
      return [];
    }

    const canBeSelected = allAddresses.filter((address) => !subIdAccountsToSubmit?.find((subId) => subId.address === address[0])).map((addr) => addr[0]);

    return canBeSelected;
  }, [allAddresses, subIdAccountsToSubmit]);

  useEffect(() => {
    if (!subIdAccountsToSubmit) {
      return;
    }

    // Check for modified subIdAccounts
    const modified = subIdAccounts?.every((sub) =>
      subIdAccountsToSubmit.some((subId) => subId.status === 'current' && subId.address === sub.address && subId.name === sub.name)
    );

    setSubIdModified(!modified);

    // Check for empty elements in subIdAccountsToSubmit
    const emptyElement = !!subIdAccountsToSubmit.find((idAccount) =>
      idAccount.status !== 'remove' && (idAccount.address === undefined || idAccount.name === undefined || idAccount.address === '' || idAccount.name === '')
    );

    setDisableAddSubId(emptyElement);

    // Check for duplicate addresses in subIdAccountsToSubmit
    const indexes = new Set<number>();

    subIdAccountsToSubmit.forEach((sub, index) => {
      subIdAccountsToSubmit.forEach((subId, i) => {
        if (subId.address === sub.address && i !== index) {
          indexes.add(i);
        }
      });

      if (sub.address === parentAddress) {
        indexes.add(index);
      }
    });

    setDuplicateError(indexes.size > 0 ? indexes : false);

    // Check for no changes in subIdAccountsToSubmit
    const noChanges = subIdAccountsToSubmit?.filter((subs) => subs.status !== 'current').length === 0;

    setNoChanges(noChanges);
  }, [subIdAccounts, subIdAccountsToSubmit, parentAddress]);

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

    setSubIdAccountsToSubmit((prevSubIdAccountsToSubmit) => [{ address: undefined, name: undefined, status: 'new' }, ...(prevSubIdAccountsToSubmit ?? [])]);
  }, [disableAddSubId, setSubIdAccountsToSubmit]);

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
  }, [setSubIdAccountsToSubmit, subIdAccountsToSubmit]);

  const changeNewSubIdAddress = useCallback((address: string | null | undefined, index: number | undefined) => {
    if (index !== undefined && subIdAccountsToSubmit) {
      subIdAccountsToSubmit[index].address = address ?? '';

      setSubIdAccountsToSubmit([...subIdAccountsToSubmit]);
    }
  }, [setSubIdAccountsToSubmit, subIdAccountsToSubmit]);

  const changeNewSubIdName = useCallback((name: string | null | undefined, index: number | undefined) => {
    if (index !== undefined && subIdAccountsToSubmit) {
      subIdAccountsToSubmit[index].name = name ?? '';

      setSubIdAccountsToSubmit([...subIdAccountsToSubmit]);
    }
  }, [setSubIdAccountsToSubmit, subIdAccountsToSubmit]);

  const goReview = useCallback(() => {
    setMode('ManageSubId');
    setSubIdsParams(makeSubIdParams);
    makeSubIdParams && setStep(STEPS.REVIEW);
  }, [setMode, setSubIdsParams, makeSubIdParams, setStep]);

  const goBack = useCallback(() => {
    resetSubIds();
    setSubIdsParams(undefined);
    setSubIdAccountsToSubmit(undefined);
    setStep(STEPS.PREVIEW);
    setMode(undefined);
  }, [resetSubIds, setSubIdsParams, setSubIdAccountsToSubmit, setStep, setMode]);

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
                  {`${subIdsLength ?? 0} of ${maxSubAccounts ?? 0}`}
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
                addressesToSelect={addressesToSelect}
                api={api}
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
      <Grid container item justifyContent='flex-end' sx={{ '> div': { bottom: '10px', width: '400px' }, bgcolor: buttonsBoxColor, bottom: '0', boxShadow: '0px -1px 4px 0px #00000040', height: '60px', left: 0, position: 'absolute', pr: '25%' }}>
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
