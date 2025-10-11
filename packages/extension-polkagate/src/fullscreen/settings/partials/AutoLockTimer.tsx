// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AutoLockDelayType } from '../../../hooks/useAutoLock';

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { DropSelect, MySwitch, MyTextField } from '@polkadot/extension-polkagate/src/components/index';

import { setStorage } from '../../../components/Loading';
import { useTranslation } from '../../../components/translate';
import { useAutoLock } from '../../../hooks';
// import MySelect from '../components/Select';

const autoLockOptions = [
  { text: 'min', value: 'min' },
  { text: 'hour', value: 'hour' },
  { text: 'day', value: 'day' }
];

export default function AutoLockTimer (): React.ReactElement {
  const { t } = useTranslation();
  const autoLock = useAutoLock();

  const [inputValue, setInputValue] = useState<number>();
  const [enabled, setEnabled] = useState<boolean>();
  const [delayType, setDelayType] = useState<AutoLockDelayType | undefined>();

  const onDelayValueChange = useCallback((value: string) => {
    setInputValue(parseFloat(value || '0'));
  }, []);

  const onDelayTypeChange = useCallback((value: string | number) => {
    setDelayType(value as AutoLockDelayType);
  }, []);

  const onSwitchChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setEnabled(checked);
  }, []);

  useEffect(() => {
    if (!autoLock?.enabled) {
      return;
    }

    // to initiate with saved data
    setInputValue(autoLock.delay.value);
    setEnabled(autoLock.enabled);
    setDelayType(autoLock.delay.type);
  }, [autoLock]);

  useEffect(() => {
    const toSave = {
      delay: {
        type: delayType || autoLock?.delay.type || 'min',
        value: Number(inputValue ?? autoLock?.delay.value ?? 30)
      },
      enabled: enabled ?? autoLock?.enabled ?? false
    };

    if (!autoLock || JSON.stringify(toSave) === JSON.stringify(autoLock)) {
      return;
    }

    setStorage('autoLock', toSave).catch(console.error);
  }, [autoLock, delayType, enabled, inputValue]);

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <Typography color='text.primary' fontSize='22px' m='35px 0 5px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('Auto-Lock Timer')}
      </Typography>
      <Stack columnGap='30px' direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <MySwitch
          checked={Boolean(autoLock?.enabled)}
          columnGap='8px'
          label= {t('Enable Auto-Lock')}
          onChange={onSwitchChange}
        />
        <Stack columnGap='4px' direction='row'>
          <MyTextField
            disabled={!autoLock?.enabled}
            inputType='number'
            inputValue={inputValue ?? autoLock?.delay?.value ?? 30}
            maxLength={4}
            onTextChange={onDelayValueChange}
            placeholder='00'
            style={{ width: '88px' }}
          />
          <DropSelect
            contentDropWidth={150}
            disabled={!autoLock?.enabled}
            displayContentType='text'
            onChange={onDelayTypeChange}
            options={autoLockOptions}
            scrollTextOnOverflow
            showCheckAsIcon
            style={{ height: '44px', margin: '5px 0', width: '77px' }}
            value={delayType || autoLock?.delay?.type}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
