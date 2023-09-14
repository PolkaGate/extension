// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { useParams } from 'react-router';

import { Chain } from '@polkadot/extension-chains/types';

import { useApi, useTranslation } from '../hooks';
import getAllAddresses from '../util/getAllAddresses';
import { AccountContext, AddressInput2, Identity } from '.';

interface Props {
  address: string | null | undefined;
  chain: Chain | null;
  label: string;
  labelFontSize?: string;
  style?: SxProps<Theme>;
  setAddress: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  ignoreAddress?: string
  name?: string;
  helperText?: string;
  disabled?: boolean;
}

export default function InputAccount({ address, chain, disabled, helperText, ignoreAddress, label, labelFontSize = '14px', name, setAddress, style }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);
  const params = useParams<{ address: string }>();
  const api = useApi(params.address);
  const allAddresses = getAllAddresses(hierarchy, false, true, chain?.ss58Format, ignoreAddress);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ ...style }}>
      <AddressInput2
        address={address}
        allAddresses={allAddresses}
        chain={chain}
        disabled={disabled}
        helperText={helperText}
        label={label}
        labelFontSize={labelFontSize}
        placeHolder={t<string>('Paste the address here')}
        setAddress={setAddress}
        showIdenticon={false}
      />
      {address && chain &&
        <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: 1, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px', borderColor: theme.palette.secondary.light, borderTop: 0, fontSize: '28px', fontWeight: 400, letterSpacing: '-0.015em', maxWidth: '100%', mt: '-4px' }} xs={12}>
          <Divider
            sx={{
              bgcolor: 'transparent',
              border: '0.5px dotted #E8E0E5',
              m: '4px auto',
              width: '90%'
            }}
          />
          <Identity
            api={api}
            chain={chain}
            formatted={address}
            identiconSize={31}
            name={name}
            style={{ height: '44px', maxWidth: '100%', ml: '7px', width: 'fit-content' }}
          />
        </Grid>
      }
    </Grid>
  );
}
