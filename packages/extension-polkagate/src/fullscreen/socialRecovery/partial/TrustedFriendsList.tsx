// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import type { Chain } from '@polkadot/extension-chains/types';


import { useTranslation } from '../../../hooks';
import { pgBoxShadow } from '../../../util/utils';
import { AddressWithIdentity } from '../components/SelectTrustedFriend';
import TrustedFriendAccount from '../components/TrustedFriendAccount';

interface Props {
  chain: Chain | null | undefined;
  friendsList: string[] | AddressWithIdentity[];
  title?: string;
  style?: SxProps<Theme> | undefined;
  onRemoveFriend?: (addr: AddressWithIdentity) => void;
}

export default function TrustedFriendsList({ chain, friendsList, onRemoveFriend, style, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container direction='column' item sx={{ '> :not(:last-child)': { borderBottom: '1px solid', borderBottomColor: '#D5CCD0' }, bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), display: 'block', maxHeight: '230px', mt: '20px', overflow: 'hidden', overflowY: 'scroll', p: '20px', ...style }}>
      {title &&
        <Typography fontSize='20px' fontWeight={500} sx={{ borderBottom: '2px solid', borderBottomColor: '#D5CCD0', p: '3px', width: '100%' }}>
          {title}
        </Typography>
      }
      {friendsList.length === 0 &&
        <Typography fontSize='14px' fontWeight={400} pt='30px' textAlign='center' width='100%'>
          {t<string>('No trusted friend added yet.')}
        </Typography>
      }
      {friendsList.map((friend, index) => (
        <TrustedFriendAccount
          accountInfo={typeof (friend) === 'object' ? friend.accountIdentity : undefined}
          chain={chain as any}
          formatted={typeof (friend) === 'object' ? friend.address : String(friend)}
          iconType='minus'
          key={index}
          onSelect={onRemoveFriend}
        />
      ))}
    </Grid>
  );
}
