// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, TextareaAutosize, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import Label from './Label';

interface Props {
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  fontSize?: string;
  rowsCount?: number;
  label: string;
  onChange?: (value: string) => void;
  value?: string;
  style?: React.CSSProperties | undefined;
}

export default function AutoResizeTextarea({ label, onChange, rowsCount, style, value }: Props): React.ReactElement<Props> {
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
      <Grid container
        sx={{
          '> ::-webkit-scrollbar': { display: 'none', width: 0 },
          '> :focus': { outline: `2px solid ${theme.palette.action.focus}` }
        }}
      >
        <TextareaAutosize
          maxRows={3}
          style={{
            overflowY: 'scroll',
            resize: 'none',
            backgroundColor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: theme.palette.secondary.light,
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 300,
            padding: '0 10px',
            minHeight: '31px',
            lineHeight: '31px',
            fontFamily: 'inherit',
            width: '327px',
            scrollbarWidth: 'none'
          }}
          onChange={_onChange}
          defaultValue={value}
        />
      </Grid>
    </Label>
  );
}
