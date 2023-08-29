// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { fixFloatingPoint } from '../util/utils';
import InputWithLabel from './InputWithLabel';
import { MAX_AMOUNT_LENGTH } from '../util/constants';

interface Props {
  disabled?: boolean;
  value?: string;
  secondaryBtnText?: string;
  primaryBtnText: string;
  onChangeAmount: (value: string) => void;
  onSecondary?: () => void;
  onPrimary: () => void;
  label: string;
  labelFontSize?: string;
  style?: SxProps<Theme> | undefined;
  inputWidth?: number;
}

export default function AmountWithOptions({ disabled, inputWidth = 8, label, labelFontSize = '14px', onChangeAmount, onPrimary, onSecondary, primaryBtnText, secondaryBtnText, style, value }: Props): React.ReactElement {
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
      <Grid alignItems='flex-start' container direction='column' item justifyContent='center' sx={{ pl: '10px', pt: '20px' }} xs>
        <Grid aria-label='primaryBtn' item onClick={!disabled ? onPrimary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}>
          {primaryBtnText}
        </Grid>
        {secondaryBtnText && onSecondary &&
          <Grid aria-label='secondaryBtn' item onClick={!disabled ? onSecondary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}>
            {secondaryBtnText}
          </Grid>}
      </Grid>
    </Grid>
  );
}
