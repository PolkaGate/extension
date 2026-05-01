// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, styled, TextField, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

const StyledTextField = styled(TextField, { shouldForwardProp: (prop) => prop !== 'placeholderStyle' })<{ height?: string, placeholderStyle?: React.CSSProperties }>(({ height, placeholderStyle, theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused': {
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        backgroundColor: 'unset',
        borderColor: '#3988FF',
        borderWidth: '2px',
        transition: 'all 150ms ease-out'
      }
    },
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#2D1E4A' : '#FFFFFF',
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      border: `1px solid ${theme.palette.mode === 'dark' ? '#BEAAD833' : theme.palette.border.paper}`,
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: theme.palette.mode === 'dark' ? '#1B133C' : '#FFFFFF',
    border: `1px solid ${theme.palette.mode === 'dark' ? '#BEAAD833' : theme.palette.border.paper}`,
    borderRadius: '12px',
    color: theme.palette.text.secondary,
    height: height ?? '43px',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& input::placeholder': {
    color: theme.palette.text.secondary,
    ...theme.typography['B-4'],
    ...placeholderStyle
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  onInputChange: (input: string) => void;
  style?: React.CSSProperties;
  focused?: boolean;
  placeholder: string;
  placeholderStyle?: React.CSSProperties;
}

function SearchField({ focused = false, onInputChange, placeholder, placeholderStyle, style }: Props) {
  const theme = useTheme();

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(value ?? null);
  }, [onInputChange]);

  return (
    <Container disableGutters sx={style}>
      <StyledTextField
        autoComplete='off'
        autoCorrect='off'
        autoFocus={focused}
        inputProps={{
          autoCapitalize: 'none',
          spellCheck: false
        }}
        fullWidth
        height={style?.height as string}
        onChange={onChange}
        placeholder={placeholder}
        placeholderStyle={placeholderStyle}
        theme={theme}
        type='text'
      />
    </Container>
  );
}

export default SearchField;
