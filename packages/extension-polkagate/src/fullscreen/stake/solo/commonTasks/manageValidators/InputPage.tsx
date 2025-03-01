// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ValidatorInfo } from 'extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../../type';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { BN_ZERO } from '@polkadot/util';

import { TwoButtons } from '../../../../../components';
import { useTranslation } from '../../../../../components/translate';
import { useInfo, useStakingAccount, useStakingConsts } from '../../../../../hooks';
import { STEPS } from '../../../pool/stake';
import SelectValidatorsFs from '../../partials/SelectValidatorsFs';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>;
  inputs: StakingInputs | undefined;
}

function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
}

export default function InputPage({ address, inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();

  const stakingConsts = useStakingConsts(address);
  const stakingAccount = useStakingAccount(address);
  const { api, formatted } = useInfo(address);

  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>(inputs?.selectedValidators || []);

  const nominatedValidatorsIds = useMemo(() =>
    stakingAccount === null || stakingAccount?.nominators?.length === 0
      ? null
      : stakingAccount?.nominators.map((item) => item.toString())
    , [stakingAccount]);

  const { call, params } = useMemo(() => {
    if (api && newSelectedValidators?.length) {
      const call = api.tx['staking']['nominate'];
      const params = newSelectedValidators.map((v) => v.accountId.toString());

      return { call, params: [params] };
    }

    return { call: undefined, params: undefined };
  }, [api, newSelectedValidators]);

  const buttonDisable = !newSelectedValidators?.length || !inputs;

  useEffect(() => {
    if (call && params && formatted && newSelectedValidators?.length) {
      const selectedValidatorsId = newSelectedValidators.map(({ accountId }) => accountId.toString());

      if (nominatedValidatorsIds && arraysAreEqual(selectedValidatorsId, nominatedValidatorsIds)) {
        return; // no new validators are selected
      }

      setInputs({
        call,
        params,
        selectedValidators: newSelectedValidators
      });
    }
  }, [formatted, params, call, setInputs, newSelectedValidators, nominatedValidatorsIds]);

  const onNextClick = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const onBackClick = useCallback(
    () => openOrFocusTab(`/solofs/${address}`, true)
    , [address]);

  return (
    <Grid alignItems='center' container item justifyContent='flex-start'>
      <Typography fontSize='14px' pb='15px' width='100%'>
        {t('Manage your nominated validators by considering their properties, including their commission rates. You can even filter them based on your preferences.')}
      </Typography>
      <Grid container item justifyContent='flex-start' mt='10px'>
        <SelectValidatorsFs
          address={address}
          newSelectedValidators={newSelectedValidators}
          nominatedValidatorsIds={nominatedValidatorsIds}
          setNewSelectedValidators={setNewSelectedValidators}
          staked={(stakingAccount?.stakingLedger?.active as unknown as BN) ?? BN_ZERO}
          stakingConsts={stakingConsts}
          stashId={formatted}
          tableHeight={window.innerHeight - 400}
        />
        <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
          <TwoButtons
            disabled={buttonDisable}
            mt='1px'
            onPrimaryClick={onNextClick}
            onSecondaryClick={onBackClick}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Back')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
