// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { SelectChangeEvent } from '@mui/material';
import type { DropdownOption } from '../util/types';

import { CircularProgress, FormControl, Grid, InputBase, MenuItem, Select, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useCallback, useLayoutEffect, useState } from 'react';

import { sanitizeChainName } from '../util/utils';
import ChainLogo from './ChainLogo';

interface Props {
  defaultValue: string | number | undefined;
  value?: string | number;
  onChange?: (v: number | string) => void;
  options: DropdownOption[];
  label: string;
  isDisabled?: boolean;
  showLogo?: boolean;
  showIcons?: boolean;
  _mt?: string | number;
  disabledItems?: (string | number)[];
  isItemsLoading?: boolean;
}

const BootstrapInput = styled(InputBase)<{ isDisabled?: boolean }>(({ isDisabled, theme }) => ({
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
    padding: '5px 5px 0px',
    transition: theme.transitions.create(['border-color', 'box-shadow'])
  },
  'label + &': {
    fontSize: '10px',
    fontWeight: '300',
    letterSpacing: '-0.015em'
  }
}));

function CustomizedSelect ({ _mt = 0, defaultValue, disabledItems, isDisabled = false, isItemsLoading, label, onChange, options, showIcons = true, showLogo = false, value }: Props) {
  const theme = useTheme();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>();

  useLayoutEffect(() => {
    setSelectedValue((value || defaultValue) as string);
  }, [value, defaultValue]);

  const toggleMenu = useCallback(() => !isDisabled && setShowMenu(!showMenu), [isDisabled, showMenu]);

  const _onChange = useCallback((event: SelectChangeEvent<string>) => {
    onChange && onChange(event.target.value);
    setSelectedValue(event.target.value);
    toggleMenu();
  }, [onChange, toggleMenu]);

  const chainName = useCallback((text: string) => sanitizeChainName(text)?.toLowerCase(), []);

  return (
    <FormControl disabled={isDisabled} sx={{ mt: `${_mt}`, width: '100%' }} variant='standard'>
      <Typography sx={{ fontSize: '10px', paddingLeft: '5px' }}>
        {label}
      </Typography>
      {selectedValue &&
        <Select
          // eslint-disable-next-line react/jsx-no-bind
          IconComponent={
            isItemsLoading
              ? () => <CircularProgress size={20} sx={{ color: `${theme.palette.secondary.light}`, position: 'absolute', right: '5px' }} /> 
              : undefined
          }
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
                mt: '10px',
                overflow: 'hidden',
                overflowY: 'scroll'
              }
            }
          }}
          defaultValue={defaultValue as string}
          id='selectChain'
          input={<BootstrapInput isDisabled={isDisabled} />}
          onChange={_onChange}
          onClick={toggleMenu}
          open={options?.length !== 1 && showMenu} // do not open select when page is loading , or options has just one item
          sx={{
            '> #selectChain': {
              border: '1px solid',
              borderColor: 'secondary.light',
              borderRadius: '20px',
              fontSize: '14px',
              height: '29px',
              lineHeight: '30px',
              p: 0,
              pl: '5px',
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
            width: '100%',
            '.MuiSelect-icon': {
              display: options?.length && options.length === 1 ? 'none' : 'block'
            }
          }}
          value={selectedValue} // Assuming selectedValue is a state variable
          // eslint-disable-next-line react/jsx-no-bind
          renderValue={(v) => {
            let textToShow = options.find((option) => v === option.value || v === option.text || String(v) === String(option.value))?.text?.split(/\s*\(/)[0];

            if (textToShow?.split(':')?.[1]) {
              textToShow = textToShow?.split(':')[1]?.trim();
            }

            return (
              <Grid container height={'30px'} justifyContent='flex-start'>
                {showIcons && textToShow && textToShow !== 'Allow use on any chain' &&
                  <Grid alignItems='center' container item width='fit-content'>
                    <ChainLogo chainName={chainName(textToShow)} genesisHash={v} size={19.8} />
                  </Grid>
                }
                <Grid alignItems='center' container item justifyContent='flex-start' pl='6px' width='fit-content'>
                  <Typography fontSize='14px' fontWeight={300}>
                    {textToShow}
                  </Typography>
                </Grid>
              </Grid>
            );
          }}
        >
          {options.map(({ text, value }): React.ReactNode => (
            <MenuItem
              disabled={disabledItems?.includes(value || text)}
              key={value}
              sx={{ fontSize: '14px', fontWeight: 300, letterSpacing: '-0.015em' }}
              value={value !== undefined ? value : text}
            >
              <Grid container height={'30px'} justifyContent='flex-start'>
                {showIcons && text !== 'Allow use on any chain' &&
                  <Grid alignItems='center' container item pr='6px' width='fit-content'>
                    <ChainLogo chainName={chainName(text)} genesisHash={value as string} size={19.8} />
                  </Grid>
                }
                <Grid alignItems='center' container item justifyContent='flex-start' pl='6px' width='fit-content' sx={{ overflowX: 'scroll' }}>
                  <Typography fontSize='14px' fontWeight={300}>
                    {text}
                  </Typography>
                </Grid>
              </Grid>
            </MenuItem>
          ))}
        </Select>
      }
    </FormControl>
  );
}

export default React.memo(CustomizedSelect);
