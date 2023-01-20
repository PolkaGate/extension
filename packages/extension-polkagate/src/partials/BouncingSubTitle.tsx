// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import { Circle } from 'better-react-spinkit';
import React from 'react';

import { Steps } from '../components';
import { Step } from '../util/types';

interface Props {
  label: string;
  withSteps?: Step;
  mt?: string;
  style?: React.CSSProperties;
  lineHeight?: string;
  refresh?: boolean;
  circleStyle?: React.CSSProperties;
}

function BouncingSubTitle({ label, mt, refresh, circleStyle, withSteps, style = { fontSize: '16px', fontWeight: 500, mb: '5px' } }: Props) {
  const theme = useTheme();

  const bounce = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(66px);
  }
  75%{
    transform: translateY(62px);
  }
  100%{
    transform: translateY(63px);
  }
`;

  return (
    <>
      <Grid container item justifyContent='center' position='relative' sx={{ height: '45px', overflow: 'hidden' }}>
        <Grid className='text' item
          sx={{
            // animationDelay: '0.3s',
            animationDuration: '1s',
            animationFillMode: 'forwards',
            animationName: `${bounce}`,
            animationTimingFunction: 'cubic-bezier(1, 0.2, 0.7, 0.7)',
            position: 'absolute',
            pr: '5px',
            top: '-50px'
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
        {refresh &&
          <Grid item sx={{ ...circleStyle }}>
            <Circle color={theme.palette.primary.main} scaleEnd={0.7} scaleStart={0.4} size={25} />
          </Grid>
        }
      </Grid>
      <Grid container item justifyContent='center' xs={12}>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }} />
      </Grid>
    </>
  );
}

export default React.memo(BouncingSubTitle);
