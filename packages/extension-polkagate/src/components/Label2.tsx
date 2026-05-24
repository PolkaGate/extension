// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { QuestionMarkRounded as QuestionMarkRoundedIcon } from '@mui/icons-material';
import { Grid, type SxProps, type Theme, Tooltip, Typography } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
  label: string;
  style?: SxProps<Theme>;
  helperText?: string;
  labelAlignment?: 'left' | 'center' | 'right';
}

function Label2({ children, helperText, label, labelAlignment = 'left', style }: Props): React.ReactElement<Props> {
  return (
    <Grid container item sx={style}>
      <Grid container item sx={{ maxWidth: helperText ? '95%' : '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Typography fontSize='14px' fontWeight={400} textAlign={labelAlignment} width='100%'>
          {label}
        </Typography>
        {helperText &&
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
                height: '15px',
                width: '15px'
              }}
            />
          </Tooltip>
        }
      </Grid>
      {children}
    </Grid>
  );
}

export default React.memo(Label2);
