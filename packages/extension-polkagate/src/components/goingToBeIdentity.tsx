// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useAccount, useMetadata,useTranslation } from '../hooks';
import { ChainLogo, Identicon } from '.';

interface Props {
  address: string;
  name?: string;
  style?: SxProps<Theme>;
  showChainLogo?: boolean;
}

export default function Identity({ address, name, showChainLogo = false, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const account = useAccount(address);
  const chain = useMetadata(account?.genesisHash, true);
  const [formatted, setFormatted] = useState<string | undefined>();

  useEffect(() => {
    const publicKey = decodeAddress(address);

    setFormatted(encodeAddress(publicKey, chain?.ss58Format));
  }, [address, chain]);

  return (
    <Grid
      alignItems='center'
      container
      justifyContent='space-between'
      sx={{ ...style }}
    >
      <Grid
        container
        item
        xs={showChainLogo ? 11 : 12}
      >
        <Grid
          item
          pr='8px'
        >
          <Identicon
            iconTheme={chain?.icon ?? 'polkadot'}
            prefix={chain?.ss58Format ?? 42}
            size={40}
            value={formatted ?? account?.address}
          />
        </Grid>
        <Grid
          item
          maxWidth={'82%'}
        >
          <Typography
            fontSize='28px'
            fontWeight={400}
            whiteSpace='nowrap'
            overflow='hidden'
            textOverflow='ellipsis'
          >
            {name || account?.name || t<string>('unknown')}
          </Typography>
        </Grid>
      </Grid>
      {showChainLogo &&
        <Grid
          item
        >
          <ChainLogo
            genesisHash={account?.genesisHash}
          />
        </Grid>
      }
    </Grid>
  );
}
