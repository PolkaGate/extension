// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { DropSelect, MySwitch, MyTextField } from '@polkadot/extension-polkagate/src/components/index';
import { useIsExtensionPopup } from '@polkadot/extension-polkagate/src/hooks';
import { autoLockOptions } from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/partials/consts';
import { AUTO_LOCK_PERIOD_DEFAULT } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../components/translate';
import useAdjustAutoLockTimer from './useAdjustAutoLockTimer';

export default function AutoLockTimerAdjustment (): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const { autoLock,
    delayType,
    inputValue,
    onDelayTypeChange,
    onDelayValueChange,
    onSwitchChange } = useAdjustAutoLockTimer();

  return (
    <Stack alignItems='flex-start' direction='column' sx={{ width: '100%' }}>
      <Typography
        color={isExtension ? 'label.secondary' : 'text.primary'}
        fontSize={isExtension ? undefined : '22px'}
        m={isExtension ? '15px 0 5px' : '35px 0 5px'}
        sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'
      >
        {t('Auto-Lock Timer')}
      </Typography>
      <Stack columnGap={isExtension ? 0 : '30px'} direction={isExtension ? 'column' : 'row'} rowGap={isExtension ? '8px' : 0} sx={{ alignItems: isExtension ? 'flex-start' : 'center', justifyContent: 'space-between', mt: isExtension ? '7px' : 0 }}>
        <MySwitch
          checked={Boolean(autoLock?.enabled)}
          columnGap='8px'
          label={t('Adjust Auto-Lock')}
          onChange={onSwitchChange}
        />
        <Stack columnGap={isExtension ? '10px' : '4px'} direction='row'>
          <MyTextField
            disabled={!autoLock?.enabled}
            inputType='number'
            inputValue={inputValue || autoLock?.delay?.value || AUTO_LOCK_PERIOD_DEFAULT}
            maxLength={4}
            onTextChange={onDelayValueChange}
            placeholder='00'
            style={{ width: isExtension ? '70px' : '88px' }}
          />
          <DropSelect
            contentDropWidth={isExtension ? 120 : 150}
            disabled={!autoLock?.enabled}
            displayContentType='text'
            onChange={onDelayTypeChange}
            options={autoLockOptions}
            scrollTextOnOverflow
            showCheckAsIcon
            style={{ height: '44px', margin: '5px 0', width: isExtension ? '80px' : '77px' }}
            value={delayType || autoLock?.delay?.type}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
