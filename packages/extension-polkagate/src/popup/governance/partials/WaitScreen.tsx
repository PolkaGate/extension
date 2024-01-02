// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import { Circle, CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  defaultText?: string;
  showCube?: boolean;
}

function WaitScreen({ defaultText, showCube = false }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [text, setText] = useState<string>(defaultText || t<string>('We are working on your transaction.'));

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
    <Grid container direction='column' justifyContent='center' py='50px'>
      <Grid container height='50px' item pb='90px' pt='40px'>
        <Typography align='center' fontSize='22px' fontWeight={300} m='auto'>
          {text}
        </Typography>
      </Grid>
      {showCube
        ? <CubeGrid col={3} color={theme.palette.secondary.main} row={3} size={135} style={{ opacity: '0.4', margin: 'auto' }} />
        : <Circle color='#E30B7B' scaleEnd={0.7} scaleStart={0.4} size={115} style={{ margin: 'auto' }} />
      }
      <Typography sx={{ fontSize: '18px', fontWeight: 300, m: 'auto', pt: '70px', px: '20px', textAlign: 'center', width: 'fit-content' }}>
        {t<string>('Please wait a few seconds and don’t close the window.')}
      </Typography>
    </Grid>
  );
}

export default React.memo(WaitScreen);
