// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, useTheme } from '@mui/material';
import React from 'react';

import allChains from '../util/chains';
import getLogo from '../util/getLogo';

interface Props {
  genesisHash: string | undefined;
  showDefault?: boolean;
  size?: number;
}

function ChainLogo({ genesisHash, showDefault = true, size = 25 }: Props): React.ReactElement<Props> {
  const logo = getLogo(allChains.find((chain) => chain.genesisHash === genesisHash)?.chain.replace(' Relay Chain', ''));

  return (
    <>
      {logo
        ? <Avatar
          src={logo}
          sx={{ height: size, width: size, borderRadius: '50%' }}
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

export default (ChainLogo);
