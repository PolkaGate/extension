// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type SxProps, type Theme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

import { useSelectedAccount } from '../hooks';
import { updateMeta } from '../messaging';
import { AccountContext, DropSelect } from '.';

interface Props {
  style?: SxProps<Theme>;
}

function AccountDropDown ({ style }: Props) {
  const selectedAccount = useSelectedAccount();
  const { accounts } = useContext(AccountContext);

  const onClick = useCallback((address: string) => {
    const accountToUnselect = accounts.find(({ address: accountAddress, selected }) => selected && address !== accountAddress);

    Promise.all([
      updateMeta(address, JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error);
  }, [accounts]);

  const options = useMemo(() => {
    return accounts.map(({ address, name }) => {
      return {
        text: name,
        value: address
      };
    });
  }, [accounts]);

  return (
    <DropSelect
      contentDropWidth = {250}
      defaultValue={selectedAccount?.address}
      displayContentType='account'
      onChange={onClick}
      options={options}
      scrollTextOnOverFlowX
      showCheckAsIcon
      style={{
        mt: '12px',
        mx: '15px',
        ...style
      }}
      value={selectedAccount?.address}
    />
  );
}

export default AccountDropDown;
