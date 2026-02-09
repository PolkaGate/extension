// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { type ChangeEvent, memo, useCallback } from 'react';

import { GradientDivider, Identity2, MySwitch } from '@polkadot/extension-polkagate/src/components';
import { POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';

interface Props {
  address: string | undefined;
  checked: boolean;
  onSelect: (newSelect: string) => void;
  withDivider?: boolean;
  showShortAddressID?: boolean;
}

function AccountToggle({ address, checked, onSelect, showShortAddressID, withDivider = true }: Props) {
  const handleSelect = useCallback((event: ChangeEvent<HTMLInputElement>, _checked: boolean) => {
    const selected = event.target.value;

    onSelect(selected);
  }, [onSelect]);

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between'>
        <Identity2
          address={address}
          genesisHash={POLKADOT_GENESIS_HASH}
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
