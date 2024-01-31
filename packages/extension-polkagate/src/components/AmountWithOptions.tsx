// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
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

export default function AmountWithOptions({ disabled, inputWidth, label, labelFontSize = '14px', onChangeAmount, onPrimary, onSecondary, primaryBtnText, secondaryBtnText, style, textSpace = '10px', value }: Props): React.ReactElement {
  const theme = useTheme();
  const _onChange = useCallback((value: string) => {
    onChangeAmount(fixFloatingPoint(value));
  }, [onChangeAmount]);

  const disabledFunction = useCallback(() => null, []);

  return (
    <Grid container flexWrap='nowrap' sx={style}>
      <Grid item xs={inputWidth || true}>
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
      <Grid item justifyContent='center' direction='column' alignItems='flex-start' sx={{ pl: textSpace, pt: '20px', width: 'fit-content', display: 'inline-flex' }}>
        <Typography aria-label='primaryBtn' onClick={!disabled ? onPrimary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline', userSelect: 'none' }}>
          {primaryBtnText}
        </Typography>
        {secondaryBtnText && onSecondary &&
          <Typography aria-label='secondaryBtn' onClick={!disabled ? onSecondary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline', userSelect: 'none' }}>
            {secondaryBtnText}
          </Typography>}
      </Grid>
    </Grid>
  );
}
