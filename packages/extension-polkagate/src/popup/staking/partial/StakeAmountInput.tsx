// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid, Stack, styled, type SxProps, TextField, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { GradientDivider, TwoToneText } from '../../../components';

interface AmountButtonProps extends AmountButtonInputProps {
  onClick: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => void
}

interface AmountButtonInputProps {
  buttonName: string;
  value: string;
}

const StyledButton = styled(Grid)(() => ({
  '&:hover': {
    background: '#809ACB60',
    transition: 'all 150ms ease-in-out'
  },
  alignItems: 'center',
  background: '#809ACB26',
  borderRadius: '12px',
  cursor: 'pointer',
  justifyContent: 'center',
  padding: '3px 10px',
  width: 'fit-content'
}));

const AmountButton = ({ buttonName, onClick, value }: AmountButtonProps) => {
  const handleClick = useCallback(() => {
    onClick({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
  }, [onClick, value]);

  return (
    <StyledButton onClick={handleClick}>
      <Typography color='text.highlight' variant='B-2'>
        {buttonName}
      </Typography>
    </StyledButton>
  );
};

const StyledTextField = styled(TextField)<{ height?: string }>(({ height, theme }) => ({
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
    color: theme.palette.text.primary,
    fieldset: {
      border: 'unset'
    },
    fontSize: '32px',
    fontWeight: 500,
    height: height ?? '43px',
    letterSpacing: '0.6px',
    lineHeight: '140%',
    transition: 'all 150ms ease-out',
    width: '100%'
  },
  '& input': {
    padding: '4px'
  },
  '& input::placeholder': {
    alignItems: 'center',
    color: theme.palette.text.highlight,
    fontSize: '32px',
    fontWeight: 500,
    textAlign: 'left'
  },
  transition: 'all 150ms ease-out'
}));

interface Props {
  style: SxProps<Theme>;
  title?: string;
  titleInColor?: string;
  buttonsArray?: AmountButtonInputProps[];
  focused?: boolean;
  placeholder?: string;
  onInputChange: (input: string) => void;
  numberOnly?: boolean;
  maxLength?: { integer: number; decimal: number };
  enteredValue?: string;
}

export default function StakeAmountInput ({ buttonsArray = [], enteredValue, focused, maxLength = { decimal: 4, integer: 8 }, numberOnly = true, onInputChange, placeholder, style, title, titleInColor }: Props): React.ReactElement {
  const theme = useTheme();

  const [textFieldValue, setTextFieldValue] = useState<string | null | undefined>();

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (numberOnly) {
      // Allow decimal point and numbers only
      const filteredValue = value.replace(/[^0-9.]/g, '');

      // Handle multiple decimal points by keeping only the first one
      const parts = filteredValue.split('.');
      let formattedValue = parts[0];

      if (parts.length > 1) {
        // We have at least one decimal point
        formattedValue += '.' + parts.slice(1).join('');
      }

      // Apply length limits
      const decimalPointIndex = formattedValue.indexOf('.');

      if (decimalPointIndex === -1) {
        // No decimal point, just integer part
        formattedValue = formattedValue.slice(0, maxLength.integer);
      } else {
        // Have integer and decimal parts
        const integerPart = formattedValue.slice(0, decimalPointIndex);
        const decimalPart = formattedValue.slice(decimalPointIndex + 1);

        // Apply limits to each part
        const limitedInteger = integerPart.slice(0, maxLength.integer);
        const limitedDecimal = decimalPart.slice(0, maxLength.decimal);

        formattedValue = limitedInteger + (decimalPart ? '.' + limitedDecimal : '.');
      }

      setTextFieldValue(formattedValue);
      onInputChange(formattedValue);
    } else {
      // If numberOnly is false, just pass the value as is
      setTextFieldValue(value);
      onInputChange(value);
    }
  }, [maxLength, numberOnly, onInputChange]);

  return (
    <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#110F2A', borderRadius: '14px', display: 'flex', p: '12px', width: '100%', ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <TwoToneText
          backgroundColor='#110F2A'
          color={theme.palette.text.highlight}
          text={title ?? ''}
          textPartInColor={titleInColor ?? ''}
        />
        <Grid container item sx={{ alignItems: 'center', columnGap: '4px', width: 'fit-content' }}>
          {buttonsArray.map(({ buttonName, value }, index) => (
            <AmountButton
              buttonName={buttonName}
              key={index}
              onClick={onChange}
              value={value}
            />
          ))}
        </Grid>
      </Container>
      <GradientDivider style={{ my: '6px' }} />
      <StyledTextField
        autoFocus={focused}
        fullWidth
        onChange={onChange}
        placeholder={placeholder ?? '0.00'}
        theme={theme}
        type='text'
        value={enteredValue ?? textFieldValue ?? ''}
      />
    </Stack>
  );
}
