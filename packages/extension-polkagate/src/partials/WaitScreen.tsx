// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React from 'react';

import Popup from '../components/Popup';
import { useTranslation } from '../hooks';
import { HeaderBrand } from '.';

interface Props {
  title: string;
  show: boolean;
}

export default function WaitScreen({ show, title }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Popup show={show}>
      <HeaderBrand
        shortBorder
        text={title}
      />
      <Grid container px='20px' justifyContent='center'>
        <Typography
          fontSize='22px'
          fontWeight={300}
          m='auto'
          pb='70px'
          pt='40px'
          width='fit-content'
          align='center'
        >
          {t<string>('We are working on your transaction.')}
        </Typography>
        <Circle
          color='#E30B7B'
          scaleEnd={0.7}
          scaleStart={0.4}
          size={115}
        />
        <Typography
          fontSize='18px'
          fontWeight={300}
          m='auto'
          pt='70px'
          px='20px'
          width='fit-content'
          align='center'
        >
          {t<string>('Please wait a few seconds and don\'t close the extension.')}
        </Typography>
      </Grid>
    </Popup>
  );
}
