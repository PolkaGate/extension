// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-no-bind */

import { faPaste, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Autocomplete, Grid, IconButton, InputAdornment, SxProps, TextField, Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Label, Warning } from '../../../components';
import { useTranslation } from '../../../hooks';
import { isValidAddress } from '../../../util/utils';

interface Props {
  api: ApiPromise | undefined;
  selectableAddresses?: string[];
  label: string;
  style?: SxProps<Theme>;
  chain?: Chain;
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  helperText?: string;
  placeHolder?: string;
  disabled?: boolean;
}

export default function SubIdInput({ api, selectableAddresses = [], chain = undefined, disabled = false, placeHolder = '', setAddress, address, helperText = '', label }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [isPopperOpen, setTogglePopper] = useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);
  const [inValidAddress, setInValidAddress] = useState<boolean>(false);
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [enteredAddress, setEnteredAddress] = useState<string | undefined>();
  const [dropdownWidth, setDropdownWidth] = useState<string>('0');

  useEffect(() => {
    setEnteredAddress(address ?? '');
  }, [address]);

  useEffect(() => {
    if (containerRef) {
      setDropdownWidth(`${containerRef.current?.offsetWidth ?? 0}px`);
    }
  }, [containerRef?.current?.offsetWidth]);

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    setTogglePopper(false);

    if (!value) {
      setAddress(null);
      setEnteredAddress(undefined);
      setInValidAddress(false);

      return;
    }

    setInValidAddress(!(isValidAddress(value)));
    setEnteredAddress(value);
    isValidAddress(value) ? setAddress(value) : setAddress(undefined);
  }, [setAddress]);

  const _selectAddress = useCallback((newAddr: string) => handleAddress({ target: { value: newAddr } }), [handleAddress]);

  const openPopper = useCallback(() => selectableAddresses?.length > 0 && !enteredAddress && !isPopperOpen && setTogglePopper(true), [selectableAddresses?.length, enteredAddress, isPopperOpen]);

  const closePopper = useCallback(() => setTogglePopper(false), []);

  const handleInputAddress = useCallback((value: React.ChangeEvent<HTMLInputElement>) => {
    setTogglePopper(false);
    handleAddress(value);
  }, [handleAddress]);

  const onSelectOption = useCallback((addr: string) => {
    setTogglePopper(false);
    _selectAddress(addr);
  }, [_selectAddress]);

  const pasteAddress = useCallback(() => {
    setTogglePopper(false);

    if (enteredAddress || address) {
      setAddress(null);
      setEnteredAddress(undefined);
      setInValidAddress(false);
    } else {
      navigator.clipboard.readText().then((clipText) => {
        isValidAddress(clipText) ? setAddress(clipText) : setAddress(undefined);
        setEnteredAddress(clipText);
        setInValidAddress(!(isValidAddress(clipText)));
      }).catch(console.error);
    }
  }, [address, enteredAddress, setAddress]);

  return (
    <Grid container item ref={containerRef}>
      <Grid container item>
        <Label
          helperText={helperText}
          label={label}
          style={{ position: 'relative', width: '100%' }}
        >
          <Autocomplete
            componentsProps={{ paper: { sx: { '> ul': { m: 0, p: 0 }, border: '2px solid', borderColor: 'secondary.light', maxHeight: window.innerHeight / 2, ml: '-1px', my: '5px', p: 0, width: dropdownWidth } } }}
            disableClearable
            disabled={disabled}
            freeSolo
            getOptionLabel={(option) => option.toString()}
            inputValue={enteredAddress ?? ''}
            onBlur={() => setFocus(false)}
            onClose={closePopper}
            onFocus={() => setFocus(true)}
            onOpen={openPopper}
            open={isPopperOpen && !enteredAddress}
            options={selectableAddresses}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position='end'>
                      {!disabled &&
                        <IconButton
                          aria-label={`${enteredAddress || address ? 'clear' : 'paste'}`}
                          onClick={pasteAddress}
                          sx={{ p: '3px' }}
                        >
                          <FontAwesomeIcon
                            color={theme.palette.secondary.light}
                            fontSize='15px'
                            icon={enteredAddress || address ? faXmarkCircle : faPaste}
                          />
                        </IconButton>
                      }
                    </InputAdornment>
                  )
                }}
                onChange={handleInputAddress}
                placeholder={placeHolder}
                sx={{ '> div.MuiOutlinedInput-root': { '> fieldset': { border: 'none' }, '> input.MuiAutocomplete-input': { border: 'none', lineHeight: '31px', p: 0 }, border: 'none', height: '31px', p: 0, px: '5px' }, bgcolor: 'background.paper', border: `${focus || inValidAddress ? '2px' : '1px'} solid`, borderColor: `${inValidAddress ? 'warning.main' : focus ? 'action.focus' : 'secondary.light'}`, borderRadius: '5px', height: '32px', lineHeight: '31px' }}
              />
            )}
            renderOption={(props, address) => {
              return (
                <Grid alignItems='center' container item justifyContent='space-between' key={address} onClick={() => onSelectOption(address)} sx={{ '&:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light', mb: '5px' }, cursor: 'pointer', p: '5px' }}>
                  <Identity
                    api={api}
                    chain={chain}
                    direction='row'
                    formatted={address}
                    identiconSize={28}
                    showShortAddress
                    showSocial={false}
                    style={{ fontSize: '28px' }}
                    withShortAddress
                  />
                </Grid>);
            }}
            sx={{ border: 'none', height: '31px', p: 0 }}
          />
        </Label>
      </Grid>
      {inValidAddress &&
        <Grid container item sx={{ '> div': { pl: '3px' } }}>
          <Warning
            iconDanger
            isBelowInput
            marginTop={0}
            theme={theme}
          >
            {t<string>('Invalid address')}
          </Warning>
        </Grid>
      }
    </Grid>
  );
}
