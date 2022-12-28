// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useState, useEffect } from 'react';

import Popup from '../components/Popup';
import { useTranslation } from '../hooks';
import { HeaderBrand } from '.';

interface Props {
  title: string;
  show: boolean;
  event?: any;
}

function WaitScreen({ event, show, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [text, setText] = useState<string>();

  useEffect(() => {
    if (!event) {
      return setText(t<string>('We are working on your transaction.'))
    }

    const state = Object.keys(event)[0];

    switch (state) {
      case ('ready'):
        setText(t<string>('Transaction is ready.'));
        break;
      case ('broadcast'):
        setText(t<string>('Transaction is sent.'));
        break;
      case ('inBlock'):
        setText(t<string>('Transaction is now in Blockchain.'));
        break;
      default:
        setText(t<string>(`Transaction is in ${state} state`));
    }
  }, [event, t]);

  return (
    <Popup show={show}>
      <HeaderBrand
        shortBorder
        text={title}
      />
      <Grid container px='20px' justifyContent='center'>
        <Grid item height='50px' xs={12} pb='70px' pt='40px'>
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
