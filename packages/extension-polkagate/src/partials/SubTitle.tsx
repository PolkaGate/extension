// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import '@vaadin/icons';

import { Divider, Grid } from '@mui/material';
import React from 'react';

import { Steps } from '../components';
import { Step } from '../util/types';

interface Props {
  label: string;
  withSteps?: Step;
  mt?: string;
  style?: React.CSSProperties;
  lineHeight?: string;
}

function SubTitle({ label, mt, withSteps, lineHeight = '35px', style = { fontSize: '16px', fontWeight: 500, mb: '5px' } }: Props) {
  return (
    <Grid alignItems='center' container item justifyContent='center' mt={mt ?? '-15px'} style={{ ...style }}>
      <Grid item sx={{ lineHeight, pr: '5px' }} >
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
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
      </Grid>
    </Grid>
  );
}

export default React.memo(SubTitle);
