// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { Tooltip } from '@mui/material';
import React, { useCallback } from 'react';

interface Props {
  actionHappened: boolean;
  children: React.ReactElement<any, any>;
  fontSize?: number;
  setIsHappened: (value: React.SetStateAction<boolean>) => void;
  title: string;
  helperText?: string;
}

export default function OnActionToolTip({ actionHappened, children, fontSize = 14, helperText = '', setIsHappened, title }: Props): React.ReactElement<Props> {
  const handelCloseToolTip = useCallback(() => {
    setTimeout(() => setIsHappened(false), 200);
  }, [setIsHappened]);

  return (
    <Tooltip
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
            },
            // visibility: actionHappened ? 'visible' : 'hidden'
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
            fontSize: `${fontSize}px`,
            fontWeight: 400
          }
        }
      }}
      leaveDelay={700}
      onClose={handelCloseToolTip}
      placement='top'
      title={actionHappened ? title : helperText}
    >
      {children}
    </Tooltip>
  );
}
