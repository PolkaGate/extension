// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip, useTheme } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import React from 'react';

interface CustomTooltipProps {
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
}

const MyTooltip = ({ children, content, placement = 'bottom' }: CustomTooltipProps) => {
  const theme = useTheme();

  return (
    <Tooltip
      arrow
      componentsProps={{
        popper: { sx: { m: '5px' } },
        tooltip: {
          style: { margin: '5px', marginTop: '12px' },
          sx: {
            '& .MuiTooltip-arrow': {
              color: '#674394',
              height: '9px'
            },
            backgroundColor: '#674394',
            borderRadius: '8px',
            color: '#fff',
            ...theme.typography['B-4'],
            p: '8px'
          }
        }
      }}
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
