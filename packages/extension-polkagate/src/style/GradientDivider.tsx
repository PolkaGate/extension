// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, type SxProps, type Theme } from '@mui/material';
import React from 'react';

interface GradientDividerProps {
  style?: SxProps<Theme>;
  orientation?: 'horizontal' | 'vertical';
  isSelectionLine?: boolean; // Add flag to differentiate selection line
}

/**
 * A customizable gradient divider that supports both horizontal and vertical orientations.
 * It also functions as a selection line when `isSelectionLine` is set to `true`.
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
 * @example
 * // Selection line with animated movement
 * <GradientDivider
 *   isSelectionLine
 *   style={{
 *     transform: `translateX(${leftPosition ? leftPosition - 24 : 7}px)`,
 *     position: 'absolute',
 *     top: '2px',
 *     transition: 'transform 0.3s ease-in-out'
 *   }}
 * />
 *
 * @param {GradientDividerProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered gradient divider.
 */
export default function GradientDivider ({ isSelectionLine = false, orientation = 'horizontal', style }: GradientDividerProps): React.ReactElement {
  const DividerStyle = isSelectionLine
    ? {
      background: 'linear-gradient(263.83deg, rgba(255, 79, 185, 0) 9.75%, #FF4FB9 52.71%, rgba(255, 79, 185, 0) 95.13%)',
      border: 'none',
      height: '2px',
      width: '48px'
    }
    : {
      background: orientation === 'horizontal'
        ? 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)'
        : 'linear-gradient(102deg, rgba(16, 16, 25, 0.1) 0%, rgba(238, 71, 151, 0.5) 50.06%, rgba(16, 16, 25, 0) 100%)',
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
