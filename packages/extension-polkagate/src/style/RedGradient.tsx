// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface Props {
  style?: React.CSSProperties;
}

const GlowBox = ({ style }: Props) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '200px',
    position: 'absolute',
    width: '450px',
    ...style
  };

  const ballStyle: React.CSSProperties = {
    borderRadius: '50%',
    filter: 'blur(70px)', // Glow effect
    height: '150px',
    opacity: 0.8,
    position: 'absolute',
    width: '150px'
  };

  const leftBallStyle: React.CSSProperties = {
    ...ballStyle,
    backgroundColor: '#5B00B6',
    left: '10%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  };

  const middleBallStyle: React.CSSProperties = {
    ...ballStyle,
    backgroundColor: '#FF1AB1',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  };

  const rightBallStyle: React.CSSProperties = {
    ...ballStyle,
    backgroundColor: '#5B00B6',
    right: '10%',
    top: '50%',
    transform: 'translate(50%, -50%)'
  };

  return (
    <div style={containerStyle}>
      <div style={leftBallStyle}></div>
      <div style={middleBallStyle}></div>
      <div style={rightBallStyle}></div>
    </div>
  );
};

export default GlowBox;
