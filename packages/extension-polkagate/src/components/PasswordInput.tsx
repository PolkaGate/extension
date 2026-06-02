// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Grid, IconButton, InputAdornment, styled, TextField, Typography, useTheme } from '@mui/material';
import { Check, Eye, EyeSlash, FingerScan } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useIsBlueish, useIsDark, useTranslation } from '../hooks';

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'hasError' && prop !== 'isBlueish'
})<{ hasError?: boolean; isBlueish?: boolean }>(({ hasError, isBlueish, theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: hasError ? theme.palette.error.main : theme.palette.border.input
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused': {
      '& div.MuiInputAdornment-root.MuiInputAdornment-positionEnd button': {
        transition: 'all 150ms ease-out'
      },
      '& div.MuiInputAdornment-root.MuiInputAdornment-positionStart button svg path': {
        fill: '#3988FF',
        transition: 'all 150ms ease-out'
      },
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        backgroundColor: 'unset',
        borderColor: hasError ? theme.palette.error.main : theme.palette.text.highlight,
        borderWidth: '2px',
        transition: 'all 150ms ease-out'
      }
    },
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' && isBlueish ? '#222442' : theme.palette.surface.hover,
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      borderColor: isBlueish ? '#2E2B52' : theme.palette.border.input,
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    backgroundColor: theme.palette.mode === 'dark' && isBlueish ? '#2224424D' : theme.palette.surface.popover,
    borderColor: isBlueish ? '#2E2B52' : theme.palette.border.input,
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
  errorMessage?: string;
  title?: string;
  Icon?: Icon;
  biometricDisabled?: boolean;
  isBiometricVerified?: boolean;
  onPassChange: (pass: string) => void;
  onBiometricClick?: () => unknown;
  onEnterPress?: () => unknown;
  isBiometricBusy?: boolean;
  style?: React.CSSProperties;
  focused?: boolean;
  hasError?: boolean;
  value?: string;
  placeholder?: string;
}

function PasswordInput({ Icon, biometricDisabled = false, errorMessage, focused = false, hasError = false, isBiometricBusy = false, isBiometricVerified = false, onBiometricClick, onEnterPress, onPassChange, placeholder, style, title, value }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const isBlueish = useIsBlueish();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [hasPasswordValue, setHasPasswordValue] = useState<boolean>(Boolean(value));
  const [focusing, setFocused] = useState<boolean>(focused);

  const toggle = useCallback(() => setFocused((isFocused) => !isFocused), []);
  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setHasPasswordValue(Boolean(value));

    if (!value) {
      setShowPassword(false);
    }

    onPassChange(value);
  }, [onPassChange]);

  const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), []);
  const handleBiometricClick = useCallback(() => {
    onBiometricClick?.();
  }, [onBiometricClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }
  }, [onEnterPress]);

  const commonColor = useMemo(() => isDark
    ? isBlueish ? theme.palette.text.highlight : theme.palette.primary.main
    : theme.palette.text.secondary, [isBlueish, isDark, theme.palette.primary.main, theme.palette.text.highlight, theme.palette.text.secondary]);
  const iconButtonStyle = useMemo(() => ({
    '&.Mui-disabled': {
      opacity: 0.45
    },
    bgcolor: isDark && isBlueish ? '#222442' : theme.palette.surface.input,
    borderRadius: '8px',
    height: '30px',
    p: 0,
    transition: 'background-color 150ms ease-out',
    width: '30px'
  }), [isBlueish, isDark, theme.palette.surface.input]);
  const biometricButtonStyle = useMemo(() => ({
    ...iconButtonStyle,
    ...(isBiometricVerified
      ? {
        '&:hover': {
          bgcolor: isDark ? '#809ACB33' : '#E3E9FF'
        },
        bgcolor: isDark ? '#809ACB26' : '#EEF1FF'
      }
      : {})
  }), [iconButtonStyle, isBiometricVerified, isDark]);
  const biometricIconColor = isBiometricVerified ? theme.palette.text.highlight : commonColor;
  const hasEndAdornment = hasPasswordValue || Boolean(onBiometricClick);

  const InputIcon = Icon ?? Check;

  useEffect(() => {
    if (value !== undefined) {
      setHasPasswordValue(Boolean(value));

      if (!value) {
        setShowPassword(false);
      }
    }
  }, [value]);

  return (
    <Grid container item sx={style}>
      {title &&
        <Typography display='block' height='20px' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '92%' }} textAlign='left' variant='B-1' width='100%'>
          {title}
        </Typography>
      }
      <StyledTextField
        InputProps={{
          endAdornment: hasEndAdornment
            ? (
              <InputAdornment position='end' sx={{ columnGap: '3px', mr: '2px' }}>
                {hasPasswordValue &&
                  <IconButton
                    aria-label='toggle password visibility'
                    edge={onBiometricClick ? undefined : 'end'}
                    onClick={handleClickShowPassword}
                    sx={iconButtonStyle}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeSlash color={commonColor} size='20' variant='Bulk' />
                      : <Eye color={commonColor} size='20' variant='Bulk' />
                    }
                  </IconButton>
                }
                {onBiometricClick &&
                  <IconButton
                    aria-label={isBiometricVerified ? 'biometrics verified' : 'use biometrics'}
                    disabled={biometricDisabled || isBiometricBusy}
                    edge='end'
                    onClick={handleBiometricClick}
                    sx={biometricButtonStyle}
                  >
                    <FingerScan color={biometricIconColor} size='20' variant={(isBiometricBusy || isBiometricVerified) ? 'Bold' : 'Bulk'} />
                  </IconButton>
                }
              </InputAdornment>
            )
            : undefined,
          startAdornment: (
            <InputAdornment position='start'>
              <InputIcon
                color={hasError ? theme.palette.error.main : focusing ? theme.palette.text.highlight : commonColor}
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
        placeholder={placeholder || t('Password')}
        theme={theme}
        type={showPassword ? 'text' : 'password'}
        value={value}
      />
      {hasError &&
        <Typography color='error.main' sx={{ display: 'flex', height: '6px' }} variant='B-1'>
          { errorMessage ?? t('Wrong password.')}
        </Typography>
      }
    </Grid>
  );
}

export default React.memo(PasswordInput);
