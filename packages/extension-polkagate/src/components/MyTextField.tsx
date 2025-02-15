// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Icon } from 'iconsax-react';

import { Grid, InputAdornment, styled, TextField, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>(({ hasError, theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused': {
      '& div.MuiInputAdornment-root.MuiInputAdornment-positionEnd button': {
        backgroundColor: 'transparent',
        transition: 'all 150ms ease-out'
      },
      '& div.MuiInputAdornment-root.MuiInputAdornment-positionStart button svg path': {
        fill: '#3988FF',
        transition: 'all 150ms ease-out'
      },
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        backgroundColor: 'unset',
        borderColor: hasError ? theme.palette.error.main : '#3988FF',
        borderWidth: '2px',
        transition: 'all 150ms ease-out'
      }
    },
    '&:hover': {
      backgroundColor: '#2D1E4A',
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      borderColor: '#BEAAD833',
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: '#1B133C',
    borderColor: '#BEAAD833',
    borderRadius: '12px',
    color: hasError ? theme.palette.error.main : theme.palette.text.secondary,
    height: '44px',
    marginTop: '10px',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: hasError ? theme.palette.error.main : '#BEAAD833'
  },
  '& input::placeholder': {
    color: hasError ? theme.palette.error.main : theme.palette.text.secondary,
    ...theme.typography['B-4'],
    textAlign: 'left'
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  Icon: Icon;
  focused?: boolean;
  iconSize?: number;
  onEnterPress?: () => void;
  onTextChange: (text: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  title?: string;
}

export default function MyTextField ({ Icon, focused = false, iconSize = 22, onEnterPress, onTextChange, placeholder, style, title }: Props): React.ReactElement {
  const theme = useTheme();

  const [focusing, setFocused] = useState<boolean>(false);

  const toggle = useCallback(() => setFocused((isFocused) => !isFocused), []);

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    onTextChange(value ?? null);
  }, [onTextChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }
  }, [onEnterPress]);

  return (
    <Grid container item sx={style}>
      {title &&
        <Typography height='20px' textAlign='left' variant='B-1' width='100%'>
          {title}
        </Typography>
      }
      <StyledTextField
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              {Icon && <Icon
                color={ focusing ? '#3988FF' : '#AA83DC'}
                size={iconSize}
                variant={focusing ? 'Bold' : 'Bulk'}
              />}
            </InputAdornment>
          )
        }}
        autoFocus={focused}
        fullWidth
        onBlur={toggle}
        onChange={onChange}
        onFocus={toggle}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        theme={theme}
        type= 'text'
      />
    </Grid>
  );
}
