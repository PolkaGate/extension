// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LinearProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { MySwitch } from '@polkadot/extension-polkagate/src/components/index';
import { loadAiAgent } from '@polkadot/extension-polkagate/src/messaging';
import { getAndWatchStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../components/translate';

export default function AiTransactionInfo (): React.ReactElement {
  const { t } = useTranslation();

  const [enabled, setEnabled] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100

  useEffect(() => {
    const unsubscribe = getAndWatchStorage(STORAGE_KEY.AI_TX_INFO, setEnabled);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (enabled) {
      loadAiAgent(2, setProgress).catch(console.error);
    }
  }, [enabled]);

  const onChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setStorage(STORAGE_KEY.AI_TX_INFO, checked).catch(console.error);
  }, []);

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='45px 0 15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('AI Transaction Details')}
      </Typography>
      <MySwitch
        checked={Boolean(enabled)}
        columnGap='8px'
        label={t('Enable AI transaction details on dapp signing')}
        onChange={onChange}
      />
      {enabled && progress > 0 && progress < 1 &&
        <LinearProgress value={progress * 100} variant='determinate' sx={{ borderRadius: '14px', mt: 2 }} />
      }
    </Stack>
  );
}
