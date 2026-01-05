// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import settings from '@polkadot/ui-settings';

import MySwitch from '../../../../components/MySwitch';
import { useTranslation } from '../../../../components/translate';

export default function EnableCamera (): React.ReactElement {
  const { t } = useTranslation();

  const onChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    settings.set({ camera: checked ? 'on' : 'off' });
  }, []);

  return (
    <Stack direction='column'>
      <Typography
        color='label.secondary'
        mb='5px'
        mt='15px'
        sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }}
        variant='H-4'
      >
        {t('Camera Access')}
      </Typography>
      <Grid
        alignItems='center'
        columnGap='8px'
        container
        justifyContent='flex-start'
        pt='7px'
      >
        <MySwitch
          checked={settings.camera === 'on'}
          onChange={onChange}
        />
        <Typography
          variant='B-1'
        >
          {t('Enable Camera Access')}
        </Typography>
      </Grid>
    </Stack>
  );
}
