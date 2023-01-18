// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, FormControl, Grid, InputBase, MenuItem, Select, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';

import getLogo from '../util/getLogo';
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
  showLogo?: boolean;
  _mt?: string | number;
  helperText?: string;
  disabledItems?: string[] | number[];
}

export default function CustomizedSelect({ _mt = 0, defaultValue, disabledItems, helperText, isDisabled = false, label, onChange, options, showLogo = false, value }: Props) {
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

  const chainName = useCallback((text: string) => text.replace(' Relay Chain', '')?.replace(' Network', '').toLowerCase(), []);

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
          MenuProps={{
            // MenuListProps: {
            //   sx: {
            //     '> li.Mui-selected': {
            //       bgcolor: 'text.disabled'
            //     },
            //     '> li:hover': {
            //       bgcolor: 'secondary.contrastText'
            //     },
            //     bgcolor: 'background.paper'
            //   }
            // },
            PaperProps: {
              sx: {
                '&::-webkit-scrollbar': {
                  display: 'none',
                  width: 0
                },
                border: '2px solid',
                borderColor: 'secondary.light',
                borderRadius: '7px',
                filter: 'drop-shadow(-4px 4px 4px rgba(0, 0, 0, 0.15))',
                mt: '10px',
                overflow: 'hidden',
                overflowY: 'scroll',
                // maxHeight: innerHeight - 300
              }
            }
          }}
          defaultValue={defaultValue}
          id='selectChain'
          input={<BootstrapInput />}
          onChange={_onChange}
          // eslint-disable-next-line react/jsx-no-bind
          renderValue={(value) => {
            if (value === 'Allow use on any chain') {
              return value;
            } else {
              const text = options.find((option) => value === option.value)?.text;

              return text;
            }

            return;
          }
          }
          sx={{
            '> #selectChain': {
              border: '1px solid',
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
            bgcolor: isDisabled ? 'primary.contrastText' : 'transparent'
          }}
          value={value}
        >
          {options.map(({ text, value }): React.ReactNode => (
            <MenuItem
              disabled={disabledItems?.includes(value) || disabledItems?.includes(text)}
              key={[text, value]}
              sx={{ fontSize: '14px', fontWeight: 300, letterSpacing: '-0.015em' }}
              value={value || text}
            >
              <Grid container justifyContent='space-between'>
                <Grid item>
                  <Typography lineHeight='30px'>
                    {text}
                  </Typography>
                </Grid>
                {showLogo &&
                  <Grid item>
                    {<Avatar src={getLogo(chainName(text))} sx={{ height: 29, width: 29, borderRadius: '50%' }} variant='square' />}
                  </Grid>
                }
              </Grid>
            </MenuItem>
          ))}
        </Select>
      </Label>
    </FormControl>
  );
}
