// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

import type { DropdownOption } from '../util/types';

import { Avatar, FormControl, Grid, InputBase, MenuItem, Select, type SelectChangeEvent, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CHAINS_WITH_BLACK_LOGO } from '@polkadot/extension-polkagate/src/util/constants';

import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';
import Label from './Label';

interface Props {
  defaultValue: string | number | undefined;
  value?: string | number | undefined;
  onChange?: (value: number | string) => void;
  options: DropdownOption[];
  label?: string;
  isDisabled?: boolean;
  showLogo?: boolean;
  _mt?: string | number;
  helperText?: string;
  disabledItems?: string[] | number[];
  fullWidthDropdown?: boolean;
}

function CustomizedSelect({ _mt = 0, defaultValue, disabledItems, fullWidthDropdown, helperText, isDisabled = false, label, onChange, options, showLogo = false, value }: Props) {
  const theme = useTheme();

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | number>();

  const selectRef = useRef();

  useEffect(() => {
    setSelectedValue(value || defaultValue);
  }, [value, defaultValue]);

  const toggleMenu = useCallback(() => !isDisabled && setShowMenu(!showMenu), [isDisabled, showMenu]);

  const BootstrapInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
      '&:focus': {
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

  const _onChange = useCallback((event: SelectChangeEvent<string>) => {
    onChange && onChange(event.target.value);
    setSelectedValue(event.target.value);
    toggleMenu();
  }, [onChange, toggleMenu]);

  const chainName = useCallback((text: string) => sanitizeChainName(text)?.toLowerCase(), []);

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
            MenuListProps: {
              sx: {
                '> li.Mui-selected': {
                  bgcolor: 'rgba(186, 40, 130, 0.25)'
                },
                '> li:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                bgcolor: 'background.paper'
              }
            },
            PaperProps: {
              style: showLogo
                ? {
                  minWidth: 'auto'
                }
                : {},
              sx: {
                '&::-webkit-scrollbar': {
                  display: 'none',
                  width: 0
                },
                border: '1px solid',
                borderColor: 'secondary.light',
                borderRadius: '7px',
                filter: 'drop-shadow(-4px 4px 4px rgba(0, 0, 0, 0.15))',
                mt: '5px',
                overflow: 'hidden',
                overflowY: 'scroll'
              }
            }
          }}
          defaultValue={defaultValue}
          id='selectChain'
          input={<BootstrapInput />}
          onChange={_onChange}
          onClick={toggleMenu}
          open={showMenu}
          ref={selectRef}
          // eslint-disable-next-line react/jsx-no-bind
          renderValue={(value) => {
            const textToShow = options.find((option) => value === option.value || value === option.text)?.text;

            return textToShow;
          }}
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
            bgcolor: isDisabled ? 'primary.contrastText' : 'transparent',
            width: '100%'
          }}
          value={selectedValue}
        >
          {options.map(({ text, value }): React.ReactNode => (
            <MenuItem
              disabled={disabledItems?.includes(value) || disabledItems?.includes(text)}
              key={value}
              sx={{ fontSize: '14px', fontWeight: 300, letterSpacing: '-0.015em', width: fullWidthDropdown ? `${selectRef?.current?.offsetWidth}px` : 'auto' }}
              value={value || text}
            >
              <Grid container height={showLogo ? '32px' : 'auto'} justifyContent='space-between'>
                <Grid alignItems='center' container item width='fit-content'>
                  <Typography fontWeight={300}>
                    {text}
                  </Typography>
                </Grid>
                {showLogo && text !== 'Allow use on any chain' &&
                  <Grid alignItems='center' container item pl='15px' width='fit-content'>
                    {<Avatar src={getLogo(chainName(text))} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(text) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 29, width: 29 }} variant='square' />}
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

export default React.memo(CustomizedSelect);
