// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import '@vaadin/icons';

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Steps } from '../components';
import { Step } from '../util/types';

interface Props {
  label: string;
  withSteps?: Step;
}

function SubTitle({ label, withSteps }: Props) {
  return (
    <Grid
      container
      item
      justifyContent='center'
      alignItems='center'
    >
      <Grid item
        sx={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '20px', pr: '5px' }}
      >
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
      <Grid item
        container
        justifyContent='center'
        xs={12}>
        <Divider
          sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(SubTitle);
