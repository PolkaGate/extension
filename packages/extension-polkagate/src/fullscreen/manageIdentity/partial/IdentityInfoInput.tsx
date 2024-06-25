// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import { InputWithLabel } from '../../../components';

interface IdentityItemsProps {
  icon?: unknown;
  title: string;
  type?: string;
  value: string | undefined;
  setter: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function IdentityInfoInput({ icon, setter, title, type, value }: IdentityItemsProps): React.ReactElement {
  const setInput = React.useCallback((input: string): void => {
    const encoder = new TextEncoder();
    let byteLength = encoder.encode(input).length;
    let inputVal = input;

    while (byteLength > 32) {
      inputVal = inputVal.substring(0, inputVal.length - 1);
      byteLength = encoder.encode(inputVal).length;
    }

    setter(inputVal);
  }, [setter]);

  return (
    <Grid alignItems='flex-end' container item justifyContent='space-between' m='auto' py='5px' width='65%'>
      <Grid container item xs={icon ? 10.5 : 12}>
        <InputWithLabel
          label={title}
          onChange={setInput}
          type={type}
          value={value}
        />
      </Grid>
      {icon &&
        <Grid container item justifyContent='center' xs={1.5}>
          {icon}
        </Grid>}
    </Grid>
  );
}
