// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useState, useEffect, useCallback } from 'react';

import Popup from '../components/Popup';
import { useTranslation } from '../hooks';
import { HeaderBrand } from '.';

interface Props {
  title: string;
  show: boolean;
}

function WaitScreen({ show, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [text, setText] = useState<string>(t<string>('We are working on your transaction.'));

  const handleTxEvent = useCallback((s: CustomEventInit<any>) => {
    const event = s.detail

    console.log('state:', s.detail);

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

  // useEffect(() => {
  //   if (!show) {
  //     return () => window.removeEventListener('transactionState', handleTxEvent);
  //   }
  // }, [handleTxEvent, show]);

  return (
    <Popup show={show}>
      <HeaderBrand
        shortBorder
        text={title}
      />
      <Grid container px='20px' justifyContent='center'>
        <Grid item height='50px' xs={12} pb='90px' pt='40px'>
          <Typography fontSize='22px' fontWeight={300} m='auto' align='center'>
            {text}
          </Typography>
        </Grid>
        <Circle
          color='#E30B7B'
          scaleEnd={0.7}
          scaleStart={0.4}
          size={115}
        />
        <Typography fontSize='18px' fontWeight={300} m='auto' pt='70px' px='20px' width='fit-content' align='center'>
          {t<string>('Please wait a few seconds and don\'t close the extension.')}
        </Typography>
      </Grid>
    </Popup>
  );
}

export default React.memo(WaitScreen);
