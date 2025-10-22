// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AutoLockDelayType } from '../../../../hooks/useAutoLock';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { DropSelect, MyTextField } from '@polkadot/extension-polkagate/src/components';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { setStorage } from '../../../../components/Loading';
import MySwitch from '../../../../components/MySwitch';
import { useTranslation } from '../../../../components/translate';
import { useAutoLock } from '../../../../hooks';

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

    setStorage(STORAGE_KEY.AUTO_LOCK, toSave).catch(console.error);
  }, [autoLock, delayType, enabled, inputValue]);

  return (
    <Stack direction='column'>
      <Typography color='label.secondary' mb='5px' mt='15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('Auto-Lock Timer')}
      </Typography>
      <Grid alignItems='center' columnGap='8px' container justifyContent='flex-start' pt='7px'>
        <MySwitch checked={autoLock?.enabled} onChange={onSwitchChange} />
        <Typography variant='B-1'>
          {t('Adjust Auto-Lock')}
        </Typography>
      </Grid>
      <Stack columnGap='10px' direction='row' sx={{ alignItems: 'end', mt: '8px' }}>
        <MyTextField
          disabled={!autoLock?.enabled}
          inputType='number'
          inputValue={inputValue ?? autoLock?.delay?.value ?? 30}
          maxLength={4}
          onTextChange={onDelayValueChange}
          placeholder='00'
          style={{ width: '70px' }}
        />
        <DropSelect
          contentDropWidth={120}
          disabled={!autoLock?.enabled}
          displayContentType='text'
          onChange={onDelayTypeChange}
          options={autoLockOptions}
          scrollTextOnOverflow
          showCheckAsIcon
          style={{ height: '44px', margin: '0', width: '80px' }}
          value={delayType || autoLock?.delay?.type}
        />
      </Stack>
    </Stack>
  );
}
