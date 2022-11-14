// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { useAccountName, useChain, useFormatted, useTranslation } from '../hooks';
import { ChainLogo, Identicon } from '.';

interface Props {
  address: string;
  name?: string;
  style?: SxProps<Theme>;
  showChainLogo?: boolean;
  identiconSize?: number;
}

function Identity({ address, identiconSize = 40, name, showChainLogo = false, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);

  return (
    <Grid
      alignItems='center'
      container
      justifyContent='space-between'
      sx={{ ...style }}
    >
      <Grid
        alignItems='center'
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
            size={identiconSize}
            value={formatted}
          />
        </Grid>
        <Grid
          item
          maxWidth={'82%'}
        >
          <Typography
            fontSize={style?.fontSize ?? '28px'}
            fontWeight={400}
            overflow='hidden'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
          >
            {name || accountName || t<string>('unknown')}
          </Typography>
        </Grid>
      </Grid>
      {showChainLogo &&
        <Grid
          item
        >
          <ChainLogo
            genesisHash={chain?.genesisHash}
          />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Identity);
