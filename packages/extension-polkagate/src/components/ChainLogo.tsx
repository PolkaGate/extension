// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, useTheme } from '@mui/material';
import React from 'react';

import allChains from '../util/chains';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';

interface Props {
  genesisHash: string | undefined;
  showDefault?: boolean;
  size?: number;
}

function ChainLogo({ genesisHash, showDefault = true, size = 25 }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const foundChainName = allChains.find((chain) => chain.genesisHash === genesisHash)?.chain;
  const chainName = sanitizeChainName(foundChainName);
  const logo = getLogo(chainName);

  return (
    <>
      {logo
        ? <Avatar
          src={logo}
          sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(chainName) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: size, width: size }}
          variant='square'
        />
        : showDefault && <Grid
          sx={{
            bgcolor: 'action.disabledBackground',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '50%',
            height: `${size + 6}px`,
            width: `${size + 6}px`
          }}
        >
        </Grid>
      }
    </>
  );
}

export default React.memo(ChainLogo);
