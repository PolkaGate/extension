// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { CurrencyDisplay } from '../../../components';
import { GradientBorder, GradientDivider } from '../../../style';
import AccountName from './AccountName';
import Currency from './Currency';

const PortfolioContainerStyle = {
  border: '2px solid transparent',
  borderRadius: '24px',
  height: '132px',
  overflow: 'hidden',
  position: 'relative',
  width: '359px'
} as SxProps<Theme>;

const glowBallStyle: React.CSSProperties = {
  backgroundColor: '#FF59EE',
  borderRadius: '50%',
  filter: 'blur(60px)', // Glow effect
  height: '128px',
  left: '35%',
  position: 'absolute',
  top: '-75px',
  width: '100px'
};

const fadeOutStyle = {
  background: 'linear-gradient(180deg, transparent 13.79%, #05091C 100%)',
  height: '220px',
  inset: 0,
  position: 'absolute',
  width: '375px'
} as React.CSSProperties;

function Portfolio (): React.ReactElement {
  return (
    <Container disableGutters sx={PortfolioContainerStyle}>
      <GradientBorder />
      <GradientDivider orientation='vertical' style={{ bottom: 0, left: 0, position: 'absolute', top: 0, width: '2px' }} />
      <GradientDivider orientation='vertical' style={{ bottom: 0, position: 'absolute', right: 0, top: 0, width: '2px' }} />
      <div style={glowBallStyle} />
      <div style={fadeOutStyle} />
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '15px 20px', position: 'relative', zIndex: 1 }}>
        <AccountName accountName='Amir EF' />
        <Currency />
        <Grid container item>
          <CurrencyDisplay
            amount='132134456.1132132'
            decimal={12}
            decimalPartCount={3}
            displayStyle='full'
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Portfolio;
