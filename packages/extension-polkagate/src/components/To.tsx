// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { faPaste } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useTranslation } from '../hooks';
// import isValidAddress from '../util/validateAddress';
import { Identicon, InputWithLabelAndIdenticon, AccountContext, Identity } from './';
import getAllAddressess from '../util/getAllAddresses';

interface Props {
  address: string | undefined;
  chain: Chain | null;
  label: string;
  name?: string;
  style?: SxProps<Theme>;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  senderAddress: string
}

export default function To({ address, chain, senderAddress, setAddress, style }: Props): React.ReactElement<Props> {
  // const [offFocus, setOffFocus] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);
  const allAddresses = getAllAddressess(hierarchy, true, true, chain?.ss58Format, senderAddress);
  const allAddr = getAllAddressess(hierarchy, true, true, chain?.ss58Format);

  const selectedAddrName = allAddr.find((acc) => acc[0] === address)?.[2];

  return (
    <Grid
      alignItems='flex-end'
      container
      justifyContent='space-between'
      sx={{ ...style }}
    >
      <InputWithLabelAndIdenticon
        address={address}
        allAddresses={allAddresses}
        chain={chain}
        label={t<string>('To')}
        placeHolder={t<string>('Paste the address here')}
        setAddress={setAddress}
        showIdenticon={false}
      />
      {address && chain &&
        <Grid
          alignItems='center'
          container
          item
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderBottomLeftRadius: '5px',
            borderBottomRightRadius: '5px',
            borderColor: theme.palette.secondary.light,
            borderTop: 0,
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '-0.015em',
            mt: '-4px',
            pl: '7px',
            pt: '8px'
          }}
          xs={12}
        >
          <Identity
            chain={chain}
            formatted={address}
            identiconSize={35}
            name={selectedAddrName}
          />
        </Grid>
      }
    </Grid>
  );
}
