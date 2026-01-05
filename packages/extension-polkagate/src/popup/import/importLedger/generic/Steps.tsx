// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../../hooks';
import Step from '../partials/Step';

export default function Steps (): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ my: '10px' }}>
      <Step
        num={1}
        text={t('Connect your Ledger device to the computer.')}
        textPartInColor={t('Ledger device')}
      />
      <Step
        num={2}
        text={t('Open Polkadot app on the ledger device.')}
        textPartInColor={t('Polkadot')}
      />
      <Step
        num={3}
        text={t('Select accounts to import, click Add New Account to create one, or use Advanced Mode for index and offset-based import.')}
        textPartInColor={t('Add New Account')}
      />
    </Stack>
  );
}
