// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FormControl, InputBase, InputLabel, MenuItem, Select } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    '&:focus': {
      // borderRadius: 4,
      borderColor: theme.palette.secondary.main,
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    },
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
    fontSize: '14px',
    fontWeight: '300',
    letterSpacing: '-0.015em',
    padding: '5px 10px 0px',
    transition: theme.transitions.create(['border-color', 'box-shadow'])
  },
  'label + &': {
    fontSize: '10px',
    fontWeight: '300',
    letterSpacing: '-0.015em',
    marginTop: theme.spacing(3)
  }

}));

interface DropdownOption {
  text: string;
  value: string;
}

interface Props {
  defaultValue: string | undefined;
  onChange?: (value: string) => void;
  options: DropdownOption[];
  label: string;
}

export default function CustomizedSelect({ defaultValue, label, onChange, options }: Props) {
  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) =>
      onChange && onChange(value.trim()),
    [onChange]
  );

  return (
    <FormControl
      sx={{ width: '100%' }}
      variant='standard'
    >
      <InputLabel
        htmlFor='selectChain'
        sx={{ color: 'text.primary', fontSize: '18px', fontWeight: 300, transformOrigin: 'left bottom', letterSpacing: '-0.015em' }}
        variant='standard'

      >
        {label}
      </InputLabel>
      <Select
        defaultValue={defaultValue}
        id='selectChain'
        input={<BootstrapInput />}
        onChange={_onChange}
        sx={{
          '> #selectChain': {
            borderColor: 'secondary.light',
            borderRadius: '5px',
            fontSize: '18px',
            height: '29px',
            lineHeight: '32px',
            p: 0,
            pl: '10px',
            textAlign: 'left'
          },
          '> .MuiSvgIcon-root': { color: 'secondary.light', fontSize: '30px' }
        }}
      >
        {options.map(({ text, value }): React.ReactNode => (
          <MenuItem
            key={value}
            sx={{ fontSize: '14px', fontWeight: 300, letterSpacing: '-0.015em' }}
            value={value !== '' ? value : text}
          >
            {text}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
