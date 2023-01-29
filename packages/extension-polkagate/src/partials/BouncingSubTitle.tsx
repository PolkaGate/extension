// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a bouncing subtitle beneath the header
 * */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import { Circle } from 'better-react-spinkit';
import React from 'react';

interface Props {
  label: string;
  lineHeight?: string;
  refresh?: boolean;
  circleStyle?: React.CSSProperties;
}

function BouncingSubTitle({ circleStyle, label, refresh }: Props) {
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
