// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { Divider, InputAdornment, Stack, type SxProps, TextField, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, Document, Hashtag, ScanBarcode } from 'iconsax-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import AccountListModal from '../fullscreen/components/AccountListModal';
import { useIsBlueish, useTranslation } from '../hooks';
import QrScanner from '../popup/import/addWatchOnlyFullScreen/QrScanner';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { isValidAddress } from '../util';

interface Props {
  allAddresses?: [string, string | null, string | undefined][]// todo : remove
  address: string | null | undefined;
  addWithQr?: boolean;
  chain?: Chain | null;
  disabled?: boolean;
  label?: string;
  placeHolder?: string;
  setAddress?: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  style?: SxProps<Theme>;
  withSelect?: boolean;
  setIsError?: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function AddressInput ({ addWithQr = false, address, chain, disabled = false, label, placeHolder, setAddress, setIsError, style, withSelect }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isBlueish = useIsBlueish();
  const theme = useTheme();

  const [focus, setFocus] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [openAccountList, setOpenAccountList] = useState<boolean>(false);
  const [invalidAddress, setInvalidAddress] = useState<boolean>(false);
  const [enteredAddress, setEnteredAddress] = useState<string | undefined>();

  useEffect(() => {
    if (address) {
      setEnteredAddress(address);
      setInvalidAddress(false);
    }
  }, [address]);

  useEffect(() => {
    setIsError && setIsError(invalidAddress);
  }, [address, invalidAddress, setIsError]);

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
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

  const handleInputAddress = useCallback((value: React.ChangeEvent<HTMLInputElement>) => {
    handleAddress(value);
  }, [handleAddress]);

  const pasteAddress = useCallback(() => {
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
        {label &&
          <Typography color='#EAEBF1' sx={{ textAlign: 'left' }} variant='B-1'>
            {label}
          </Typography>
        }
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position='end' sx={{ bgcolor: '#2D1E4A', borderRadius: '8px', height: '80%', maxHeight: '80%', px: '5px' }}>
                {!disabled && <>
                  {addWithQr &&
                    <>
                      <ScanBarcode color='#AA83DC' onClick={openQrScanner} size='18' style={{ cursor: 'pointer', margin: '0 5px' }} variant='Bulk' />
                      <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                    </>
                  }
                  {!!withSelect &&
                    <>
                      <ArrowCircleDown color='#AA83DC' onClick={onOpenAccountList} size='18' style={{ cursor: 'pointer', margin: '0 5px' }} variant='Bulk' />
                      <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                    </>
                  }
                  <Document color='#AA83DC' onClick={pasteAddress} size='18' style={{ cursor: 'pointer', margin: '0 5px' }} variant='Bulk' />
                </>}
                {/* icon={enteredAddress || address ? faXmarkCircle : faPaste} */}
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position='start'>
                {enteredAddress && !invalidAddress
                  ? (
                    <PolkaGateIdenticon
                      address={enteredAddress}
                      size={18}
                    />)
                  : <Hashtag
                    color={invalidAddress ? '#FF4FB9' : focus ? '#3988FF' : '#AA83DC'}
                    size='18'
                    style={{ cursor: 'pointer', margin: '0 2px 0' }}
                    variant='Bulk'
                  />
                }
              </InputAdornment>
            ),
            style: {
              color: `${invalidAddress ? theme.palette.error.main : isBlueish ? theme.palette.text.highlight : theme.palette.text.secondary}`, // Applies to input text AND placeholder
              fontFamily: 'Inter',
              fontSize: '12px',
              fontWeight: 500
            }
          }}
          autoComplete='off'
          onChange={handleInputAddress}
          // eslint-disable-next-line react/jsx-no-bind
          onFocus={() => setFocus(true)}
          placeholder={placeHolder ?? t('Enter your account ID')}
          sx={{
            '&:hover': {
              bgcolor: '#2D1E4A'
            },
            '> div.MuiOutlinedInput-root': {
              '> fieldset':
              {
                border: 'none'
              },
              '> input.MuiAutocomplete-input':
              {
                '&::placeholder': {
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500
                },
                border: 'none',
                p: 0
              },
              border: 'none',
              height: '100%',
              p: '0 3px 0 5px'
            },
            bgcolor: '#1B133CB2',
            border: '1px solid',
            borderColor: `${invalidAddress ? 'warning.main' : focus ? 'action.focus' : '#BEAAD833'}`,
            borderRadius: '12px',
            height: '44px'
          }}
          value={enteredAddress ?? ''}
        />
        {invalidAddress && !setIsError &&
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
          genesisHash={chain?.genesisHash}
          // eslint-disable-next-line react/jsx-no-bind
          handleClose={() => setOpenAccountList(false)}
          open={openAccountList}
          setAddress={setAddress}
        />
      }
    </>
  );
}
