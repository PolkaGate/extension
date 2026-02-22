// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface CustomCloseSquareProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
  size?: string;
}

export const CustomCloseSquare: React.FC<CustomCloseSquareProps> = ({ className,
  color,
  onClick,
  size = '48',
  style }) => (
  <svg
    className={className}
    fill='none'
    height={size}
    onClick={onClick}
    style={style}
    viewBox='0 0 24 24'
    width={size}
    xmlns='http://www.w3.org/2000/svg'
  >
    {/* Outer rounded square */}
    <path
      d='m9.17 14.83 5.66-5.66M14.83 14.83 9.17 9.17M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7Z'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
    {/* Cross symbol */}
    <path
      d='m9.17 14.83 5.66-5.66M14.83 14.83 9.17 9.17'
      stroke='white'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
  </svg>
);

export default CustomCloseSquare;
