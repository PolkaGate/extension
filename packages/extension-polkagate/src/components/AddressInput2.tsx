// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-no-bind */

import '@vaadin/icons';

import { faPaste, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Autocomplete, Grid, IconButton, InputAdornment, SxProps, TextField, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import settings from '@polkadot/ui-settings';

import { useTranslation } from '../hooks';
import QrScanner from '../popup/import/addAddressOnly/QrScanner';
import isValidAddress from '../util/validateAddress';
import Identicon from './Identicon';
import Label from './Label';
import ShortAddress from './ShortAddress';
import Warning from './Warning';

interface Props {
  address: string | undefined;
  addWithQr?: boolean;
  allAddresses?: [string, string | null, string | undefined][];
  chain?: Chain;
  disabled?: boolean;
  helperText?: string;
  label: string;
  labelFontSize?: string;
  style?: SxProps<Theme>;
  setAddress: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  showIdenticon?: boolean;
  placeHolder?: string;
}

export default function AddressInput2({ addWithQr = false, allAddresses = [], chain = undefined, disabled = false, placeHolder = '', setAddress, address, helperText = '', label, labelFontSize = '14px', showIdenticon = true, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPopperOpen, setTogglePopper] = useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [inValidAddress, setInValidAddress] = useState<boolean>(false);
  const [enteredAddress, setEnteredAddress] = useState<string | undefined>();
  const [dropdownWidth, setDropdownWidth] = useState<string>('0');

  const autocompleteOptions = useMemo(() => allAddresses.map((a) => ({ address: a[0], name: a[2] })), [allAddresses]);

  useEffect(() => {
    setEnteredAddress(address);
  }, [address]);

  useEffect(() => {
    if (containerRef) {
      setDropdownWidth(`${containerRef.current?.offsetWidth + (showIdenticon ? 5 : 0)}px`);
    }
  }, [containerRef?.current?.offsetWidth, showIdenticon]);

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

  const openQrScanner = useCallback(() => setOpenCamera(true), []);

  const openPopper = useCallback(() => allAddresses?.length > 0 && !enteredAddress && !isPopperOpen && setTogglePopper(true), [allAddresses?.length, enteredAddress, isPopperOpen]);

  const closePopper = useCallback(() => setTogglePopper(false), []);

  const handleInputAddress = useCallback((value: React.ChangeEvent<HTMLInputElement>) => {
    setTogglePopper(false);
    handleAddress(value);
  }, [handleAddress]);

  const onSelectOption = useCallback((addr: string) => {
    setTogglePopper(false);
    _selectAddress(addr);
  }, [_selectAddress]);

  const pasteClearAddress = useCallback(() => {
    setTogglePopper(false);

    if (enteredAddress || address) { // clear is clicked
      setAddress(null);
      setEnteredAddress(undefined);
      setInValidAddress(false);
    } else { // past is clicked
      navigator.clipboard.readText().then((clipText) => {
        isValidAddress(clipText) ? setAddress(clipText) : setAddress(undefined);
        setEnteredAddress(clipText);
        setInValidAddress(!(isValidAddress(clipText)));
      }).catch(console.error);
    }
  }, [address, enteredAddress, setAddress]);

  return (
    <>
      <Grid alignItems='flex-end' container justifyContent='space-between' ref={containerRef} sx={{ position: 'relative', ...style }}>
        <Grid item xs={12}>
          <Label
            helperText={helperText}
            label={label}
            style={{ fontSize: labelFontSize, position: 'relative' }}
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
              options={autocompleteOptions}
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
                            onClick={pasteClearAddress}
                            sx={{ p: '3px' }}
                          >
                            <FontAwesomeIcon
                              color={theme.palette.secondary.light}
                              fontSize='15px'
                              icon={enteredAddress || address ? faXmarkCircle : faPaste}
                            />
                          </IconButton>
                        }
                        {addWithQr && !disabled &&
                          <IconButton
                            aria-label='qrScanner'
                            onClick={openQrScanner}
                            sx={{ p: '3px' }}
                          >
                            <vaadin-icon icon='vaadin:qrcode' style={{ height: '16px', width: '16px', color: `${settings.camera === 'on' ? theme.palette.primary.main : theme.palette.text.disabled}` }} />
                          </IconButton>
                        }
                      </InputAdornment>
                    )
                  }}
                  onChange={handleInputAddress}
                  placeholder={placeHolder}
                  sx={{
                    '> div.MuiOutlinedInput-root': { '> fieldset': { border: 'none' }, '> input.MuiAutocomplete-input': { border: 'none', lineHeight: '50px', p: 0 }, border: 'none', height: '50px', p: 0, px: '5px' },
                    bgcolor: 'background.paper',
                    borderTop: `${address ? '1px' : focus || inValidAddress ? '2px' : '1px'} solid`,
                    borderLeft: `${address ? '1px' : focus || inValidAddress ? '2px' : '1px'} solid`,
                    borderRight: `${address ? '1px' : focus || inValidAddress ? '2px' : '1px'} solid`,
                    borderBottom: `${address ? '0' : focus || inValidAddress ? '2px' : '1px'} solid`,
                    borderColor: `${inValidAddress ? 'warning.main' : focus ? 'action.focus' : 'secondary.light'}`,
                    borderRadius: `5px 5px ${address ? '0 0' : '5px 5px'}`,
                    height: '50px',
                    lineHeight: '50px'
                  }}
                />
              )}
              renderOption={(props, value) => {
                return (
                  <Grid alignItems='center' container item justifyContent='space-between' key={value.address} onClick={() => onSelectOption(value.address)} sx={{ '&:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light', mb: '5px' }, cursor: 'pointer', p: '5px' }}>
                    <Grid container item xs={10.5}>
                      <Grid item maxWidth='25%'>
                        <Typography fontSize='12px' fontWeight={400} lineHeight='25px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                          {value.name}:
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <ShortAddress address={value.address} clipped />
                      </Grid>
                    </Grid>
                    <Grid container item justifyContent='center' width='fit-content'>
                      <Identicon
                        iconTheme={chain?.icon || 'polkadot'}
                        prefix={chain?.ss58Format ?? 42}
                        size={31}
                        value={value.address}
                      />
                    </Grid>
                  </Grid>);
              }}
              sx={{ border: 'none', height: '50px', p: 0 }}
            />
          </Label>
        </Grid>
        {inValidAddress &&
          <Grid container sx={{ '> div': { pl: '3px' } }}>
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
      {openCamera &&
        <QrScanner
          openCamera={openCamera}
          setAddress={_selectAddress}
          setOpenCamera={setOpenCamera}
        />
      }
    </>
  );
}
