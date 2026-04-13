// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

import { Box, Divider, InputAdornment, Stack, type SxProps, TextField, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown, CloseCircle, Document, Hashtag, ScanBarcode } from 'iconsax-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isEthereumAddress } from '@polkadot/util-crypto';

import AccountListModal from '../fullscreen/components/AccountListModal';
import { useIsBlueish, useTranslation } from '../hooks';
import QrScanner from '../popup/import/addWatchOnlyFullScreen/QrScanner';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { isValidAddress } from '../util';

interface Props {
  allAddresses?: [string, string | null, string | undefined][]// todo : remove
  address: string | null | undefined;
  addWithQr?: boolean;
  disabled?: boolean;
  genesisHash?: string | undefined;
  inlineActionLabel?: string;
  label?: string;
  onInlineActionClick?: () => void;
  placeHolder?: string;
  setAddress?: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  style?: SxProps<Theme>;
  setIsError?: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setType?: React.Dispatch<React.SetStateAction<KeypairType | undefined>>;
  showAddressBook?: boolean;
  withSelect?: boolean;
}

interface AdornmentActionProps {
  actionKey: 'clear' | 'inline' | 'qr' | 'select' | 'paste';
  children: React.ReactNode;
  hoverActionBackground: string;
  onClick: () => void;
  setHoveredAction: React.Dispatch<React.SetStateAction<'clear' | 'inline' | 'qr' | 'select' | 'paste' | undefined>>;
  wide?: boolean;
}

function AdornmentAction({ actionKey, children, hoverActionBackground, onClick, setHoveredAction, wide = false }: AdornmentActionProps): React.ReactElement {
  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHoveredAction(actionKey)}
      onMouseLeave={() => setHoveredAction(undefined)}
      sx={{
        '&:hover': {
          background: hoverActionBackground
        },
        alignItems: 'center',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        height: '24px',
        justifyContent: 'center',
        transition: 'all 150ms ease-out',
        ...(wide ? { mr: '6px', px: '6px' } : { width: '24px' })
      }}
    >
      {children}
    </Box>
  );
}

export default function AddressInput({ addWithQr = false, address, genesisHash, disabled = false, inlineActionLabel, onInlineActionClick, label, placeHolder, setAddress, setIsError, setType, showAddressBook, style, withSelect }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isBlueish = useIsBlueish();
  const theme = useTheme();

  const [focus, setFocus] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [openAccountList, setOpenAccountList] = useState<boolean>(false);
  const [invalidAddress, setInvalidAddress] = useState<boolean>(false);
  const [enteredAddress, setEnteredAddress] = useState<string | undefined | null>();
  const [hoveredAction, setHoveredAction] = useState<'clear' | 'inline' | 'qr' | 'select' | 'paste' | undefined>(undefined);
  const defaultActionColor = '#AA83DC';
  const hoverActionColor = '#EAEBF1';
  const hoverActionBackground = 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)';
  const getActionColor = useCallback((action: 'clear' | 'inline' | 'qr' | 'select' | 'paste') =>
    hoveredAction === action ? hoverActionColor : defaultActionColor
  , [defaultActionColor, hoverActionColor, hoveredAction]);

  useEffect(() => {
    if (address || address === null) {
      setEnteredAddress(address);
      setInvalidAddress(false);
    }
  }, [address]);

  useEffect(() => {
    setIsError && setIsError(invalidAddress);
  }, [address, invalidAddress, setIsError]);

  const onReset = useCallback((): void => {
    setAddress?.(null);
    setEnteredAddress(undefined);
    setInvalidAddress(false);
    setType?.((prev) => (prev === 'ethereum' ? undefined : prev));
  }, [setAddress, setType]);

  const onSet = useCallback((value: string): void => {
    const isEvm = isEthereumAddress(value);

    isEvm && setType?.('ethereum');
    const isValid = isValidAddress(value);

    isValid
      ? setAddress?.(value)
      : setAddress?.(undefined);

    setEnteredAddress(value);
    setInvalidAddress(!isValid);
  }, [setAddress, setType]);

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (!value) {
      onReset();

      return;
    }

    onSet(value);
  }, [onReset, onSet]);

  // @ts-ignore
  const _selectAddress = useCallback((newAddr?: string) => handleAddress({ target: { value: newAddr } }), [handleAddress]);
  const openQrScanner = useCallback(() => setOpenCamera(true), []);
  const onOpenAccountList = useCallback(() => setOpenAccountList(true), []);
  const handleInputAddress = useCallback((value: React.ChangeEvent<HTMLInputElement>) => {
    handleAddress(value);
  }, [handleAddress]);
  const handleInlineActionClick = useCallback(() => {
    onInlineActionClick?.();
  }, [onInlineActionClick]);

  const pasteAddress = useCallback(() => {
    if (enteredAddress || address) {
      onReset();

      return;
    }

    navigator.clipboard.readText()
      .then((clipText) => {
        onSet(clipText);
      }).catch(console.error);
  }, [address, enteredAddress, onReset, onSet]);

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
                  {!!enteredAddress
                    ? (
                      <AdornmentAction
                        actionKey='clear'
                        hoverActionBackground={hoverActionBackground}
                        onClick={onReset}
                        setHoveredAction={setHoveredAction}
                      >
                        <CloseCircle color={getActionColor('clear')} size='18' variant='Bulk' />
                      </AdornmentAction>
                    )
                    : <>
                  {!enteredAddress && inlineActionLabel && onInlineActionClick &&
                    <>
                      <AdornmentAction
                        actionKey='inline'
                        hoverActionBackground={hoverActionBackground}
                        onClick={handleInlineActionClick}
                        setHoveredAction={setHoveredAction}
                        wide
                      >
                        <Typography color={getActionColor('inline')} sx={{ transition: 'color 150ms ease-out' }} variant='B-4'>
                          {inlineActionLabel}
                        </Typography>
                      </AdornmentAction>
                      <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                    </>
                  }
                  {!!withSelect &&
                    <>
                      <AdornmentAction
                        actionKey='select'
                        hoverActionBackground={hoverActionBackground}
                        onClick={onOpenAccountList}
                        setHoveredAction={setHoveredAction}
                      >
                        <ArrowCircleDown color={getActionColor('select')} size='18' variant='Bulk' />
                      </AdornmentAction>
                      <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                    </>
                  }
                  {addWithQr &&
                    <>
                      <AdornmentAction
                        actionKey='qr'
                        hoverActionBackground={hoverActionBackground}
                        onClick={openQrScanner}
                        setHoveredAction={setHoveredAction}
                      >
                        <ScanBarcode color={getActionColor('qr')} size='18' variant='Bulk' />
                      </AdornmentAction>
                      <Divider orientation='vertical' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '18px', mx: '2px' }} />
                    </>
                  }
                  <AdornmentAction
                    actionKey='paste'
                    hoverActionBackground={hoverActionBackground}
                    onClick={pasteAddress}
                    setHoveredAction={setHoveredAction}
                  >
                    <Document color={getActionColor('paste')} size='18' variant='Bulk' />
                  </AdornmentAction>
                    </>}
                </>}
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
          genesisHash={genesisHash}
          // eslint-disable-next-line react/jsx-no-bind
          handleClose={() => setOpenAccountList(false)}
          open={openAccountList}
          setAddress={setAddress}
          showAddressBook={showAddressBook}
        />
      }
    </>
  );
}
