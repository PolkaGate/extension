// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { inProcess } from '@polkadot/extension-polkagate/src/assets/gif/index';

import { useTranslation } from '../../../hooks';

interface Props {
  defaultText?: string;
}

function WaitScreen ({ defaultText }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [text, setText] = useState<string>(defaultText || t('We are working on your transaction.'));

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
    <Grid container direction='column' justifyContent='center'>
      <Typography align='center' color='#EAEBF1' mt='25px' variant='B-3'>
        {text}
      </Typography>
      <Box component='img' src={inProcess as string} sx={{ alignSelf: 'center', width: '250px' }} />
      <Typography align='center' color='#BEAAD8' variant='B-4'>
        {t('Please wait a few seconds and don’t close the window.')}
      </Typography>
    </Grid>
  );
}

export default React.memo(WaitScreen);
