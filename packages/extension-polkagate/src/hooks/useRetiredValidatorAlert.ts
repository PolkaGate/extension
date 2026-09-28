// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';

import useAlerts from './useAlerts';
import useChainInfo from './useChainInfo';
import useTranslation from './useTranslation';
import useValidatorsInformation from './useValidatorsInformation';

interface RetiredValidatorAlertParams {
  genesisHash: string | undefined;
  nominatedValidatorsIds: string[] | null | undefined;
  stakingType?: 'solo' | 'pool';
}

export default function useRetiredValidatorAlert({ genesisHash, nominatedValidatorsIds, stakingType = 'solo' }: RetiredValidatorAlertParams): void {
  const { t } = useTranslation();
  const { notify } = useAlerts();
  const { chainName } = useChainInfo(genesisHash, true);
  const validatorsInfo = useValidatorsInformation(genesisHash);
  const lastAlertKeyRef = useRef<string | undefined>(undefined);
  const removeAlertRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!chainName || !nominatedValidatorsIds?.length || !validatorsInfo) {
      removeAlertRef.current?.();
      removeAlertRef.current = undefined;
      lastAlertKeyRef.current = undefined;

      return;
    }

    const allValidatorIds = new Set([
      ...validatorsInfo.validatorsInformation.elected.map(({ accountId }) => String(accountId)),
      ...validatorsInfo.validatorsInformation.waiting.map(({ accountId }) => String(accountId))
    ]);

    const retiredIds = nominatedValidatorsIds
      .filter((id) => !allValidatorIds.has(id))
      .sort();

    if (retiredIds.length === 0) {
      removeAlertRef.current?.();
      removeAlertRef.current = undefined;
      lastAlertKeyRef.current = undefined;

      return;
    }

    const alertKey = `${genesisHash}_retired_${retiredIds.join(',')}`;

    if (lastAlertKeyRef.current === alertKey) {
      return;
    }

    // Remove the previous alert (different key = different set of retired validators).
    removeAlertRef.current?.();

    lastAlertKeyRef.current = alertKey;
    removeAlertRef.current = notify(
      stakingType === 'pool'
        ? t('Your nomination pool has nominated retired validators. The pool should update its nominations to select current validators.')
        : t('You are nominating retired validators. Update your nominations to select current validators.'),
      'warning',
      true
    );
  }, [chainName, genesisHash, nominatedValidatorsIds, notify, stakingType, t, validatorsInfo]);
}
