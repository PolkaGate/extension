// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../../hooks';
import Step from '../partials/Step';

export default function Steps(): React.ReactElement {
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
        text={t('Open your desired app on the ledger device.')}
        textPartInColor={t('desired app')}
      />
      <Step
        num={3}
        text={t('Select the relevant chain of your desired App from below.')}
        textPartInColor={t('relevant chain')}
      />
    </Stack>
  );
}
