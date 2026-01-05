// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { toTitleCase } from '@polkadot/extension-polkagate/src/util';

import { ChainLogo, Identity2 } from '../../../components';

interface Props {
  address: string | undefined;
  chainName: string | undefined;
  genesisHash: string | undefined;
  label: string;
}

export default function FromToBox ({ address, chainName, genesisHash, label }: Props): React.ReactElement {
  return (
    <Stack direction='column' justifyContent='space-between' sx={{ height: 'fit-content', width: '45%' }}>
      <Stack columnGap='5px' direction='row' justifyContent='start' sx={{ mt: '3px' }}>
        <Typography color='primary.main' sx={{ bgcolor: '#1B133C', border: '1px solid #2D1E4A', borderRadius: '6px', height: 'fit-content', px: '7px', textAlign: 'left' }} variant='B-1'>
          {label}
        </Typography>
        <Stack alignItems='center' columnGap='3px' direction='row' justifyContent='start' sx={{ bgcolor: '#1B133C', border: '1px solid #2D1E4A', borderRadius: '6px', height: 'fit-content', px: '7px', textAlign: 'left' }}>
          <ChainLogo chainName={chainName} size={14} />
          <Typography color='primary.main' variant='B-1'>
            {toTitleCase(chainName)}
          </Typography>
        </Stack>
      </Stack>
      <Identity2
        address={address}
        addressStyle={{ color: '#AA83DC', paddingTop: '4px', variant: 'B-1' }}
        charsCount={12}
        genesisHash={genesisHash ?? ''}
        identiconSize={48}
        identiconStyle={{ marginRight: '7px' }}
        nameStyle={{ color: 'text.primary', maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        style={{ marginTop: '15px', maxWidth: '80%', variant: 'B-3' }}
        withShortAddress
      />
    </Stack>
  );
}
