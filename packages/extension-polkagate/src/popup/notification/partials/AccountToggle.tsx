// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { type ChangeEvent, memo, useCallback } from 'react';

import { GradientDivider, Identity, MySwitch } from '@polkadot/extension-polkagate/src/components';

interface Props {
  address: string | undefined;
  checked: boolean;
  onSelect: (newSelect: string) => void;
  withDivider?: boolean;
  showShortAddressID?: boolean;
  genesisHash?: string | null;
}

function AccountToggle({ address, checked, genesisHash, onSelect, showShortAddressID, withDivider = true }: Props) {
  const handleSelect = useCallback((event: ChangeEvent<HTMLInputElement>, _checked: boolean) => {
    const selected = event.target.value;

    onSelect(selected);
  }, [onSelect]);

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between'>
        <Identity
          address={address}
          genesisHash={genesisHash ?? ''}
          identiconSize={24}
          nameStyle={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          showShortAddress={showShortAddressID}
          socialStyles={{ mt: 0 }}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            variant: 'B-4',
            width: '80%'
          }}
        />
        <MySwitch
          checked={checked}
          onChange={handleSelect}
          value={address}
        />
      </Stack>
      {withDivider && <GradientDivider />}
    </>
  );
}

export default memo(AccountToggle);
