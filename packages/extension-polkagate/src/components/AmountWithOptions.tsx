// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { MAX_AMOUNT_LENGTH } from '../util/constants';
import { formatDecimal } from '../util/utils';
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
    onChangeAmount(formatDecimal(value));
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
      <Grid alignItems='flex-start' direction='column' item justifyContent='center' sx={{ display: 'inline-flex', pl: textSpace, pt: '20px', width: 'fit-content' }}>
        <Typography aria-label='primaryBtn' onClick={!disabled ? onPrimary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline', textWrap: 'noWrap', userSelect: 'none' }}>
          {primaryBtnText}
        </Typography>
        {secondaryBtnText && onSecondary &&
          <Typography aria-label='secondaryBtn' onClick={!disabled ? onSecondary : disabledFunction} role='button' sx={{ color: disabled ? 'text.disabled' : theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', cursor: disabled ? 'default' : 'pointer', fontWeight: 400, textDecorationLine: 'underline', textWrap: 'noWrap', userSelect: 'none' }}>
            {secondaryBtnText}
          </Typography>}
      </Grid>
    </Grid>
  );
}
