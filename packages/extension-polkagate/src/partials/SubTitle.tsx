// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
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
}

function SubTitle({ label, mt, withSteps, style = { fontSize: '16px' } }: Props) {
  return (
    <Grid alignItems='center' container item justifyContent='center' mt={mt ?? 0} style={{ ...style }}>
      <Grid item sx={{ fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '20px', mb: '5px', pr: '5px' }}>
        {label}
      </Grid>
      {withSteps &&
        <Grid item>
          <Steps
            current={withSteps.current}
            total={withSteps.total}
          />
        </Grid>
      }
      <Grid container item justifyContent='center' xs={12} >
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
      </Grid>
    </Grid>
  );
}

export default React.memo(SubTitle);
