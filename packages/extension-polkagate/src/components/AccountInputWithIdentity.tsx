// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, useTheme } from '@mui/material';
import React, { useContext } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useAccountName, useTranslation } from '../hooks';
import getAllAddresses from '../util/getAllAddresses';
import { AccountContext, Identity, InputWithLabelAndIdenticon } from '.';

interface Props {
  address: string | undefined;
  chain: Chain | null;
  label: string;
  style?: SxProps<Theme>;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  ignoreAddress?: string
  name?: string;
}

export default function AccountInputWithIdentity({ address, chain, ignoreAddress, label, name, setAddress, style }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);
  const allAddresses = getAllAddresses(hierarchy, false, true, chain?.ss58Format, ignoreAddress);

  const selectedAddrName = useAccountName(address);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' sx={{ ...style }}>
      <InputWithLabelAndIdenticon
        address={address}
        allAddresses={allAddresses}
        chain={chain}
        label={label}
        placeHolder={t<string>('Paste the address here')}
        setAddress={setAddress}
        showIdenticon={false}
      />
      {address && chain &&
        <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: 1, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px', borderColor: theme.palette.secondary.light, borderTop: 0, fontSize: '28px', fontWeight: 400, letterSpacing: '-0.015em', mt: '-4px', pl: '7px', pt: '8px' }} xs={12}>
          <Identity
            chain={chain}
            formatted={address}
            identiconSize={31}
            name={name || selectedAddrName}
          />
        </Grid>
      }
    </Grid>
  );
}
