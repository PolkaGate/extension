// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity } from '../../../components';

interface Props {
  api: ApiPromise | undefined;
  friends: string[];
  chain: Chain | undefined;
}

export default function TrustedFriendsDisplay({ api, chain, friends }: Props): React.ReactElement {
  return (
    <Grid alignItems='center' container direction='column' gap='15px' item sx={{ maxHeight: '150px', overflow: 'hidden', overflowY: 'scroll' }}>
      {friends.map((friend, index) => (
        <Identity
          api={api}
          chain={chain}
          direction='row'
          formatted={friend}
          key={index}
          showSocial={false}
          withShortAddress
        />
      ))}
    </Grid>
  );
}
