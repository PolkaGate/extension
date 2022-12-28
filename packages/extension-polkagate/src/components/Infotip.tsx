// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { QuestionMarkRounded as QuestionMarkRoundedIcon } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text: NonNullable<React.ReactNode> | string | null | undefined;
  children: React.ReactElement<any, any>;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-end' | 'bottom-start' | 'left-end' | 'left-start' | 'right-end' | 'right-start' | 'top-end' | 'top-start' | undefined
  showQuestionMark?: boolean;
  iconTop?: number;
  iconLeft?: number;
  fontSize?: string;
}

function Infotip({ children, fontSize = '14px', iconLeft = 10, iconTop = 4, placement = 'top', showQuestionMark = false, text }: Props): React.ReactElement<Props> {
  const ref = useRef(null);
  const [tpLocation, setTpLocation] = useState<number | undefined>();

  useEffect(() => {
    if (ref) {
      setTpLocation(ref.current?.offsetWidth + iconLeft);
    }
  }, [iconLeft, ref.current?.offsetWidth, tpLocation]);

  return (
    <Grid item ref={ref} style={{ position: 'relative' }}>
      <div>
        {children}
      </div>
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
              fontSize,
              fontWeight: 400
            }
          }
        }}
        enterDelay={500}
        // enterNextDelay={7000}
        leaveDelay={500}
        placement={placement}
        title={text || ''}
      >
        <div>
          {showQuestionMark &&
            <QuestionMarkRoundedIcon
              sx={{
                bgcolor: 'secondary.light',
                borderRadius: '50%',
                color: 'background.default',
                height: '15px',
                left: `${tpLocation}px`,
                position: 'absolute',
                top: `${iconTop}px`,
                width: '15px'
              }}
            />
          }
        </div>
      </Tooltip>
    </Grid>
  );
}

export default React.memo(Infotip);
