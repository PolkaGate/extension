// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { IconButton, InputAdornment, styled, TextField, Typography, useTheme } from '@mui/material';
import { Check, Eye, EyeSlash } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useTranslation } from '../hooks';

const StyledTextField = styled(TextField)(({ theme }) => ({
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
      borderColor: '#BEAAD833',
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: '#1B133C',
    borderColor: '#BEAAD833',
    borderRadius: '12px',
    color: theme.palette.text.secondary,
    height: '44px',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& input::placeholder': {
    color: theme.palette.text.secondary,
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: 500
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  title?: string;
  onPassChange: (pass: string) => void;
  onEnterPress?: () => void;
}

export default function PasswordInput ({ onEnterPress, onPassChange, title }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);

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
    <>
      {title &&
        <Typography fontFamily='Inter' fontSize='13px' fontWeight={500} mb='12px' textAlign='left' width='100%'>
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
                sx={{ bgcolor: '#2D1E4A', borderRadius: '8px' }}
              >
                {showPassword
                  ? <EyeSlash color='#AA83DC' size='20' variant='Bulk' />
                  : <Eye color='#AA83DC' size='20' variant='Bulk' />
                }
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position='start'>
              <Check color={focused ? '#3988FF' : '#AA83DC'} size='22' variant={focused ? 'Bold' : 'Bulk'} />
            </InputAdornment>
          )
        }}
        fullWidth
        onBlur={toggle}
        onChange={onChange}
        onFocus={toggle}
        onKeyDown={handleKeyDown}
        placeholder={t('Password')}
        theme={theme}
        type={showPassword ? 'text' : 'password'}
      />
    </>
  );
}
