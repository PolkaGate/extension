// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { Grid, TextareaAutosize, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import Label from './Label';

interface Props {
  maxRows?: number;
  label: string;
  onChange?: (value: string) => void;
  value?: string;
  style?: React.CSSProperties | undefined;
  width?: string;
}

export default function AutoResizeTextarea({ label, maxRows = 3, onChange, style, value, width = '327px' }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
      onChange && onChange(value);
    },
    [onChange]
  );

  return (
    <Label
      label={label}
      style={style}
    >
      <Grid
        container
        sx={{
          '> ::-webkit-scrollbar': { display: 'none', width: 0 },
          '> :focus': { outline: `2px solid ${theme.palette.action.focus}` }
        }}
      >
        <TextareaAutosize
          defaultValue={value}
          maxRows={maxRows}
          onChange={_onChange}
          style={{
            backgroundColor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: theme.palette.secondary.light,
            borderRadius: '5px',
            fontFamily: 'inherit',
            fontSize: '18px',
            fontWeight: 300,
            lineHeight: '31px',
            minHeight: '31px',
            overflowY: 'scroll',
            padding: '0 10px',
            resize: 'none',
            scrollbarWidth: 'none',
            width
          }}
        />
      </Grid>
    </Label>
  );
}
