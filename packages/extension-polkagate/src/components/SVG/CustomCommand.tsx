// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface CustomCloseSquareProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
  secondaryColor?: string;
  size?: string;
}

export const CustomCommand: React.FC<CustomCloseSquareProps> = ({ className, color, onClick, secondaryColor, size = '48', style }) => (
  <svg
    className={className}
    height={size}
    onClick={onClick}
    style={{ ...style, cursor: onClick ? 'pointer' : 'default' }}
    viewBox='0 0 200 200'
    width={size}
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect
      fill={color}
      height='100'
      width='100'
      x='0'
      y='100'
    />
    <rect
      fill={secondaryColor}
      height='100'
      width='100'
      x='100'
      y='0'
    />
  </svg>
);

export default CustomCommand;
