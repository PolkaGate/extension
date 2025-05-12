// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useMemo } from 'react';

import { useSelectedAccount } from '../hooks';
import { updateMeta } from '../messaging';
import { AccountContext, DropSelect } from '.';

interface Props {
  style?: React.CSSProperties;
}

function AccountDropDown ({ style }: Props) {
  const selectedAccount = useSelectedAccount();
  const { accounts } = useContext(AccountContext);

  const onClick = useCallback((address: string | number) => {
    const accountToUnselect = accounts.find(({ address: accountAddress, selected }) => selected && address !== accountAddress);

    Promise.all([
      updateMeta(String(address), JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error);
  }, [accounts]);

  const options = useMemo(() => {
    return accounts.map(({ address, name }) => {
      return {
        text: name || 'unknown',
        value: address
      };
    });
  }, [accounts]);

  return (
    <DropSelect
      contentDropWidth={250}
      defaultValue={selectedAccount?.address}
      displayContentType='account'
      onChange={onClick}
      options={options}
      scrollTextOnOverflow
      showCheckAsIcon
      style={{
        margin: '12px 15px',
        ...style
      }}
      value={selectedAccount?.address}
    />
  );
}

export default AccountDropDown;
