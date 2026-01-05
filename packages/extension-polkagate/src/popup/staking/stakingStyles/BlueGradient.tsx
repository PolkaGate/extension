// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { styled } from '@mui/material';
import React from 'react';

import { useIsDark } from '../../../hooks';

interface Props {
  style?: React.CSSProperties;
  id?: string;
}

const BlueGradient = ({ id, style }: Props) => {
  const isDark = useIsDark();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '200px',
    position: 'absolute',
    right: '-10%', // positioned in the middle
    top: 0,
    width: '450px'
  };

  const ballStyle: React.CSSProperties = {
    borderRadius: '50%',
    filter: 'blur(80px)', // Glow effect
    height: '150px',
    opacity: 0.9,
    position: 'absolute',
    width: '150px'
  };

  const LeftBall = styled('div')(() => ({
    ...ballStyle,
    backgroundColor: isDark ? '#0400B6' : '#FFFFFF',
    left: '10%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }));

  const MiddleBall = styled('div')(() => ({
    ...ballStyle,
    backgroundColor: isDark ? '#1A9FFF' : '#F5CEFF',
    left: '50%',
    top: '35%',
    transform: 'translate(-50%, -50%)'
  }));

  const RightBall = styled('div')(() => ({
    ...ballStyle,
    backgroundColor: isDark ? '#0400B6' : '#FFFFFF',
    right: '10%',
    top: '50%',
    transform: 'translate(50%, -50%)'
  }));

  return (
    <div id={id} style={{ ...containerStyle, ...style }}>
      <LeftBall />
      <MiddleBall />
      <RightBall />
    </div>
  );
};

export default BlueGradient;
