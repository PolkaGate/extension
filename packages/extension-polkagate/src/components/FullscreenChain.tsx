// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { FormControl, Grid, InputBase, MenuItem, Select, SelectChangeEvent, SxProps, Theme, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useGenesisHashOptions, useIsTestnetEnabled } from '@polkadot/extension-polkagate/src/hooks';
import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';

import { INITIAL_RECENT_CHAINS_GENESISHASH } from '../util/constants';
import getLogo from '../util/getLogo';
import { DropdownOption } from '../util/types';
import { sanitizeChainName } from '../util/utils';
import ChainLogo from './ChainLogo';
import Label from './Label';

interface Props {
  address: string | null | undefined;
  defaultValue?: string | undefined;
  onChange: (value: string | undefined) => void;
  label: string;
  style: SxProps<Theme> | undefined;
  disabledItems?: string[] | number[];
  helperText?: string;
  options?: DropdownOption[];
  labelFontSize?: string;
}

const BootstrapInput = styled(InputBase)<{ address?: string | null }>(({ address, theme }) => ({
  '& .MuiInputBase-input': {
    '&:focus': {
      borderColor: theme.palette.secondary.main,
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    },
    backgroundColor: !address ? theme.palette.primary.contrastText : theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
    fontSize: '14px',
    fontWeight: '400',
    letterSpacing: '-0.015em',
    padding: '5px 5px 0px',
    transition: theme.transitions.create(['border-color', 'box-shadow'])
  },
  'label + &': {
    fontSize: '10px',
    fontWeight: '400',
    letterSpacing: '-0.015em'
  }
}));

const Item: React.FC<{ height?: string, logoSize?: number, text: string }> = ({ height = '20px', logoSize = 19.8, text }) => {
  const chainName = useCallback((text: string) => sanitizeChainName(text)?.toLowerCase(), []);
  const logo = getLogo(chainName(text));

  return (
    <Grid container height={height} justifyContent='flex-start'>
      {text !== 'Allow use on any chain' && logo &&
        <Grid alignItems='center' container item pr='10px' width='fit-content'>
          <ChainLogo chainName={text} size={logoSize} />
        </Grid>
      }
      <Grid alignItems='center' container item justifyContent='flex-start' width='fit-content'>
        <Typography fontSize='14px' fontWeight={400}>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
};

function FullscreenChain({ address, defaultValue, disabledItems, helperText, label, labelFontSize = '14px', onChange, options, style }: Props) {
  const theme = useTheme();
  const _allOptions = useGenesisHashOptions();
  const isTestnetEnabled = useIsTestnetEnabled();

  const _options = useMemo(() => {
    const filteredOptions = _allOptions.filter(({ text }) => text === 'Allow use on any chain');

    return options || filteredOptions;
  }, [_allOptions, options]);

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>();

  const _disabledItems = useMemo((): (string | number)[] | undefined =>
    !isTestnetEnabled
      ? [...(disabledItems || []), ...TEST_NETS]
      : disabledItems
  , [disabledItems, isTestnetEnabled]);

  useEffect(() => {
    onChange(defaultValue);
  }, [defaultValue, onChange]);

  const updateRecentChains = useCallback((currentGenesisHash: string) => {
    chrome.storage.local.get('RecentChains', (res) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);

        return;
      }

      const accountsAndChains = res?.RecentChains ?? {};
      let myRecentChains = accountsAndChains[address] as string[];

      if (!myRecentChains) {
        if (INITIAL_RECENT_CHAINS_GENESISHASH.includes(currentGenesisHash)) {
          accountsAndChains[address] = INITIAL_RECENT_CHAINS_GENESISHASH;
        } else {
          INITIAL_RECENT_CHAINS_GENESISHASH.length = 3;
          accountsAndChains[address] = [...INITIAL_RECENT_CHAINS_GENESISHASH, currentGenesisHash];
        }

        chrome.storage.local.set({ RecentChains: accountsAndChains }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      } else if (myRecentChains && !(myRecentChains.includes(currentGenesisHash))) {
        myRecentChains.unshift(currentGenesisHash);
        myRecentChains.pop();
        accountsAndChains[address] = myRecentChains;

        chrome.storage.local.set({ RecentChains: accountsAndChains }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      }
    });
  }, [address]);

  const onChangeNetwork = useCallback((newGenesisHash: string) => {
    try {
      onChange(newGenesisHash);

      const currentGenesisHash = newGenesisHash?.startsWith && newGenesisHash.startsWith('0x') ? newGenesisHash : undefined;

      if (address && currentGenesisHash) {
        updateRecentChains(currentGenesisHash);
      }
    } catch (error) {
      console.error(error);
    }
  }, [address, onChange, updateRecentChains]);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const toggleMenu = useCallback(() => !!address && setShowMenu(!showMenu), [address, showMenu]);

  const _onChange = useCallback((event: SelectChangeEvent<string>) => {
    onChangeNetwork && onChangeNetwork(event.target.value);
    setSelectedValue(event.target.value);
    toggleMenu();
  }, [onChangeNetwork, toggleMenu]);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ ...style }}>
      <FormControl disabled={!address} sx={{ width: '100%' }} variant='standard'>
        <Label helperText={helperText} label={label} style={{ fontSize: labelFontSize }}>
          {selectedValue &&
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
              defaultValue={defaultValue}
              id='selectChain'
              input={<BootstrapInput address={address} />}
              onChange={_onChange}
              onClick={toggleMenu}
              open={_options?.length !== 1 && showMenu}
              // eslint-disable-next-line react/jsx-no-bind
              renderValue={(value) => {
                const text = _options.find((option) => value === option.value || value === option.text)?.text?.split(/\s*\(/)[0];

                return (
                  <Item height='50px' logoSize={29} text={text} />
                );
              }}
              sx={{
                '> #selectChain': {
                  border: '1px solid',
                  borderColor: 'secondary.light',
                  borderRadius: '5px',
                  fontSize: '14px',
                  height: '48px',
                  lineHeight: '30px',
                  p: 0,
                  pl: '15px',
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
                bgcolor: !address ? 'primary.contrastText' : 'transparent',
                width: '100%',
                '.MuiSelect-icon': {
                  display: _options?.length && _options.length === 1 ? 'none' : 'block'
                }
              }}
              value={selectedValue} // Assuming selectedValue is a state variable
            >
              {_options.map(({ text, value }): React.ReactNode => {
                return (
                  <MenuItem
                    disabled={_disabledItems?.includes(value) || _disabledItems?.includes(text)}
                    key={value}
                    sx={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.015em' }}
                    value={value || text}
                  >
                    <Item text={text} />
                  </MenuItem>
                );
              })}
            </Select>
          }
        </Label>
      </FormControl>
    </Grid>
  );
}

export default React.memo(FullscreenChain);
