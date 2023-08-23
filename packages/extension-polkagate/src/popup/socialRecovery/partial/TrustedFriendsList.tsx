// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { FriendWithId } from '../components/SelectTrustedFriend';
import TrustedFriendAccount from '../components/TrustedFriendAccount';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  friendsList: string[] | FriendWithId[];
  title?: string;
  style?: SxProps<Theme> | undefined;
  onRemoveFriend?: (addr: FriendWithId) => void;
}

export default function TrustedFriendsList({ api, chain, friendsList, onRemoveFriend, style, title }: Props): React.ReactElement {
  return (
    <Grid container direction='column' item sx={{ '> :not(:last-child)': { borderBottom: '1px solid', borderBottomColor: '#D5CCD0' }, bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', display: 'block', maxHeight: '230px', mt: '20px', overflow: 'hidden', overflowY: 'scroll', p: '20px', ...style }}>
      {title &&
        <Typography fontSize='20px' fontWeight={500} sx={{ borderBottom: '2px solid', borderBottomColor: '#D5CCD0', p: '3px', width: '100%' }}>
          {title}
        </Typography>
      }
      {friendsList.map((friend, index) => (
        <TrustedFriendAccount
          accountInfo={typeof (friend) === 'object' ? friend.accountIdentity : undefined}
          api={api}
          chain={chain}
          formatted={typeof (friend) === 'object' ? friend.address : String(friend)}
          iconType='minus'
          key={index}
          onSelect={onRemoveFriend}
        />
      ))}
    </Grid>
  );
}
