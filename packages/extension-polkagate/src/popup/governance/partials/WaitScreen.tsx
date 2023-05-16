// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '../../../hooks';

function WaitScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [text, setText] = useState<string>(t<string>('We are working on your transaction.'));

  const handleTxEvent = useCallback((s: CustomEventInit<any>) => {
    const event = s.detail;

    if (event) {
      const state = Object.keys(event)[0];

      switch (state) {
        case ('ready'):
          setText(t<string>('The transaction is ready.'));
          break;
        case ('broadcast'):
          setText(t<string>('The transaction is sent.'));
          break;
        case ('inBlock'):
          setText(t<string>('The transaction is now in Blockchain.'));
          break;
        default:
          setText(t<string>(`The transaction is in ${state} state`));
      }
    }
  }, [t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);

  return (
    <Grid container justifyContent='center' py='50px'>
      <Grid container height='50px' item pb='90px' pt='40px'>
        <Typography align='center' fontSize='22px' fontWeight={300} m='auto'>
          {text}
        </Typography>
      </Grid>
      <Circle color='#E30B7B' scaleEnd={0.7} scaleStart={0.4} size={115} />
      <Typography sx={{ fontSize: '18px', fontWeight: 300, m: 'auto', pt: '70px', px: '20px', textAlign: 'center', width: 'fit-content' }}>
        {t<string>('Please wait a few seconds and don’t close the tab')}
      </Typography>
    </Grid>
  );
}

export default React.memo(WaitScreen);
