// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import type { Step } from '../util/types';

import { Divider, Grid } from '@mui/material';
import React from 'react';

import { Steps } from '../components';

interface Props {
  label: string;
  withSteps?: Step;
  mt?: string;
  style?: React.CSSProperties;
  lineHeight?: string;
}

function SubTitle({ label, lineHeight = '35px', mt, style = { fontSize: '16px', fontWeight: 500, marginBottom: '5px' }, withSteps }: Props) {
  return (
    <Grid alignItems='center' container item justifyContent='center' mt={mt ?? '-15px'} style={{ ...style }}>
      <Grid item sx={{ lineHeight, pr: '5px' }}>
        {label}
      </Grid>
      {withSteps &&
        <Grid item>
          <Steps
            current={withSteps.current}
            style={{ ...style }}
            total={withSteps.total}
          />
        </Grid>
      }
      <Grid container item justifyContent='center' xs={12}>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', margin: 'auto', width: '138px' }} />
      </Grid>
    </Grid>
  );
}

export default React.memo(SubTitle);
