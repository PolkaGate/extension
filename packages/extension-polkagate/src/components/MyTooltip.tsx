// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip, useTheme } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import React from 'react';

import { useIsBlueish } from '../hooks';

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
  const isBlueish = useIsBlueish();
  const _color = color || (isBlueish ? '#3D476A' : '#674394');

  return (
    <Tooltip
      arrow
      componentsProps={{
        popper: { sx: { m: '5px' } },
        tooltip: {
          style: { margin: '5px', marginTop: '12px' },
          sx: {
            '& .MuiTooltip-arrow': {
              color: _color,
              height: '9px'
            },
            backgroundColor: _color,
            borderRadius: '8px',
            color: '#fff',
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
