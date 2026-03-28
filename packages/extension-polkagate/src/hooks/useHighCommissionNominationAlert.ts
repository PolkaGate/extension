// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from './useValidatorsInformation';

import { useEffect, useMemo, useRef } from 'react';

import { toShortAddress } from '../util';
import { HIGH_COMMISSION_THRESHOLD } from '../util/constants';
import useAlerts from './useAlerts';
import useChainInfo from './useChainInfo';
import useValidatorsInformation from './useValidatorsInformation';

const COMMISSION_DIVISOR = 10 ** 7;
const MAX_POOL_LENGTH = 20;

interface HighCommissionNominationAlertParams {
  genesisHash: string | undefined;
  nominatedValidatorsIds: string[] | null | undefined;
  poolName?: string | null;
  stakingType: 'solo' | 'pool';
}

interface HighCommissionMatch {
  commission: number;
  validator: ValidatorInformation;
}

function getValidatorCommission(validator: ValidatorInformation): number {
  const commission = Number(validator.validatorPrefs?.commission ?? 0) / COMMISSION_DIVISOR;

  return commission < 1 ? 0 : commission;
}

function getValidatorDisplayName(validator: ValidatorInformation): string {
  return validator.identity?.displayParent ??
    validator.identity?.display ??
    toShortAddress(validator.accountId?.toString());
}

function formatCommission(commission: number): string {
  return Number.isInteger(commission)
    ? String(commission)
    : commission.toFixed(2).replace(/\.?0+$/, '');
}

export default function useHighCommissionNominationAlert({ genesisHash, nominatedValidatorsIds, poolName, stakingType }: HighCommissionNominationAlertParams): void {
  const { notify } = useAlerts();
  const { chainName } = useChainInfo(genesisHash, true);
  const validatorsInfo = useValidatorsInformation(genesisHash);
  const lastAlertKeyRef = useRef<string | undefined>(undefined);

  const highCommissionNomination = useMemo((): HighCommissionMatch | undefined => {
    if (!nominatedValidatorsIds?.length || !validatorsInfo) {
      return undefined;
    }

    const validators = [
      ...validatorsInfo.validatorsInformation.elected,
      ...validatorsInfo.validatorsInformation.waiting
    ];

    for (const nominatedId of nominatedValidatorsIds) {
      const validator = validators.find(({ accountId }) => accountId.toString() === nominatedId);

      if (!validator) {
        continue;
      }

      const commission = getValidatorCommission(validator);

      if (commission > HIGH_COMMISSION_THRESHOLD) {
        return { commission, validator };
      }
    }

    return undefined;
  }, [nominatedValidatorsIds, validatorsInfo]);

  useEffect(() => {
    if (!chainName || !highCommissionNomination) {
      lastAlertKeyRef.current = undefined;

      return;
    }

    const { commission, validator } = highCommissionNomination;
    const validatorId = validator.accountId.toString();
    const alertKey = `${genesisHash}_${stakingType}_${validatorId}_${commission}`;

    if (lastAlertKeyRef.current === alertKey) {
      return;
    }

    lastAlertKeyRef.current = alertKey;

    const resolvedPoolName = poolName?.trim() || 'your pool';
    const trimmedPoolName = resolvedPoolName.length > MAX_POOL_LENGTH ? `${resolvedPoolName.slice(0, MAX_POOL_LENGTH)}...` : resolvedPoolName;

    notify(
      stakingType === 'solo'
        ? `Validator ${getValidatorDisplayName(validator)} on ${chainName} has a high commission (${formatCommission(commission)}%).`
        : `Pool ${trimmedPoolName} on ${chainName} nominated validator ${getValidatorDisplayName(validator)} with a high commission (${formatCommission(commission)}%).`,
      'warning',
      true
    );
  }, [chainName, genesisHash, highCommissionNomination, notify, poolName, stakingType]);
}
