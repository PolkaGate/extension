// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import InputWithLabel from './InputWithLabel';

interface Props {
  value?: string;
  secondaryBtnText?: string;
  primaryBtnText: string;
  onChangeAmount: (value: string) => void;
  onSecondary?: () => void;
  onPrimary: () => void;
  label: string;
}

export default function AmountWithOptions({ label, onChangeAmount, onPrimary, onSecondary, primaryBtnText, secondaryBtnText, value }: Props): React.ReactElement {
  console.log('valuevalue:', value)

  return (
    <Grid
      container
    >
      <Grid
        item
        xs={8}
      >
        <InputWithLabel
          fontSize={28}
          fontWeight={400}
          height={50}
          label={label}
          onChange={onChangeAmount}
          placeholder={'00.00'}
          type='number'
          value={value}
        />
      </Grid>
      <Grid
        alignItems='flex-start'
        container
        direction='column'
        item
        justifyContent='center'
        sx={{
          pl: '10px',
          pt: '20px'
        }}
        xs={4}
      >
        <Grid
          item
          onClick={onPrimary}
          sx={{
            cursor: 'pointer',
            fontWeight: 400,
            textDecorationLine: 'underline'
          }}
        >
          {primaryBtnText}
        </Grid>
        <Grid
          item
          onClick={onSecondary}
          sx={{
            cursor: 'pointer',
            fontWeight: 400,
            textDecorationLine: 'underline'
          }}
        >
          {secondaryBtnText}
        </Grid>
      </Grid>
    </Grid>
  );
}
