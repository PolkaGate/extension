// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useCallback } from 'react';

import { fixFloatingPoint } from '../util/utils';
import InputWithLabel from './InputWithLabel';

interface Props {
  disabled?: boolean;
  value?: string;
  secondaryBtnText?: string;
  primaryBtnText: string;
  onChangeAmount: (value: string) => void;
  onSecondary?: () => void;
  onPrimary: () => void;
  label: string;
  style?: SxProps<Theme> | undefined;
}

export default function AmountWithOptions({ disabled, label, onChangeAmount, onPrimary, onSecondary, primaryBtnText, secondaryBtnText, style, value }: Props): React.ReactElement {
  const _onChange = useCallback((value: string) => {
    onChangeAmount(fixFloatingPoint(value));
  }, [onChangeAmount]);

  const disabledFunction = useCallback(() => null, []);

  return (
    <Grid container sx={style}>
      <Grid item xs={8}>
        <InputWithLabel
          disabled={disabled}
          fontSize={28}
          fontWeight={400}
          height={50}
          label={label}
          onChange={_onChange}
          placeholder={'00.00'}
          type='number'
          value={value}
        />
      </Grid>
      <Grid alignItems='flex-start' container direction='column' item justifyContent='center' sx={{ pl: '10px', pt: '20px' }} xs={4}>
        <Grid aria-label='primaryBtn' item onClick={!disabled ? onPrimary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : 'text.primary', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}>
          {primaryBtnText}
        </Grid>
        {secondaryBtnText && onSecondary &&
          <Grid aria-label='secondaryBtn' item onClick={!disabled ? onSecondary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : 'text.primary', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}>
            {secondaryBtnText}
          </Grid>}
      </Grid>
    </Grid>
  );
}
