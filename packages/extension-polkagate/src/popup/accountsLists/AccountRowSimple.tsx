// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Divider, Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useContext } from 'react';

import AccountDropDown from '@polkadot/extension-polkagate/src/fullscreen/home/AccountDropDown';
import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';

import { AccountContext, Identity2 } from '../../components';

interface Props {
  account: AccountWithChildren;
  isSelected: boolean;
}

function AccountRowSimple ({ account, isSelected }: Props): React.ReactElement {
  const { accounts } = useContext(AccountContext);

  const onClick = useCallback(() => {
    const address = account?.address;

    if (!address) {
      return;
    }

    // update account as selected to be consistent with extension
    const accountToUnselect = accounts.find(({ address: accountAddress, selected }) => selected && address !== accountAddress);

    Promise.all([
      updateMeta(address, JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error);
  }, [account?.address, accounts]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ '&:hover': { backgroundColor: '#1B133C', padding:'0 8px' }, borderRadius: '12px', m: '5px 8px 5px 15px', position: 'relative', transition: 'all 250ms ease-out' }}>
      {isSelected && <Divider orientation='vertical' sx={{ background: '#FF4FB9', height: '24px', left: '-13px', position: 'absolute', width: '3px' }} />}
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' onClick={onClick} sx={{ cursor: 'pointer', width: '80%' }}>
        <PolkaGateIdenticon
          address={account.address}
          size={24}
        />
        <Identity2
          address={account?.address}
          genesisHash={account?.genesisHash ?? POLKADOT_GENESIS}
          identiconSize={14}
          noIdenticon
          style={{ color: '#BEAAD8', variant: 'B-2' }}
        />
      </Stack>
      <AccountDropDown
        address={account?.address}
        iconSize='24px'
      />
    </Stack>
  );
}

export default React.memo(AccountRowSimple);
