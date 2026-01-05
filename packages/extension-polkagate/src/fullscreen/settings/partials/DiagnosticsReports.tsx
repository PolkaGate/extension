// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { MySwitch } from '@polkadot/extension-polkagate/src/components/index';
import { getAndWatchStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../components/translate';

export default function DiagnosticsReports(): React.ReactElement {
  const { t } = useTranslation();

  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    const unsubscribe = getAndWatchStorage(STORAGE_KEY.DISABLE_DIAGNOSTIC_REPORTS, setDisabled);

    return () => unsubscribe();
  }, []);

  const onDisableReports = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setStorage(STORAGE_KEY.DISABLE_DIAGNOSTIC_REPORTS, checked).catch(console.error);
  }, []);

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='45px 0 15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('Diagnostic Reports')}
      </Typography>
      <MySwitch
        checked={Boolean(isDisabled)}
        columnGap='8px'
        label={t('Opt Out of Sending Diagnostic Reports')}
        onChange={onDisableReports}
      />
    </Stack>
  );
}
