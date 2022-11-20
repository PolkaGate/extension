// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip } from '@mui/material';
import React from 'react';

interface Props {
  text: string | null | undefined;
  children: React.ReactElement<any, any>;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-end' | 'bottom-start' | 'left-end' | 'left-start' | 'right-end' | 'right-start' | 'top-end' | 'top-start' | undefined
}

function Infotip({ children, placement = 'top', text }: Props): React.ReactElement<Props> {
  return (
    <Tooltip
      arrow
      componentsProps={{
        popper: {
          sx: {
            '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
              mb: '3px',
              p: '3px 15px'
            },
            '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
              mb: '3px',
              p: '3px 15px'
            }
          }
        },
        tooltip: {
          sx: {
            '& .MuiTooltip-arrow': {
              color: 'text.primary',
              height: '10px'
            },
            backgroundColor: 'text.primary',
            color: 'text.secondary',
            fontSize: '14px',
            fontWeight: 400
          }
        }
      }}
      leaveDelay={500}
      placement={placement}
      title={text || ''}
    >
      {children}
    </Tooltip>
  );
}

export default React.memo(Infotip);
