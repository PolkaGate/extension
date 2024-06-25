// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Grid } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';


import { Identity } from '../../../components';

interface Props {
  api: ApiPromise | undefined;
  friends: string[];
  chain: Chain | undefined;
  accountsInfo?: DeriveAccountInfo[] | undefined;
}

export default function TrustedFriendsDisplay({ accountsInfo, api, chain, friends }: Props): React.ReactElement {
  return (
    <Grid alignItems='center' container direction='column' item sx={{ display: 'block', maxHeight: '150px', overflow: 'hidden', overflowY: 'scroll' }}>
      {friends.map((friend, index) => (
        <Identity
          accountInfo={accountsInfo ? accountsInfo[index] : undefined}
          api={api}
          chain={chain as any}
          direction='row'
          formatted={friend}
          identiconSize={25}
          key={index}
          showSocial={false}
          style={{ m: '0 auto 10px', fontSize: '18px' }}
          withShortAddress
        />
      ))}
    </Grid>
  );
}
