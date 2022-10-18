// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, SxProps, Theme, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import isValidAddress from '../util/validateAddress';
import Identicon from './Identicon';
import Label from './Label';
import { Input } from './TextInputs';

interface Props {
  label: string;
  onChange?: (value: string) => void;
  style?: SxProps<Theme>;
  chain?: Chain;
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function InputWithLabelAndIdenticon({ chain = undefined, setAddress, address, onChange, label, style }: Props): React.ReactElement<Props> {
  const [offFocus, setOffFocus] = useState(false);
  const theme = useTheme();

  const handleAddress = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (!value) {
      setAddress(undefined);

      return;
    }

    if (isValidAddress(value)) {
      setAddress(value);
    } else {
      setAddress(null);
    }
  }, [setAddress]);

  const _setOffFocus = useCallback(() => {
    setOffFocus(true);
  }, []);

  const pasteAddress = useCallback(async () => {
    const val = await navigator.clipboard.readText();

    isValidAddress(val) && setAddress(val);
  }, [setAddress]);

  return (
    <Grid
      alignItems='flex-end'
      container
      justifyContent='space-between'
      sx={{ ...style }}
    >
      <Grid
        item
        xs={10.5}
      >
        <Label
          label={label}
          style={{ position: 'relative' }}
        >
          <Input
            autoCapitalize='off'
            autoCorrect='off'
            onBlur={_setOffFocus}
            onChange={handleAddress}
            style={{
              borderColor: address !== undefined && !isValidAddress(address) ? theme.palette.warning.main : theme.palette.secondary.light,
              borderWidth: address !== undefined && !isValidAddress(address) ? '3px' : '1px',
              fontSize: '18px',
              fontWeight: 300,
              padding: 0,
              paddingLeft: '10px',
              paddingRight: '30px'
            }}
            theme={theme}
            type='text'
            value={address ?? ''}
            withError={offFocus && address !== undefined && !isValidAddress(address)}
          />
          <IconButton
            onClick={pasteAddress}
            sx={{
              bottom: '0',
              position: 'absolute',
              right: '0'
            }}
          >
            <FontAwesomeIcon
              color={theme.palette.secondary.light}
              fontSize='15px'
              icon={faPaste}
            />
          </IconButton>
        </Label>
      </Grid>
      <Grid
        item
        xs={1.2}
      >
        {isValidAddress(address)
          ? (
            <Identicon
              iconTheme={chain?.icon || 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={31}
              value={address}
            />
          )
          : (
            <Grid
              sx={{
                bgcolor: 'action.disabledBackground',
                border: '1px solid',
                borderColor: 'secondary.light',
                borderRadius: '50%',
                height: '31px',
                width: '31px'
              }}
            >
            </Grid>)
        }
      </Grid>
    </Grid >
  );
}
