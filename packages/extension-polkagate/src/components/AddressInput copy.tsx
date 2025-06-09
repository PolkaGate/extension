// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-no-bind */

import type { Chain } from '@polkadot/extension-chains/types';

import { Autocomplete, Divider, Grid, InputAdornment, Stack, type SxProps, TextField, type Theme, Typography } from '@mui/material';
import { ArrowCircleDown, Document, Hashtag, ScanBarcode } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AccountListModal from '../fullscreen/components/AccountListModal';
import { useTranslation } from '../hooks';
import QrScanner from '../popup/import/addWatchOnlyFullScreen/QrScanner';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import isValidAddress from '../util/validateAddress';
import Identicon from './Identicon';
import ShortAddress from './ShortAddress';

interface Props {
  address: string | null | undefined;
  addWithQr?: boolean;
  allAddresses?: [string, string | null, string | undefined][];
  chain?: Chain | null;
  disabled?: boolean;
  label: string;
  placeHolder?: string;
  setAddress?: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  style?: SxProps<Theme>;
  withSelect?: boolean;
}

export default function AddressInput ({ addWithQr = false, address, allAddresses = [], chain = undefined, disabled = false, label, placeHolder, setAddress, style, withSelect }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPopperOpen, setTogglePopper] = useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [openAccountList, setOpenAccountList] = useState<boolean>(false);
  const [invalidAddress, setInvalidAddress] = useState<boolean>(false);
  const [enteredAddress, setEnteredAddress] = useState<string | undefined>();
  const [dropdownWidth, setDropdownWidth] = useState<string>('0');

  const autocompleteOptions = useMemo(() => allAddresses.map((address) => ({ address: address[0], name: address[2] })), [allAddresses]);

  useEffect(() => {
    address && setEnteredAddress(address);
  }, [address]);

  useEffect(() => {
    if (containerRef) {
      setDropdownWidth(`${(containerRef.current?.offsetWidth || 0)}px`);
    }
  }, [containerRef?.current?.offsetWidth]);

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    setTogglePopper(false);

    if (!value) {
      setAddress && setAddress(null);
      setEnteredAddress(undefined);
      setInvalidAddress(false);

      return;
    }

    setInvalidAddress(!(isValidAddress(value)));
    setEnteredAddress(value);
    isValidAddress(value) ? setAddress && setAddress(value) : setAddress && setAddress(undefined);
  }, [setAddress]);

  // @ts-ignore
  const _selectAddress = useCallback((newAddr?: string) => handleAddress({ target: { value: newAddr } }), [handleAddress]);

  const openQrScanner = useCallback(() => setOpenCamera(true), []);
  const onOpenAccountList = useCallback(() => setOpenAccountList(true), []);

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

  const pasteAddress = useCallback(() => {
    setTogglePopper(false);

    if (enteredAddress || address) {
      setAddress && setAddress(null);
      setEnteredAddress(undefined);
      setInvalidAddress(false);
    } else {
      navigator.clipboard.readText().then((clipText) => {
        isValidAddress(clipText) ? setAddress && setAddress(clipText) : setAddress && setAddress(undefined);
        setEnteredAddress(clipText);
        setInvalidAddress(!(isValidAddress(clipText)));
      }).catch(console.error);
    }
  }, [address, enteredAddress, setAddress]);

  return (
    <>
      <Stack direction='column' justifyContent='start' ref={containerRef} rowGap='5px' sx={{ position: 'relative', ...style }}>
        <Typography color='#EAEBF1' sx={{ textAlign: 'left' }} variant='B-1'>
          {label}
        </Typography>
        <Autocomplete
          componentsProps={{
            paper: {
              sx: {
                '> ul': { m: 0, p: 0 },
                border: '1px solid',
                borderColor: '#BEAAD833',
                maxHeight: window.innerHeight / 2,
                ml: '-1px',
                my: '5px',
                p: 0,
                width: dropdownWidth
              }
            }
          }}
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
                style: {
                  color: `${invalidAddress ? '#FF4FB9' : '#BEAAD8'}`, // Applies to input text AND placeholder
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500
                },
                startAdornment: (
                  <InputAdornment position='start'>

                    {enteredAddress && !invalidAddress
                      ? <PolkaGateIdenticon
                        address={enteredAddress}
                        size={18}
                      />
                      : <Hashtag
                        color={invalidAddress ? '#FF4FB9' : focus ? '#3988FF' : '#AA83DC'}
                        size='18'
                        style={{ cursor: 'pointer', margin: '0 2px 0' }}
                        variant='Bulk'
                      />
                    }
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ bgcolor: '#2D1E4A', borderRadius: '8px', height: '80%', maxHeight: '80%', px: '5px' }}>
                    {addWithQr && !disabled &&
                      <ScanBarcode color='#AA83DC' onClick={openQrScanner} size='18' style={{ cursor: 'pointer', margin: '0 5px' }} variant='Bulk' />
                    }
                    {addWithQr && !disabled &&
                      <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                    }
                    {withSelect && !disabled &&
                      <>
                        <ArrowCircleDown color='#AA83DC' onClick={onOpenAccountList} size='18' style={{ cursor: 'pointer', margin: '0 5px' }} variant='Bulk' />
                        <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                      </>
                    }
                    {!disabled &&
                      <Document color='#AA83DC' onClick={pasteAddress} size='18' style={{ cursor: 'pointer', margin: '0 5px' }} variant='Bulk' />
                    }
                    {/* icon={enteredAddress || address ? faXmarkCircle : faPaste} */}
                  </InputAdornment>
                )
              }}
              onChange={handleInputAddress}
              placeholder={placeHolder ?? t('Enter your account ID')}
              sx={{
                '> div.MuiOutlinedInput-root': {
                  '> fieldset':
                  {
                    border: 'none'
                  },
                  '> input.MuiAutocomplete-input':
                  {
                    border: 'none',
                    p: 0,
                    '&::placeholder': {
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      fontWeight: 500
                    }
                  },
                  border: 'none',
                  height: '100%',
                  p: '0 3px 0 5px'
                },
                bgcolor: '#1B133CB2',
                '&:hover': {
                  bgcolor: '#2D1E4A'
                },
                border: '1px solid',
                borderColor: `${invalidAddress ? 'warning.main' : focus ? 'action.focus' : '#BEAAD833'}`,
                borderRadius: '12px',
                height: '44px'
              }}
            />
          )}
          renderOption={(_props, value) => {
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
          sx={{ border: 'none', height: '44px', p: 0 }}
        />
        {invalidAddress &&
          <Typography color='warning.main' sx={{ textAlign: 'left' }} variant='B-1'>
            {t('Invalid address')}
          </Typography>
        }
      </Stack>
      {openCamera &&
        <QrScanner
          setAddress={_selectAddress}
          setOpenCamera={setOpenCamera}
        />
      }
      {openAccountList &&
        <AccountListModal
          handleClose={() => setOpenAccountList(false)}
          open={openAccountList}
          setAddress={setAddress}
        />
      }
    </>
  );
}
