// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import '@vaadin/icons';

import { Divider, Grid } from '@mui/material';
import { keyframes } from '@mui/system';
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

function BouncingSubTitle({ label, mt, withSteps, style = { fontSize: '16px', fontWeight: 500, mb: '5px' } }: Props) {
  const bounce = keyframes`
  from {
    transform: translateY(0) scale(1);  
  }
  to {
    transform: translateY(20px) scale(1, 0.7);
  }
`;

  return (
    <>
      <Grid container item justifyContent='center' position='relative' sx={{ height: '45px', fontSize: '20px', fontWeight: 400 }}>
        <Grid item
          sx={{
            animationDuration: '1s',
            animationName: `${bounce}`,
            animationTimingFunction: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
            position: 'absolute',
            pr: '5px',
            top: '5px'
          }}
        >
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

      </Grid>
      <Grid container item justifyContent='center' xs={12} >
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
      </Grid>
    </>
  );
}

export default React.memo(BouncingSubTitle);
