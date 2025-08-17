// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { StakingConsts } from '../util/types';
import type { ValidatorInformation, ValidatorsInformation } from './useValidatorsInformation';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_FILTERS } from '../util/constants';
import { useStakingConsts2 } from '.';

const commissionSort = (a: ValidatorInformation, b: ValidatorInformation) => {
  // Sort by commission (ascending - least first)
  const aCommission = a.validatorPrefs?.commission || 0;
  const bCommission = b.validatorPrefs?.commission || 0;

  return Number(aCommission) - Number(bCommission); // Ascending order
};

/**
 * @description
 * This hooks return a list of suggested validators to choose
 */

export default function useValidatorSuggestion2 (allValidatorsInfo: ValidatorsInformation | undefined, genesisHash: string | undefined): ValidatorInformation[] | null | undefined {
  const stakingConsts = useStakingConsts2(genesisHash);
  const [selected, setSelected] = useState<ValidatorInformation[] | undefined>();

  const allValidators = useMemo(() =>
    allValidatorsInfo?.validatorsInformation.elected
      .concat(allValidatorsInfo?.validatorsInformation.waiting)
      ?.filter((v) => v.validatorPrefs.blocked as unknown as boolean === false || v.validatorPrefs.blocked.isFalse)
  , [allValidatorsInfo?.validatorsInformation.elected, allValidatorsInfo?.validatorsInformation.waiting]);

  const onLimitValidatorsPerOperator = useCallback((validators: ValidatorInformation[] | undefined, limit: number): ValidatorInformation[] => {
    if (!validators?.length) {
      return [];
    }

    const aDeepCopyOfValidators = validators.slice();

    validators.sort((v1, v2) => ('' + v1?.identity?.displayParent).localeCompare(v2?.identity?.displayParent || ''));

    let counter = 1;
    let indicator = aDeepCopyOfValidators[0];

    return aDeepCopyOfValidators.filter((v, index) => {
      if (indicator.identity?.displayParent && indicator.identity?.displayParent === v.identity?.displayParent && limit >= counter++) {
        return true;
      }

      if (indicator.identity?.displayParent && indicator.identity?.displayParent === v.identity?.displayParent) {
        return false;
      }

      counter = 1;
      indicator = aDeepCopyOfValidators[index + 1];

      return true;
    });
  }, []);

  // TODO: Can research to find a better algorithm to select validators automatically
  const selectBestValidators = useCallback((allValidators: ValidatorInformation[], stakingConsts: StakingConsts): ValidatorInformation[] => {
    const filtered1 = allValidators.filter((v) =>
      // !v.validatorPrefs.blocked && // filter blocked validators
      Number(v.validatorPrefs.commission) !== 0 && // filter 0 commission validators, to exclude new and chilled validators
      (Number(v.validatorPrefs.commission) / (10 ** 7)) < DEFAULT_FILTERS.maxCommission.value && // filter high commission validators
      // @ts-ignore
      (v.exposureMeta?.nominatorCount ?? 0) < stakingConsts?.maxNominatorRewardedPerValidator// filter oversubscribed
      // && v.exposure.others.length > stakingConsts?.maxNominatorRewardedPerValidator / 4 // filter validators with very low nominators
    );
    const filtered2 = onLimitValidatorsPerOperator(filtered1, DEFAULT_FILTERS.limitOfValidatorsPerOperator.value);

    // const filtered3 = allValidatorsIdentities?.length
    //   ? filtered2.filter((v) => v?.identity?.display && v?.identity?.judgements?.length) // filter those who has no verified identity
    //   : filtered2;

    return filtered2.sort(commissionSort).slice(0, stakingConsts?.maxNominations);
  }, [onLimitValidatorsPerOperator]);

  useEffect(() => {
    if (!allValidators || !stakingConsts) {
      return;
    }

    setSelected([...selectBestValidators(allValidators, stakingConsts)]);
  }, [allValidators, selectBestValidators, stakingConsts]);

  return selected;
}
