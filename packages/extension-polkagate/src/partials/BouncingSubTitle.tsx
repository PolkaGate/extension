// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import '@vaadin/icons';

import { Divider, Grid, Typography } from '@mui/material';
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
  0% {
    transform: translateY(0);
  }
  70% {
    transform: translateY(67px);
  }
  85%{
    transform: translateY(63px);
  }
  100%{
    transform: translateY(65px);
  }
`;

  return (
    <>
      <Grid container item justifyContent='center' position='relative' sx={{ height: '45px', overflow: 'hidden' }}>
        <Grid item className='text'
          sx={{
            top:'-50px',
            // animationDelay: '0.3s',
            animationDuration: '1s',
            animationName: `${bounce}`,
            animationFillMode: 'forwards',
            animationTimingFunction: 'cubic-bezier(1, 0.25, 0.8, 0.7)',
            position: 'absolute',
            pr: '5px'
          }}
        >
          <Typography fontSize='20px' fontWeight={400}>
            {label}
          </Typography>
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
