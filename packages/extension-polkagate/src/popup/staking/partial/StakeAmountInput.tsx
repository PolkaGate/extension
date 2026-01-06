// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { LogoInfo } from '../../../util/getLogo2';

import { Collapse, Container, Grid, Stack, styled, type SxProps, TextField, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { AssetLogo, DisplayBalance, GradientDivider, TwoToneText } from '../../../components';
import { useIsExtensionPopup } from '../../../hooks';
import { amountToHuman } from '../../../util';

interface AmountButtonProps extends AmountButtonInputProps {
  onClick: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>, fromButtons?: boolean) => void;
  isExtension: boolean;
}

interface AmountButtonInputProps {
  buttonName: string;
  value: string;
}

const StyledButton = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'isExtension'
})(({ isExtension }: { isExtension: boolean }) => ({
  '&:hover': {
    background: isExtension ? '#809ACB60' : '#3b295eff',
    transition: 'all 150ms ease-in-out'
  },
  alignItems: 'center',
  background: isExtension ? '#809ACB26' : '#2D1E4A',
  borderRadius: '12px',
  cursor: 'pointer',
  justifyContent: 'center',
  padding: '1px 10px',
  width: 'fit-content'
}));

const AmountButton = ({ buttonName, isExtension, onClick, value }: AmountButtonProps) => {
  const handleClick = useCallback(() => {
    onClick({ target: { value } } as React.ChangeEvent<HTMLInputElement>, true);
  }, [onClick, value]);

  return (
    <StyledButton isExtension={isExtension} onClick={handleClick}>
      <Typography color={isExtension ? 'text.highlight' : '#AA83DC'} variant='B-2'>
        {buttonName}
      </Typography>
    </StyledButton>
  );
};

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isExtension' && prop !== 'theme'
})(({ isExtension, theme }: { isExtension: boolean, theme: Theme }) => {
  const fontStyle = {
    fontFamily: isExtension ? 'Inter' : 'OdibeeSans',
    fontSize: isExtension ? '32px' : '30px',
    fontWeight: isExtension ? 500 : 400
  };

  return ({
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
      ...fontStyle,
      height: '43px',
      letterSpacing: '0.6px',
      lineHeight: '140%',
      transition: 'all 150ms ease-out',
      width: '95%'
    },
    '& input': {
      padding: '4px'
    },
    '& input::placeholder': {
      alignItems: 'center',
      color: isExtension ? theme.palette.text.highlight : '#AA83DC',
      ...fontStyle,
      textAlign: 'left'
    },
    padding: '4px',
    transition: 'all 150ms ease-out'
  });
});

interface SubAmountProps {
  amount: BN | undefined;
  title: string;
  dividerStyle?: React.CSSProperties;
  token: string | undefined;
  genesisHash: string | undefined;
  decimal: number | undefined;
  logoInfo: LogoInfo | undefined;
  isExtension?: boolean;
}

const SubAmount = ({ amount, decimal, dividerStyle, genesisHash, isExtension, logoInfo, title, token }: SubAmountProps) => {
  const theme = useTheme();

  return (
    <>
      <GradientDivider style={{ my: '6px', ...dividerStyle }} />
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', gap: '6px', justifyContent: 'space-start', pl: '10px', pt: '8px' }}>
        <Typography color={isExtension ? 'text.highlight' : '#AA83DC'} variant='B-1'>
          {title}
        </Typography>
        <AssetLogo assetSize='18px' genesisHash={genesisHash} logo={logoInfo?.logo} />
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          skeletonStyle={{ width: '70px' }}
          style={{
            color: theme.palette.text.primary,
            fontFamily: 'Inter',
            fontSize: '13px',
            fontWeight: 500,
            width: 'max-content'
          }}
          token={token}
        />
      </Container>
    </>
  );
};

interface Props {
  buttonsArray?: AmountButtonInputProps[];
  decimal: number | undefined;
  dividerStyle?: React.CSSProperties;
  enteredValue?: string;
  errorMessage?: string | undefined;
  focused?: boolean;
  maxLength?: { integer: number; decimal: number };
  numberOnly?: boolean;
  onInputChange: (input: string) => void;
  placeholder?: string;
  style?: SxProps<Theme>;
  bodyStyle?: React.CSSProperties;
  subAmount?: SubAmountProps;
  title?: string;
  titleInColor?: string;
}

export default function StakeAmountInput({ bodyStyle = {}, buttonsArray = [], decimal, dividerStyle = {}, enteredValue, errorMessage, focused, maxLength = { decimal: 4, integer: 8 }, numberOnly = true, onInputChange, placeholder, style, subAmount, title, titleInColor }: Props): React.ReactElement {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const [textFieldValue, setTextFieldValue] = useState<string | null | undefined>();
  const [memorizedErrorMessage, setMemorizedErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    setMemorizedErrorMessage(errorMessage);
  }, [errorMessage]);

  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>, fromButtons?: boolean) => {
    if (fromButtons) {
      const stringValue = String(Number(value) / (10 ** (decimal ?? 0)));

      setTextFieldValue(amountToHuman(value, decimal));
      onInputChange(stringValue);

      return;
    }

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
  }, [decimal, maxLength.decimal, maxLength.integer, numberOnly, onInputChange]);

  return (
    <Stack direction='column' sx={style}>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : '#05091C', border: errorMessage ? '1px solid #FF4FB9' : 'none', borderRadius: '14px', display: 'flex', p: '12px', transition: 'all 150ms ease-out', width: '100%', ...bodyStyle }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', px: '10px' }}>
          <Typography variant='B-1'>
            <TwoToneText
              backgroundColor={isExtension ? '#110F2A' : '#AA83DC26'}
              color={isExtension ? theme.palette.text.highlight : '#AA83DC'}
              text={title ?? ''}
              textPartInColor={titleInColor ?? ''}
            />
          </Typography>
          <Grid container item sx={{ alignItems: 'center', columnGap: '4px', width: 'fit-content' }}>
            {buttonsArray.map(({ buttonName, value }, index) => (
              <AmountButton
                buttonName={buttonName}
                isExtension={isExtension}
                key={index}
                onClick={onChange}
                value={value}
              />
            ))}
          </Grid>
        </Container>
        <GradientDivider style={{ my: '6px', ...dividerStyle }} />
        <StyledTextField
          autoComplete='off'
          autoFocus={focused}
          fullWidth
          isExtension={isExtension}
          onChange={onChange}
          placeholder={placeholder ?? '0.00'}
          theme={theme}
          type='text'
          value={enteredValue ?? textFieldValue ?? ''}
        />
        {subAmount &&
          <SubAmount
            {...subAmount}
            isExtension={isExtension}
          />
        }
      </Stack>
      <Collapse in={!!errorMessage} sx={{ textAlign: 'left', width: '100%' }}>
        <Typography color='#FF4FB9' variant='B-1'>
          {memorizedErrorMessage}
        </Typography>
      </Collapse>
    </Stack>
  );
}
