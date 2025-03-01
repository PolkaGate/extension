// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { MyPoolInfo, StakingConsts, ValidatorInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../../type';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { BN_ZERO } from '@polkadot/util';

import { TwoButtons } from '../../../../../components';
import { useTranslation } from '../../../../../components/translate';
import { useInfo } from '../../../../../hooks';
import SelectValidatorsFs from '../../../solo/partials/SelectValidatorsFs';
import { STEPS } from '../../stake';

interface Props {
  address: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<StakingInputs | undefined>>;
  inputs: StakingInputs | undefined;
  pool: MyPoolInfo | null | undefined;
  staked: BN | undefined;
  stakingConsts: StakingConsts | null | undefined;
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

export default function InputPage({ address, inputs, pool, setInputs, setStep, staked, stakingConsts }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { api, formatted } = useInfo(address);

  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInfo[]>(inputs?.selectedValidators || []);
  const [nominatedValidatorsIds, setNominatedValidatorsIds] = useState<string[] | undefined | null>();

  const { call, params } = useMemo(() => {
    if (api && newSelectedValidators?.length && pool) {
      const call = api.tx['nominationPools']['nominate'];
      const ids = newSelectedValidators.map((v) => v.accountId.toString());

      const params = [pool.poolId, ids];

      return { call, params };
    }

    return { call: undefined, params: undefined };
  }, [api, newSelectedValidators, pool]);

  const buttonDisable = !newSelectedValidators?.length || !inputs;

  useEffect(() => {
    setNominatedValidatorsIds(
      pool === null || pool?.stashIdAccount?.nominators?.length === 0
        ? null
        : pool?.stashIdAccount?.nominators.map((id) => id.toString())
    );
  }, [pool]);

  useEffect(() => {
    if (call && params && formatted && newSelectedValidators?.length) {
      const selectedValidatorsId = newSelectedValidators.map(({ accountId }) => accountId.toString());

      if (nominatedValidatorsIds && arraysAreEqual(selectedValidatorsId, nominatedValidatorsIds)) {
        setInputs(undefined);

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

  const onBackClick = useCallback(() => openOrFocusTab(`/poolfs/${address}`, true), [address]);

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
          staked={staked ?? BN_ZERO}
          stakingConsts={stakingConsts}
          stashId={pool?.accounts?.stashId as unknown as AccountId}
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
