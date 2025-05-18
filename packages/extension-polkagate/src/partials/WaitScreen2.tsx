// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { loader } from '../assets/gif';
import { Motion } from '../components';
import { useTranslation } from '../hooks';

function WaitScreen2 (): React.ReactElement {
  const { t } = useTranslation();
  const [text, setText] = useState<string>(t('We are working on your transaction.'));

  const handleTxEvent = useCallback((s: CustomEventInit<unknown>) => {
    const event = s.detail;

    if (event) {
      const state = Object.keys(event)[0];

      switch (state) {
        case ('ready'):
          setText(t('The transaction is ready.'));
          break;
        case ('broadcast'):
          setText(t('The transaction is sent.'));
          break;
        case ('inBlock'):
          setText(t('The transaction is now in Blockchain.'));
          break;
        default:
          setText(t(`The transaction is in ${state} state`));
      }
    }
  }, [t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);

  return (
    <Motion variant='slide'>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#110F2A', borderRadius: '14px', gap: '12px', justifyContent: 'center', m: '15px', p: '32px' }}>
        <Box
          component='img'
          src={loader as string}
          sx={{
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)'
              },
              '100%': {
                transform: 'rotate(360deg)'
              }
            },
            animation: 'spin 1.5s linear infinite',
            height: '42px',
            zIndex: 2
          }}
        />
        <Typography color='text.primary' variant='B-3'>
          {text}
        </Typography>
        <Typography color='text.highlight' pt='6px' variant='B-1' width='80%'>
          {t('Please wait a few seconds and don’t close the extension')}
        </Typography>
      </Stack>
    </Motion>
  );
}

export default React.memo(WaitScreen2);
