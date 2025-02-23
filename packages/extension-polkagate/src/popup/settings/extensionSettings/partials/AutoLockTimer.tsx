// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AutoLockDelayType } from '../../../../hooks/useAutoLock';

import { Grid, type SelectChangeEvent, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { setStorage } from '../../../../components/Loading';
import { useTranslation } from '../../../../components/translate';
import { useAutoLock } from '../../../../hooks';
import Field from '../components/Field';
import MySelect from '../components/Select';
import MySwitch from '../components/Switch';

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

  const onDelayValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(parseFloat(event.target.value || '0'));
  }, []);

  const onDelayTypeChange = useCallback((event: SelectChangeEvent) => {
    setDelayType(event.target.value as AutoLockDelayType);
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
    <Stack direction='column'>
      <Typography color='label.secondary' mb='5px' mt='15px' sx={{ display: 'block', textAlign: 'left' }} variant='H-4'>
        AUTO-LOCK TIMER
      </Typography>
      <Grid alignItems='center' columnGap='8px' container justifyContent='flex-start' pt='7px'>
        <MySwitch checked={autoLock?.enabled} onChange={onSwitchChange} />
        <Typography variant='B-1'>
          {t('Enable Auto-Lock')}
        </Typography>
      </Grid>
      <Stack columnGap='10px' direction='row' sx={{ alignItems: 'baseline' }}>
        <Field
          onChange={onDelayValueChange}
          value={inputValue ?? autoLock?.delay?.value ?? 30}
        />
        <MySelect
          onChange={onDelayTypeChange}
          options={autoLockOptions}
          value={delayType || autoLock?.delay?.type}
        />
      </Stack>
    </Stack>
  );
}
