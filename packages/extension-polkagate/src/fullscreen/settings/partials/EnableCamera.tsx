// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { MySwitch } from '@polkadot/extension-polkagate/src/components/index';
import settings from '@polkadot/ui-settings';

import { useTranslation } from '../../../components/translate';

export default function EnableCamera(): React.ReactElement {
  const { t } = useTranslation();

  const onChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    settings.set({ camera: checked ? 'on' : 'off' });
  }, []);

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='40px 0 15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('Camera Access')}
      </Typography>
      <MySwitch
        checked={settings.camera === 'on'}
        columnGap='8px'
        label={t('Enable Camera Access')}
        onChange={onChange}
      />
    </Stack>
  );
}
