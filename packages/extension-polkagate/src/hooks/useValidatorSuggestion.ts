// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StakingConsts } from '../util/types';
import type { ValidatorInformation, ValidatorsInformation } from './useValidatorsInformation';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_FILTERS, TEST_NETS } from '../util/constants';
import useStakingConsts from './useStakingConsts';

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

export default function useValidatorSuggestion(allValidatorsInfo: ValidatorsInformation | undefined, genesisHash: string | undefined): ValidatorInformation[] | null | undefined {
  const stakingConsts = useStakingConsts(genesisHash);
  const [selected, setSelected] = useState<ValidatorInformation[] | undefined>();

  const allValidators = useMemo(() => {
    const elected = allValidatorsInfo?.validatorsInformation.elected ?? [];
    const waiting = allValidatorsInfo?.validatorsInformation.waiting ?? [];

    return elected
      .concat(waiting)
      .filter((v) => (v.validatorPrefs.blocked as unknown as boolean) === false || v.validatorPrefs.blocked.isFalse);
  }, [allValidatorsInfo?.validatorsInformation.elected, allValidatorsInfo?.validatorsInformation.waiting]);

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
      ((v.exposureMeta?.nominatorCount ?? 0) < stakingConsts?.maxNominatorRewardedPerValidator || TEST_NETS.includes(genesisHash))// filter oversubscribed
      // && v.exposure.others.length > stakingConsts?.maxNominatorRewardedPerValidator / 4 // filter validators with very low nominators
    );

    const filtered2 = onLimitValidatorsPerOperator(filtered1, DEFAULT_FILTERS.limitOfValidatorsPerOperator.value);

    // const filtered3 = allValidatorsIdentities?.length
    //   ? filtered2.filter((v) => v?.identity?.display && v?.identity?.judgements?.length) // filter those who has no verified identity
    //   : filtered2;

    return filtered2.sort(commissionSort).slice(0, stakingConsts?.maxNominations);
  }, [genesisHash, onLimitValidatorsPerOperator]);

  useEffect(() => {
    if (!allValidators || !stakingConsts) {
      return;
    }

    setSelected([...selectBestValidators(allValidators, stakingConsts)]);
  }, [allValidators, selectBestValidators, stakingConsts]);

  return selected;
}
