// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { faPaste, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import settings from '@polkadot/ui-settings';

import { useOutsideClick } from '../hooks';
import QrScanner from '../popup/import/addAddressOnly/QrScanner';
import isValidAddress from '../util/validateAddress';
import Identicon from './Identicon';
import Label from './Label';
import ShortAddress from './ShortAddress';
import { Input } from './TextInputs';

interface Props {
  allAddresses?: [string, string | null, string | undefined][];
  label: string;
  style?: SxProps<Theme>;
  chain?: Chain;
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  showIdenticon?: boolean;
  helperText?: string;
  placeHolder?: string;
  disabled?: boolean;
  addWithQr?: boolean;
}

export default function InputWithLabelAndIdenticon({ addWithQr = false, allAddresses = [], chain = undefined, disabled = false, placeHolder = '', setAddress, address, helperText = '', label, showIdenticon = true, style }: Props): React.ReactElement<Props> {
  const [offFocus, setOffFocus] = useState(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const theme = useTheme();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const _hideDropdown = useCallback(() => setDropdownVisible(false), []);
  const _toggleDropdown = useCallback(() => allAddresses.length > 0 && setDropdownVisible(!isDropdownVisible), [allAddresses.length, isDropdownVisible]);

  useOutsideClick([ref], _hideDropdown);

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (!value) {
      setAddress(undefined);

      return;
    }

    if (isValidAddress(value)) {
      setAddress(value);
    } else {
      setAddress(undefined);
    }
  }, [setAddress]);

  const _selectAddress = useCallback((newAddr: string) => handleAddress({ target: { value: newAddr } }), [handleAddress]);

  const _setOffFocus = useCallback(() => {
    setOffFocus(true);
  }, []);

  const openQrScanner = useCallback(() => {
    setOpenCamera(true);
  }, []);

  const pasteAddress = useCallback(() => {
    address
      ? setAddress(undefined)
      : navigator.clipboard.readText().then((clipText) => isValidAddress(clipText) && setAddress(clipText)).catch(console.error);
  }, [address, setAddress]);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ position: 'relative', ...style }}>
      <Grid item onClick={_toggleDropdown} xs={showIdenticon ? 10.5 : 12}>
        <Label
          helperText={helperText}
          label={label}
          style={{ position: 'relative' }}
        >
          <Input
            autoCapitalize='off'
            autoCorrect='off'
            disabled={disabled}
            onBlur={_setOffFocus}
            onChange={handleAddress}
            placeholder={placeHolder}
            ref={ref}
            style={{
              backgroundColor: disabled ? theme.palette.primary.contrastText : theme.palette.background.paper,
              borderColor: address !== undefined && !isValidAddress(address) ? theme.palette.warning.main : theme.palette.secondary.light,
              borderWidth: address !== undefined && !isValidAddress(address) ? '3px' : '1px',
              fontSize: '14px',
              fontWeight: 300,
              padding: 0,
              paddingLeft: '10px',
              paddingRight: disabled ? '10px' : addWithQr ? '55px' : '30px'
            }}
            theme={theme}
            type='text'
            value={address ?? ''}
            withError={offFocus && address !== undefined && !isValidAddress(address)}
          />
          {!disabled &&
            <>
              <IconButton
                onClick={pasteAddress}
                sx={{
                  bottom: '0',
                  m: '3px',
                  p: '5px',
                  position: 'absolute',
                  right: '0'
                }}
              >
                <FontAwesomeIcon
                  color={theme.palette.secondary.light}
                  fontSize='15px'
                  icon={address ? faXmarkCircle : faPaste}
                />
              </IconButton>
              {addWithQr &&
                <IconButton
                  onClick={openQrScanner}
                  sx={{
                    bottom: '0',
                    m: '3px',
                    p: '5px',
                    position: 'absolute',
                    right: '25px'
                  }}
                >
                  <vaadin-icon icon='vaadin:qrcode' style={{ height: '16px', width: '16px', color: `${settings.camera === 'on' ? theme.palette.primary.main : theme.palette.text.disabled}` }} />
                </IconButton>
              }
            </>
          }
        </Label>
      </Grid>
      {showIdenticon &&
        <Grid item xs={1.2}>
          {isValidAddress(address)
            ? <Identicon
              iconTheme={chain?.icon || 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={31}
              value={address}
            />

            : <Grid sx={{ bgcolor: 'action.disabledBackground', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', height: '31px', width: '31px' }}>
            </Grid>
          }
        </Grid>
      }
      {allAddresses.length > 0 &&
        <Grid
          container
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none',
              width: 0
            },
            '> .tree:last-child': { border: 'none' },
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: 'secondary.light',
            borderRadius: '5px',
            boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.25)',
            maxHeight: '220px',
            overflow: 'hidden',
            overflowY: 'scroll',
            position: 'absolute',
            top: '60px',
            visibility: isDropdownVisible ? 'visible' : 'hidden',
            zIndex: 10
          }}
        >
          {allAddresses.map(([address, genesisHash, name]) => (
            <Grid
              alignItems='center'
              className='tree'
              container
              item
              justifyContent='space-between'
              key={address}
              onClick={() => _selectAddress(address)}
              sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', cursor: 'pointer', p: '5px' }}
            >
              <Grid container item xs={10.5}>
                <Grid item maxWidth='25%'>
                  <Typography fontSize='12px' fontWeight={400} lineHeight='25px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                    {name}:
                  </Typography>
                </Grid>
                <Grid item xs>
                  <ShortAddress address={address} clipped />
                </Grid>
              </Grid>
              <Grid item xs={1.2} justifyContent='center'>
                <Identicon
                  iconTheme={chain?.icon || 'polkadot'}
                  prefix={chain?.ss58Format ?? 42}
                  size={31}
                  value={address}
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      }
      {openCamera &&
        <QrScanner
          openCamera={openCamera}
          setAddress={_selectAddress}
          setOpenCamera={setOpenCamera}
        />
      }
    </Grid>
  );
}
