// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../hooks';

interface GradientDividerProps {
  orientation?: 'horizontal' | 'vertical';
  isBlueish?: boolean;
  style?: SxProps<Theme>;
}

/**
 * A customizable gradient divider that supports both horizontal and vertical orientations.
 *
 * @component
 * @example
 * // Standard horizontal divider
 * <GradientDivider orientation="horizontal" />
 *
 * @example
 * // Vertical divider
 * <GradientDivider orientation="vertical" />
 *
 *
 * @param {GradientDividerProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered gradient divider.
 */
export default function GradientDivider ({ isBlueish, orientation = 'horizontal', style }: GradientDividerProps): React.ReactElement {
  const isDark = useIsDark();

  const DividerStyle = {
    background: orientation === 'horizontal' || isBlueish
      ? `linear-gradient(${isBlueish ? 0 : 90}deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)`
      : isDark
        ? 'linear-gradient(102deg, rgba(16, 16, 25, 0.1) 0%, rgba(238, 71, 151, 0.5) 50.06%, rgba(16, 16, 25, 0) 100%)'
        : 'linear-gradient(90deg, rgba(217, 204, 242, 0) 0%, #FFFFFF 50.06%, rgba(217, 204, 242, 0) 100%)',
    border: 'none',
    height: orientation === 'vertical' ? '100%' : '1px',
    width: orientation === 'vertical' ? '1px' : '100%'
  };

  return (
    <Divider
      orientation={orientation}
      sx={{
        ...DividerStyle,
        ...style
      }}
    />
  );
}
