// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip, useTheme } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import React from 'react';

import { useIsBlueish, useIsDark } from '../hooks';

interface Props {
  color?: string;
  content: React.ReactNode;
  placement?: 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';
  children: React.ReactElement;
  notShow?: boolean;
}

const MyTooltip = ({ children, color, content, notShow = false, placement = 'bottom' }: Props) => {
  const theme = useTheme();
  const isDark = useIsDark();
  const isBlueish = useIsBlueish();
  const tooltipColor = color || (isDark
    ? (isBlueish ? '#3D476A' : '#674394')
    : '#FFFFFF');
  const textColor = isDark ? '#FFFFFF' : theme.palette.text.primary;
  const borderColor = isDark ? 'transparent' : '#DADFF1';

  return (
    <Tooltip
      arrow
      componentsProps={{
        popper: { sx: { m: '5px' } },
        tooltip: {
          style: { margin: '5px', marginTop: '12px' },
          sx: {
            '& .MuiTooltip-arrow': {
              color: tooltipColor,
              height: '9px'
            },
            backgroundColor: tooltipColor,
            border: '1px solid',
            borderColor,
            boxShadow: isDark ? 'none' : '0px 8px 24px rgba(125, 129, 173, 0.18)',
            borderRadius: '8px',
            color: textColor,
            ...theme.typography['B-4'],
            p: '8px'
          }
        }
      }}
      disableHoverListener={notShow}
      placement={placement}
      slots={{
        transition: Zoom
      }}
      title={content}
    >
      {children}
    </Tooltip>
  );
};

export default MyTooltip;
