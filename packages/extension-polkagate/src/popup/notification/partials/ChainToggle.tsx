// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React, { type ChangeEvent, memo, useCallback } from 'react';

import { ChainLogo, MySwitch } from '@polkadot/extension-polkagate/src/components';

interface Props {
  checked: boolean;
  genesis: string | undefined;
  text: string | undefined;
  onSelect: (newSelect: string) => void;
}

function ChainToggle ({ checked, genesis, onSelect, text }: Props) {
  const handleSelect = useCallback((event: ChangeEvent<HTMLInputElement>, _checked: boolean) => {
    const selected = event.target.value;

    onSelect(selected);
  }, [onSelect]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between'>
      <Stack alignItems='center' direction='row' gap='8px'>
        <ChainLogo genesisHash={genesis} size={24} />
        <Typography color={checked ? 'text.primary' : 'primary.main'} ml='8px' variant='B-1'>
          {text}
        </Typography>
      </Stack>
      <MySwitch
        checked={checked}
        onChange={handleSelect}
        value={genesis}
      />
    </Stack>
  );
}

export default memo(ChainToggle);
