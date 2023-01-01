// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { QuestionMarkRounded as QuestionMarkRoundedIcon } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
  label: string;
  style?: React.CSSProperties | undefined;
  helperText?: string;
}

function Label({ children, helperText = '', label, style }: Props): React.ReactElement<Props> {
  const ref = useRef(null);
  const [tpLocation, setTpLocation] = useState<string | undefined>();

  useEffect(() => {
    if (ref) {
      setTpLocation(`${ref.current?.offsetWidth + 10}px`);
    }
  }, [ref.current?.offsetWidth, tpLocation]);

  return (
    <div
      style={{ fontSize: '14px', textAlign: 'left', ...style }}
    >
      <Grid ref={ref} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content', maxWidth: '100%' }}>
        {label}
      </Grid>
      {helperText?.length > 0 &&
        <Tooltip
          arrow
          componentsProps={{
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
          placement='top'
          title={helperText}
        >
          <QuestionMarkRoundedIcon
            sx={{
              bgcolor: 'secondary.light',
              borderRadius: '50%',
              color: 'background.default',
              height: '16px',
              left: tpLocation,
              position: 'absolute',
              top: '4px',
              width: '16px'
            }}
          />
        </Tooltip>
      }
      {children}
    </div>
  );
}

export default styled(Label)(() => `
  label {
    font-size: 14px;
    font-weight: 300;
    text-transform: none;
  }
`);
