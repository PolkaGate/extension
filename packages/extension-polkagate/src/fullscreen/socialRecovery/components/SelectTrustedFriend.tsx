// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { faPaste, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, type SxProps, type Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { Chain } from '@polkadot/extension-chains/types';


import { Input, Label } from '../../../components';
import { useOutsideClick } from '../../../hooks';
import isValidAddress from '../../../util/validateAddress';
import TrustedFriendAccount from './TrustedFriendAccount';

export type AddressWithIdentity = { address: string, accountIdentity: DeriveAccountInfo | undefined };

interface Props {
  chain: Chain | null | undefined;
  accountsInfo?: DeriveAccountInfo[];
  label: string;
  style?: SxProps<Theme>;
  onSelectFriend: (addr: AddressWithIdentity | undefined) => void;
  helperText?: string;
  placeHolder?: string;
  disabled?: boolean;
  iconType?: 'plus' | 'minus' | 'none';
}

export default function SelectTrustedFriend({ accountsInfo = [], chain, disabled = false, placeHolder = '', iconType = 'plus', onSelectFriend, helperText = '', label, style }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [enteredAddress, setEnteredAddress] = useState<string | undefined>();
  const [friendsList, setFriendsList] = useState<AddressWithIdentity[] | undefined>();
  const [addressSelected, setAddressSelected] = useState<boolean>(false);

  const _hideDropdown = useCallback(() => setDropdownVisible(false), []);
  const _showDropdown = useCallback(() => setDropdownVisible(true), []);

  useOutsideClick([ref], _hideDropdown);

  useEffect(() => {
    !addressSelected && enteredAddress ? _showDropdown() : _hideDropdown();
  }, [addressSelected, _hideDropdown, enteredAddress, _showDropdown]);

  const findFriend = useCallback((value: string): void => {
    if (isValidAddress(value)) {
      const addressId = accountsInfo.find((accountID) => String(accountID.accountId) === value);

      onSelectFriend({ accountIdentity: addressId, address: value });

      setFriendsList([{ accountIdentity: addressId, address: value }]);
    } else {
      const possibleFriends = accountsInfo.filter((accountId) =>
        String(accountId.accountId).includes(value) ||
        accountId.identity.display?.includes(value) ||
        accountId.identity.displayParent?.includes(value) ||
        accountId.identity.email?.includes(value) ||
        accountId.identity.legal?.includes(value) ||
        accountId.identity.riot?.includes(value) ||
        accountId.identity.twitter?.includes(value) ||
        accountId.identity.web?.includes(value))
        .map((accountWithId) => ({ accountIdentity: accountWithId, address: String(accountWithId.accountId) }));

      onSelectFriend(undefined);
      setFriendsList(possibleFriends);
    }
  }, [accountsInfo, onSelectFriend]);

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (!value) {
      setEnteredAddress(undefined);
      setFriendsList(undefined);
      addressSelected && setAddressSelected(false);
      onSelectFriend(undefined);

      return;
    }

    setAddressSelected(false);
    setEnteredAddress(value);
    findFriend(value);
  }, [addressSelected, findFriend, onSelectFriend]);

  const pasteAddress = useCallback(() => {
    if (enteredAddress) {
      setEnteredAddress(undefined);
      setFriendsList(undefined);
      addressSelected && setAddressSelected(false);
      onSelectFriend(undefined);
    } else {
      navigator.clipboard.readText().then((clipText) => {
        findFriend(clipText);
        setEnteredAddress(clipText);
      }).catch(console.error);
    }
  }, [addressSelected, enteredAddress, findFriend, onSelectFriend]);

  const selectFriend = useCallback((addr: AddressWithIdentity | undefined) => {
    onSelectFriend(addr);
    setAddressSelected(true);

    if (iconType === 'none') {
      setEnteredAddress(addr?.address);
    }

    if (iconType === 'plus') {
      setEnteredAddress(undefined);
      setFriendsList(undefined);
    }

    _hideDropdown();
  }, [_hideDropdown, iconType, onSelectFriend]);

  return (
    <Grid alignItems='flex-end' container item justifyContent='space-between' ref={ref} sx={{ position: 'relative', ...style }}>
      <Grid container item onClick={_showDropdown}>
        <Label
          helperText={helperText}
          label={label}
          style={{ position: 'relative', width: '100%' }}
        >
          <Input
            autoCapitalize='off'
            autoCorrect='off'
            disabled={disabled}
            onChange={handleAddress}
            placeholder={placeHolder}
            style={{
              backgroundColor: disabled ? theme.palette.primary.contrastText : theme.palette.background.paper,
              borderColor: theme.palette.secondary.light,
              borderWidth: '1px',
              fontSize: '20px',
              fontWeight: 300,
              height: '45px',
              padding: 0,
              paddingLeft: '10px',
              paddingRight: '30px'
            }}
            theme={theme}
            type='text'
            value={enteredAddress ?? ''}
          />
          {!disabled &&
            <>
              <IconButton
                onClick={pasteAddress}
                sx={{
                  bottom: '7px',
                  m: '3px',
                  p: '5px',
                  position: 'absolute',
                  right: '0'
                }}
              >
                <FontAwesomeIcon
                  color={theme.palette.secondary.light}
                  fontSize='15px'
                  icon={enteredAddress ? faXmarkCircle : faPaste}
                />
              </IconButton>
            </>
          }
        </Label>
      </Grid>
      {friendsList && friendsList.length > 0 &&
        <Grid alignContent='flex-start' alignItems='flex-start' container sx={{
          '> div:not(:last-child)': { borderBottom: '1px solid', borderColor: 'secondary.light' },
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'secondary.light',
          borderRadius: '5px',
          boxShadow: '-2px 4px 4px 0px #000000B2',
          height: '300px',
          overflow: 'hidden',
          overflowY: 'scroll',
          position: 'absolute',
          top: '83px',
          visibility: isDropdownVisible ? 'visible' : 'hidden',
          width: '672px',
          zIndex: 10
        }}
        >
          {friendsList.map((friend, index) => (
            <TrustedFriendAccount
              accountInfo={friend.accountIdentity}
              chain={chain as any}
              formatted={friend.address}
              iconType={iconType}
              key={index}
              onSelect={selectFriend}
              style={{ px: '10px' }}
            />
          ))}
        </Grid>
      }
    </Grid>
  );
}
