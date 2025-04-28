// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, styled, TextField, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

const StyledTextField = styled(TextField)<{ height?: string }>(({ height, theme }) => ({
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
      backgroundColor: '#2D1E4A',
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      border: '1px solid #BEAAD833',
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: '#1B133C',
    border: '1px solid #BEAAD833',
    borderRadius: '12px',
    color: theme.palette.text.secondary,
    height: height ?? '43px',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& input::placeholder': {
    color: theme.palette.text.secondary,
    ...theme.typography['B-4']
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  onInputChange: (input: string) => void;
  style?: React.CSSProperties;
  focused?: boolean;
  placeholder: string;
}

function SearchField ({ focused = false, onInputChange, placeholder, style }: Props) {
  const theme = useTheme();

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(value ?? null);
  }, [onInputChange]);

  return (
    <Container disableGutters sx={style}>
      <StyledTextField
        autoFocus={focused}
        fullWidth
        height={style?.height as string}
        onChange={onChange}
        placeholder={placeholder}
        theme={theme}
        type='text'
      />
    </Container>
  );
}

export default SearchField;
