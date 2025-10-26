// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, IconButton, InputAdornment, styled, TextField, Typography, useTheme } from '@mui/material';
import { Check, Eye, EyeSlash } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useIsBlueish, useIsDark, useTranslation } from '../hooks';

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'hasError' && prop !== 'isBlueish'
})<{ hasError?: boolean; isBlueish?: boolean }>(({ hasError, isBlueish, theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: hasError ? theme.palette.error.main : '#BEAAD833'
  },
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
      backgroundColor: theme.palette.mode === 'dark' ? isBlueish ? '#222442' : '#2D1E4A' : '#e5e7ed',
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      borderColor: isBlueish ? '#2E2B52' : '#BEAAD833',
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: theme.palette.mode === 'dark' ? isBlueish ? '#2224424D' : '#1B133C' : '#EFF1F9',
    borderColor: isBlueish ? '#2E2B52' : '#BEAAD833',
    borderRadius: '12px',
    color: hasError ? theme.palette.error.main : isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary,
    height: '44px',
    marginTop: '5px',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& input::placeholder': {
    color: hasError ? theme.palette.error.main : isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary,
    ...theme.typography['B-4'],
    textAlign: 'left'
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  title?: string;
  onPassChange: (pass: string) => void;
  onEnterPress?: () => unknown;
  style?: React.CSSProperties;
  focused?: boolean;
  hasError?: boolean;
  value?: string;
}

function PasswordInput ({ focused = false, hasError = false, onEnterPress, onPassChange, style, title, value }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const isBlueish = useIsBlueish();

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

  const commonColor = useMemo(() => isDark
    ? isBlueish ? theme.palette.text.highlight : '#AA83DC'
    : '#8F97B8', [isBlueish, isDark, theme.palette.text.highlight]);

  return (
    <Grid container item sx={style}>
      {title &&
        <Typography display='block' height='20px' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '92%' }} textAlign='left' variant='B-1' width='100%'>
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
                sx={{ bgcolor: isDark ? isBlueish ? '#222442' : '#2D1E4A' : '#FFFFFF', borderRadius: '8px' }}
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeSlash color={commonColor} size='20' variant='Bulk' />
                  : <Eye color={commonColor} size='20' variant='Bulk' />
                }
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position='start'>
              <Check
                color={hasError ? '#FF4FB9' : focusing ? '#3988FF' : commonColor}
                size='22'
                variant={focusing ? 'Bold' : 'Bulk'}
              />
            </InputAdornment>
          )
        }}
        autoComplete='off'
        autoFocus={focused}
        fullWidth
        hasError={hasError}
        isBlueish={isBlueish}
        onBlur={toggle}
        onChange={onChange}
        onFocus={toggle}
        onKeyDown={handleKeyDown}
        placeholder={t('Password')}
        theme={theme}
        type={showPassword ? 'text' : 'password'}
        value={value}
      />
      {hasError &&
        <Typography color='#FF4FB9' sx={{ display: 'flex', height: '6px' }} variant='B-1'>
          {t('Wrong password.')}
        </Typography>
      }
    </Grid>
  );
}

export default React.memo(PasswordInput);
