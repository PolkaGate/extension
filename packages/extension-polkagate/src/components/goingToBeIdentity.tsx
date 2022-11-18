// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useAccountName, useChain, useFormatted, useTranslation } from '../hooks';
import { getSubstrateAddress } from '../util/utils';
import { ChainLogo, Identicon, ShortAddress } from '.';

interface Props {
  address?: string;
  formatted?: string;
  name?: string;
  style?: SxProps<Theme>;
  showChainLogo?: boolean;
  identiconSize?: number;
  chain?: Chain;
  showShortAddress?: boolean;
}

function Identity({ address, chain, formatted, identiconSize = 40, name, showChainLogo = false, showShortAddress, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountName = useAccountName(formatted ? getSubstrateAddress(formatted) : address);
  const _chain = useChain(address, chain);
  const _formatted = useFormatted(address, formatted);

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
            iconTheme={_chain?.icon ?? 'polkadot'}
            prefix={_chain?.ss58Format ?? 42}
            size={identiconSize}
            value={_formatted}
          />
        </Grid>
        <Grid item maxWidth={'82%'} sx={{ fontSize: style?.fontSize ?? '28px', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name || accountName || (!showShortAddress && t<string>('unknown'))}
        </Grid>
        {!(name || accountName) && showShortAddress &&
          <Grid item maxWidth={'82%'} sx={{ fontSize: style?.fontSize ?? '28px', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <ShortAddress address={_formatted} />
          </Grid>
        }
      </Grid>
      {
        showChainLogo &&
        <Grid
          item
        >
          <ChainLogo
            genesisHash={_chain?.genesisHash}
          />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(Identity);
