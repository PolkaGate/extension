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
        text={t('Open Polkadot Migration app on the ledger device.')}
        textPartInColor={t('Polkadot Migration')}
      />
      <Step
        num={3}
        text={t('Select the chain from which you want to migrate your account.')}
        textPartInColor={t('chain')}
      />
      <Step
        num={4}
        text={t('Import the account with its index and offset. Leave defaults if unchanged.')}
        textPartInColor={t('account with its index and offset')}
      />
    </Stack>
  );
}
