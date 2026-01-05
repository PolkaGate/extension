// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, InputAdornment, Stack, styled, TextField, Typography, useTheme } from '@mui/material';
import { type Icon, InfoCircle } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { MyTooltip } from '.';

const StyledTextFieldSmall = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'errorMessage'
})<{ errorMessage?: string }>(({ errorMessage, theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: errorMessage ? theme.palette.error.main : '#BEAAD833'
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
        borderColor: errorMessage ? theme.palette.error.main : '#3988FF',
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
    '&.Mui-disabled': {
      backgroundColor: '#1B133C', // or a lighter/darker shade
      color: theme.palette.text.disabled,
      '& fieldset': {
        borderColor: theme.palette.text.disabled // or any custom disabled border color
      },
      '& svg path': {
        fill: theme.palette.text.disabled
      }
    },
    backgroundColor: '#1B133C',
    borderColor: '#BEAAD833',
    borderRadius: '12px',
    color: errorMessage ? theme.palette.error.main : theme.palette.text.secondary,
    height: '44px',
    marginTop: '5px',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& input': {
    autocomplete: 'off'
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
    '&::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    },
    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  },
  '& input::placeholder': {
    color: errorMessage ? theme.palette.error.main : theme.palette.text.secondary,
    ...theme.typography['B-4'],
    textAlign: 'left'
  },
  transition: 'all 150ms ease-out'
}));

const StyledTextFieldLarge = styled(TextField)<{ height?: string }>(({ height, theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused': {
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        backgroundColor: 'unset',
        border: 'unset',
        transition: 'all 150ms ease-out'
      }
    },
    '&:hover': {
      background: 'transparent',
      transition: 'all 150ms ease-out'
    },
    '&:hover fieldset': {
      border: 'unset',
      transition: 'all 150ms ease-out',
      zIndex: 0
    },
    background: 'transparent',
    border: 'unset',
    color: theme.palette.primary.main,
    fieldset: {
      border: 'unset'
    },
    fontFamily: 'OdibeeSans',
    fontSize: '30px',
    fontWeight: 400,
    height: height ?? '43px',
    letterSpacing: '-0.19px',
    lineHeight: '140%',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& .MuiInputBase-root.MuiInputBase-adornedStart': {
    paddingLeft: 0
  },
  '& .MuiOutlinedInput-inputAdornedStart': {
    paddingLeft: '0px !important'
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
    '&::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    },
    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  },
  '& input::placeholder': {
    alignItems: 'center',
    color: theme.palette.primary.main,
    fontFamily: 'OdibeeSans',
    fontSize: '30px',
    fontWeight: 400,
    textAlign: 'left'
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  Icon?: Icon;
  errorMessage?: string;
  disabled?: boolean;
  focused?: boolean;
  iconSize?: number;
  inputType?: string;
  inputValue: string | number | undefined | null;
  maxLength?: number;
  mode?: 'small' | 'large';
  onEnterPress?: () => void;
  onTextChange: (text: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  title?: string;
  tooltip?: string;
}

export default function MyTextField({ Icon, disabled, errorMessage, focused = false, iconSize = 22, inputType = 'text', inputValue, maxLength, mode = 'small', onEnterPress, onTextChange, placeholder, style, title, tooltip }: Props): React.ReactElement {
  const theme = useTheme();

  const [focusing, setFocused] = useState<boolean>(false);

  const toggle = useCallback(() => setFocused((isFocused) => !isFocused), []);

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        onTextChange(value);
      }
    } else {
      onTextChange(value ?? null);
    }
  }, [maxLength, onTextChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }
  }, [onEnterPress]);

  const TextFieldComponent = mode === 'small' ? StyledTextFieldSmall : StyledTextFieldLarge;
  const _inputType = maxLength !== undefined && inputType === 'number' ? 'text' : inputType; // set input type to text if maxLength is defined and inputType is number to avoid browser validation issues

  return (
    <Grid container item sx={style}>
      {title &&
        <Stack columnGap='2px' direction='row' sx={{ alignItems: 'center', justifyContent: 'start' }}>
          <Typography height='20px' marginLeft='4px' textAlign='left' variant='B-1' width='100%'>
            {title}
          </Typography>
          {
            !!tooltip &&
            <MyTooltip
              content={tooltip}
            >
              <InfoCircle color={theme.palette.primary.main} size='16' variant='Bold' />
            </MyTooltip>
          }
        </Stack>
      }
      <TextFieldComponent
        InputProps={{
          startAdornment: (
            <InputAdornment position='start' sx={{ marginRight: Icon ? '5px' : 0 }}>
              {
                Icon && <Icon
                  color={focusing ? '#3988FF' : '#AA83DC'}
                  size={iconSize}
                  variant={focusing ? 'Bold' : 'Bulk'}
                />
              }
            </InputAdornment>
          )
        }}
        autoComplete='off'
        autoFocus={focused}
        disabled={disabled}
        fullWidth
        inputProps={{
          maxLength
        }}
        onBlur={toggle}
        onChange={onChange}
        onFocus={toggle}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        theme={theme}
        type={_inputType}
        value={inputValue ?? ''}
      />
      {errorMessage &&
        <Typography color='#FF4FB9' sx={{ display: 'flex', height: '6px' }} variant='B-1'>
          {errorMessage}
        </Typography>
      }
    </Grid>
  );
}
