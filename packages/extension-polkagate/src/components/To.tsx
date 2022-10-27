// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useTranslation } from '../hooks';
import isValidAddress from '../util/validateAddress';
import { Input } from './TextInputs';

interface Props {
  label: string;
  style?: SxProps<Theme>;
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  name?: string;
}

export default function To({ address, label, setAddress, style, name }: Props): React.ReactElement<Props> {
  const [offFocus, setOffFocus] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

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

  const pasteAddress = useCallback(() => {
    navigator.clipboard.readText().then((clipText) => isValidAddress(clipText) && setAddress(clipText)).catch(console.error);
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
        xs={12}
        sx={{ position: 'relative' }}
      >
        <Typography sx={{ fontSize: '16px' }}>
          {label}
        </Typography>
        <Input
          autoCapitalize='off'
          autoCorrect='off'
          onBlur={_setOffFocus}
          onChange={handleAddress}
          placeholder={t('Paste the address here')}
          style={{
            borderColor: address !== undefined && !isValidAddress(address) ? theme.palette.warning.main : theme.palette.secondary.light,
            borderWidth: address !== undefined && !isValidAddress(address) ? '3px' : '1px',
            fontSize: '14px',
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
      </Grid>
      {address && <Grid
        item
        sx={{
          border: 1,
          borderTop: 0,
          borderColor: theme.palette.secondary.light,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          height: '38px',
          fontSize: '28px',
          fontWeight: 400,
          letterSpacing: '-0.015em',
          borderBottomLeftRadius: '5%',
          borderBottomRightRadius: '5%',
          pl: '7px'
        }}
        xs={12}
      >
        {name}
      </Grid>
      }
    </Grid>
  );
}
