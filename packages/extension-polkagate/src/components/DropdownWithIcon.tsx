// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, SxProps, Theme } from '@mui/material';
import React from 'react';

import Select from './Select';

interface DropdownOption {
  text: string;
  value: string;
}

interface Props {
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
  options: DropdownOption[];
  label: string;
  icon?: string;
  style: SxProps<Theme> | undefined;
}

export default function DropdownWithIcon({ defaultValue, icon = undefined, label, onChange, options, style }: Props) {
  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' pt={1} sx={{ ...style }}>
      <Grid item xs={10.5}>
        <Select
          defaultValue={defaultValue}
          label={label}
          onChange={onChange}
          options={options}
          showLogo
        />
      </Grid>
      <Grid item pl={1} xs={1.5}>
        {icon
          ? <Avatar src={icon} sx={{ height: 31, width: 31, borderRadius: '50%' }} variant='square' />
          : <Grid sx={{ bgcolor: 'action.disabledBackground', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', height: '31px', width: '31px' }}>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
