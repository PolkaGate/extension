// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AdvancedDropdownOption } from '../../../util/types';

import { Stack, Typography } from '@mui/material';
import React, { memo, useCallback } from 'react';

import { DropSelect } from '@polkadot/extension-polkagate/src/components';

interface Props<T extends string> {
  label: string;
  onChange: (value: T) => void;
  options: AdvancedDropdownOption[];
  value: T;
  width: number;
}

function TopFilterSelect<T extends string>({ label, onChange, options, value, width }: Props<T>) {
  const _onChange = useCallback((newValue: number | string) => onChange(newValue as T), [onChange]);

  return (
    <Stack alignItems='center' direction='row' gap='8px'>
      <Typography color='text.secondary' sx={{ textTransform: 'uppercase' }} variant='S-1'>
        {label}
      </Typography>
      <DropSelect
        onChange={_onChange}
        options={options}
        scrollTextOnOverflow
        simpleArrow
        style={{ height: '38px', padding: '7px 10px', width: `${width}px` }}
        value={value}
      />
    </Stack>
  );
}

export default memo(TopFilterSelect) as typeof TopFilterSelect;
