// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { AutoLock, AutoLockDelayType } from '../../../hooks/useAutoLock';

import { useCallback, useEffect, useState } from 'react';

import { AUTO_LOCK_PERIOD_DEFAULT, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { setStorage } from '../../../components/Loading';
import useAutoLock from '../../../hooks/useAutoLock';

// enforce a minimum auto-lock time; 0 would lock forever
const INPUT_MIN_VALUE = '1';

export default function useAdjustAutoLockTimer (): {
  autoLock: AutoLock | undefined;
  delayType: AutoLockDelayType | undefined;
  inputValue: number | undefined;
  onDelayTypeChange: (value: number | string) => void;
  onDelayValueChange: (value: string) => void;
  onSwitchChange: (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
} {
  const autoLock = useAutoLock();

  const [inputValue, setInputValue] = useState<number>();
  const [enabled, setEnabled] = useState<boolean>();
  const [delayType, setDelayType] = useState<AutoLockDelayType | undefined>();

  const onDelayValueChange = useCallback((value: string) => {
    setInputValue(parseFloat(value || INPUT_MIN_VALUE));
  }, []);

  const onDelayTypeChange = useCallback((value: number | string) => {
    setDelayType(value as AutoLockDelayType);
  }, []);

  const onSwitchChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setEnabled(checked);
  }, []);

  useEffect(() => {
    if (!autoLock?.enabled) {
      return;
    }

    // initialize state using saved data
    setInputValue(autoLock.delay.value);
    setEnabled(autoLock.enabled);
    setDelayType(autoLock.delay.type);
  }, [autoLock]);

  useEffect(() => {
    const toSave = {
      delay: {
        type: delayType || autoLock?.delay.type || 'min',
        value: Number(inputValue || autoLock?.delay.value || AUTO_LOCK_PERIOD_DEFAULT)
      },
      enabled: enabled ?? autoLock?.enabled ?? false
    };

    if (!autoLock || JSON.stringify(toSave) === JSON.stringify(autoLock)) {
      return;
    }

    setStorage(STORAGE_KEY.AUTO_LOCK, toSave).catch(console.error);
  }, [autoLock, delayType, enabled, inputValue]);

  return {
    autoLock,
    delayType,
    inputValue,
    onDelayTypeChange,
    onDelayValueChange,
    onSwitchChange
  };
}
