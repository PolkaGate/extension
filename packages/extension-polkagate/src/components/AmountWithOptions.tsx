// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { MAX_AMOUNT_LENGTH } from '../util/constants';
import { fixFloatingPoint } from '../util/utils';
import InputWithLabel from './InputWithLabel';

interface Props {
  disabled?: boolean;
  inputWidth?: number;
  label: string;
  labelFontSize?: string;
  onChangeAmount: (value: string) => void;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryBtnText: string;
  secondaryBtnText?: string;
  style?: SxProps<Theme> | undefined;
  textSpace?: string;
  value?: string;
}

export default function AmountWithOptions({ disabled, inputWidth = 8, label, labelFontSize = '14px', onChangeAmount, onPrimary, onSecondary, primaryBtnText, secondaryBtnText, style, textSpace = '10px', value }: Props): React.ReactElement {
  const theme = useTheme();
  const _onChange = useCallback((value: string) => {
    onChangeAmount(fixFloatingPoint(value));
  }, [onChangeAmount]);

  const disabledFunction = useCallback(() => null, []);

  return (
    <Grid container sx={style}>
      <Grid item xs={inputWidth}>
        <InputWithLabel
          disabled={disabled}
          fontSize={28}
          fontWeight={400}
          height={50}
          label={label}
          labelFontSize={labelFontSize}
          onChange={_onChange}
          placeholder={'00.00'}
          type='number'
          value={value?.slice(0, MAX_AMOUNT_LENGTH)}
        />
      </Grid>
      <Grid alignItems='flex-start' container direction='column' item justifyContent='center' sx={{ pl: textSpace, pt: '20px' }} xs>
        <Grid aria-label='primaryBtn' item onClick={!disabled ? onPrimary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline', userSelect: 'none' }}>
          {primaryBtnText}
        </Grid>
        {secondaryBtnText && onSecondary &&
          <Grid aria-label='secondaryBtn' item onClick={!disabled ? onSecondary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline', userSelect: 'none' }}>
            {secondaryBtnText}
          </Grid>}
      </Grid>
    </Grid>
  );
}
