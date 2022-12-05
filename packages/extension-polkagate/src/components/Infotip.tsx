// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { QuestionMarkRounded as QuestionMarkRoundedIcon } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text: string | null | undefined;
  children: React.ReactElement<any, any>;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-end' | 'bottom-start' | 'left-end' | 'left-start' | 'right-end' | 'right-start' | 'top-end' | 'top-start' | undefined
  showQuestionMark?: boolean;
  iconTop?: number;
  iconLeft?: number;
}

function Infotip({ children, iconLeft = 10, iconTop = 4, placement = 'top', showQuestionMark = false, text }: Props): React.ReactElement<Props> {
  const ref = useRef(null);
  const [tpLocation, setTpLocation] = useState<string | undefined>();

  useEffect(() => {
    if (ref) {
      setTpLocation(`${ref.current?.offsetWidth + iconLeft}px`);
    }
  }, [iconLeft, ref.current?.offsetWidth, tpLocation]);

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
      <div ref={ref} style={{ position: 'relative' }}>
        {children}
        {showQuestionMark &&
          <QuestionMarkRoundedIcon
            sx={{
              bgcolor: 'secondary.light',
              borderRadius: '50%',
              color: 'background.default',
              height: '15px',
              left: tpLocation,
              position: 'absolute',
              top: `${iconTop}px`,
              width: '15px'
            }}
          />
        }
      </div>
    </Tooltip>
  );
}

export default React.memo(Infotip);
