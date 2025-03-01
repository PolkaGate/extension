// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
//@ts-ignore
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { useEffect, useMemo, useState } from 'react';

import { useInfo, useTranslation } from '.';

export default function useIsRecoverableTooltipText(address: string | undefined): { isRecoverable: boolean | undefined; recoverableToolTipTxt: string; } {
  const { t } = useTranslation();

  const { api, chain, formatted } = useInfo(address);

  const [isRecoverable, setRecoverable] = useState<boolean | undefined>();

  useEffect((): void => {
    if (!api || !formatted) {
      return;
    }

    api.query?.['recovery']?.['recoverable'](formatted)
      .then((result) => {
        const recoveryOpt = result as Option<PalletRecoveryRecoveryConfig>

        setRecoverable(!!recoveryOpt.isSome);
      })
      .catch(console.error);
  }, [api, formatted]);

  const recoverableToolTipTxt = useMemo(() => {
    if (!chain) {
      return t('Account is in Any Chain mode');
      ;
    }

    switch (isRecoverable) {
      case true:
        return t('Recoverable');
      case false:
        return t('Not recoverable');
      default:
        return t('Checking');
    }
  }, [chain, isRecoverable, t]);

  return {
    isRecoverable,
    recoverableToolTipTxt
  };
}
