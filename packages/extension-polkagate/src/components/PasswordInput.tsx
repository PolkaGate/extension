// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, IconButton, InputAdornment, styled, TextField, Typography, useTheme } from '@mui/material';
import { Check, Eye, EyeSlash } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useIsDark, useTranslation } from '../hooks';

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
      backgroundColor: theme.palette.mode === 'dark' ? '#2D1E4A' : '#e5e7ed',
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      borderColor: '#BEAAD833',
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: theme.palette.mode === 'dark' ? '#1B133C' : '#EFF1F9',
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
  title?: string;
  onPassChange: (pass: string) => void;
  onEnterPress?: () => void;
  style?: React.CSSProperties;
  focused?: boolean;
  hasError?: boolean;
}

export default function PasswordInput ({ focused = false, hasError = false, onEnterPress, onPassChange, style, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusing, setFocused] = useState<boolean>(false);

  const toggle = useCallback(() => setFocused((isFocused) => !isFocused), []);

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    onPassChange(value ?? null);
  }, [onPassChange]);

  const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }
  }, [onEnterPress]);

  return (
    <Container disableGutters sx={style}>
      {title &&
        <Typography display='block' height='20px' textAlign='left' variant='B-1' width='100%'>
          {title}
        </Typography>
      }
      <StyledTextField
        InputProps={{
          endAdornment: (
            <InputAdornment position='end' sx={{ mr: '2px' }}>
              <IconButton
                aria-label='toggle password visibility'
                edge='end'
                onClick={handleClickShowPassword}
                sx={{ bgcolor: isDark ? '#2D1E4A' : '#FFFFFF', borderRadius: '8px' }}
              >
                {showPassword
                  ? <EyeSlash color={isDark ? '#AA83DC' : '#8F97B8'} size='20' variant='Bulk' />
                  : <Eye color={isDark ? '#AA83DC' : '#8F97B8'} size='20' variant='Bulk' />
                }
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position='start'>
              <Check
                color={hasError ? '#FF4FB9' : focusing ? '#3988FF' : isDark ? '#AA83DC' : '#8299BD'}
                size='22'
                variant={focusing ? 'Bold' : 'Bulk'}
              />
            </InputAdornment>
          )
        }}
        autoFocus={focused}
        fullWidth
        hasError={hasError}
        onBlur={toggle}
        onChange={onChange}
        onFocus={toggle}
        onKeyDown={handleKeyDown}
        placeholder={t('Password')}
        theme={theme}
        type={showPassword ? 'text' : 'password'}
      />
      {hasError &&
        <Typography color='#FF4FB9' sx={{ display: 'flex', height: '6px' }} variant='B-1'>
          {t('Wrong password.')}
        </Typography>}
    </Container>
  );
}
