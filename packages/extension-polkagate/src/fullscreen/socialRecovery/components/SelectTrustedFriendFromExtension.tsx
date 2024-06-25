// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Grid, Popover, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

import type { Chain } from '@polkadot/extension-chains/types';


import { AccountContext, Label } from '../../../components';
import { useTranslation } from '../../../hooks';
import { getFormattedAddress, pgBoxShadow } from '../../../util/utils';
import TrustedFriendAccount from './TrustedFriendAccount';

export type AddressWithIdentity = { address: string, accountIdentity: DeriveAccountInfo | undefined };

interface Props {
  accountsInfo: DeriveAccountInfo[] | undefined;
  address: string | undefined;
  chain: Chain | null | undefined;
  style?: SxProps<Theme>;
  onSelectFriend: (addr: AddressWithIdentity | undefined) => void;
}

export default function SelectTrustedFriendFromExtension({ accountsInfo, address, chain, onSelectFriend, style }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const allAccounts = useMemo(() => accounts.filter((acc) => acc.address !== address).map((account) => getFormattedAddress(account.address, chain, chain?.ss58Format)), [accounts, address, chain]);

  const friendsList = useMemo(() => accountsInfo && allAccounts.map((acc) => ({ accountIdentity: accountsInfo.find((info) => String(info.accountId) === acc), address: acc })), [accountsInfo, allAccounts]);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const selectFriend = useCallback((addr: AddressWithIdentity | undefined) => {
    onSelectFriend(addr);
    handleClose();
  }, [handleClose, onSelectFriend]);

  const AccountsList = () => (
    <Grid container item sx={{ '> div:not(:last-child)': { borderBottom: '1px solid', borderColor: 'secondary.light' }, maxHeight: '300px', overflow: 'hidden', overflowY: 'scroll', width: '672px' }}>
      {friendsList?.map((friend, index) => (
        <TrustedFriendAccount
          accountInfo={friend.accountIdentity}
          chain={chain as any}
          formatted={friend.address}
          iconType='plus'
          key={index}
          onSelect={selectFriend}
          style={{ px: '8px' }}
        />
      ))}
    </Grid>
  );

  return (
    <Grid container item sx={{ position: 'relative', ...style }}>
      <Label
        label={t<string>('Choose from your extension accounts')}
        style={{ position: 'relative', width: '100%' }}
      >
        <Grid alignItems='center' aria-describedby={id} component='button' container disabled={!friendsList} item justifyContent='space-between' onClick={handleClick} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', height: '45px', p: '8px' }}>
          <Typography fontSize='16px' fontWeight={400} sx={{ color: '#9A7DB2' }}>
            {t<string>('Select')}
          </Typography>
          <ArrowDropDownIcon
            sx={{ color: 'primary.main', fontSize: '28px', width: 'fit-content' }}
          />
        </Grid>
        <Popover
          PaperProps={{
            sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '2px solid', borderColor: 'secondary.main', borderRadius: '7px', boxShadow: pgBoxShadow(theme), py: '5px' }
          }}
          anchorEl={anchorEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom'
          }}
          id={id}
          onClose={handleClose}
          open={open}
          sx={{ mt: '5px' }}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top'
          }}
        >
          <AccountsList />
        </Popover>
      </Label>
    </Grid>
  );
}
