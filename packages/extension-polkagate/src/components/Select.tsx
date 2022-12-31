// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FormControl, InputBase, MenuItem, Select } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';

import Label from './Label';

interface DropdownOption {
  text: string;
  value: string;
}

interface Props {
  defaultValue: string | undefined;
  value: string | undefined;
  onChange?: (value: number | string) => void;
  options: DropdownOption[];
  label: string;
  isDisabled?: boolean;
  _mt?: string | number;
  helperText?: string;
  disabledItems?: string[] | number[];
}

export default function CustomizedSelect({ _mt = 0, defaultValue, disabledItems, helperText, isDisabled = false, label, onChange, options, value }: Props) {
  const BootstrapInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
      '&:focus': {
        // borderRadius: 4,
        borderColor: theme.palette.secondary.main,
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
      },
      backgroundColor: isDisabled ? theme.palette.primary.contrastText : theme.palette.background.paper,
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
      letterSpacing: '-0.015em'
    }
  }));

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) =>
      onChange && onChange(typeof value === 'string' ? value.trim() : value),
    [onChange]
  );

  return (
    <FormControl
      disabled={isDisabled}
      sx={{ mt: `${_mt}`, width: '100%' }}
      variant='standard'
    >
      <Label
        helperText={helperText}
        label={label}
        style={{ fontSize: '14px' }}
      >
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
            '> .MuiSvgIcon-root': {
              color: 'secondary.light',
              fontSize: '30px'
            },
            '> .MuiSvgIcon-root.Mui-disabled': {
              color: 'action.disabledBackground',
              fontSize: '30px'
            },
            width: '100%',
            bgcolor: isDisabled && 'primary.contrastText'
          }}
          value={value}
        >
          {options.map(({ text, value }): React.ReactNode => (
            <MenuItem
              disabled={disabledItems?.includes(value) || disabledItems?.includes(text)}
              key={value}
              sx={{ fontSize: '14px', fontWeight: 300, letterSpacing: '-0.015em' }}
              value={value || text}
            >
              {text}
            </MenuItem>
          ))}
        </Select>
      </Label>
    </FormControl>
  );
}
