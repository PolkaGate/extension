// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useMemo } from 'react';

import { useSelectedAccount } from '../hooks';
import { setStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';
import { AccountContext, DropSelect } from '.';

interface Props {
  style?: React.CSSProperties;
}

function AccountSelectionDropDown ({ style }: Props) {
  const selectedAccount = useSelectedAccount();
  const { accounts } = useContext(AccountContext);

  const onClick = useCallback((address: string | number) => {
    setStorage(STORAGE_KEY.SELECTED_ACCOUNT, address).catch(console.error);
  }, []);

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

export default AccountSelectionDropDown;
