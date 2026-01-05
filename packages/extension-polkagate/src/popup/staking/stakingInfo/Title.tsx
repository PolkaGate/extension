// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PositionInfo } from '../../../util/types';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { mapHubToRelay } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { ChainLogo } from '../../../components/index';

interface Props {
  selectedPosition: PositionInfo | undefined;
}

function Title({ selectedPosition }: Props): React.ReactElement {
  const genesisHash = mapHubToRelay(selectedPosition?.genesisHash);

  return (
    <div style={{ zIndex: 1 }}>
      <Stack direction='row'>
        <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
          {'Earn up to'}
        </Typography>
        <Typography color='#82FFA5' sx={{ px: '2px' }} textTransform='uppercase' variant='H-3'>
          {`${selectedPosition?.rate || 0}%`}
        </Typography>
        <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
          {'on your'}
        </Typography>
      </Stack>
      <Stack alignItems='center' direction='row' sx={{ mt: '-10px' }}>
        <Typography color='text.primary' sx={{ mr: '4px' }} textTransform='uppercase' variant='H-3'>
          {selectedPosition?.tokenSymbol}
        </Typography>
        <span style={{ marginBottom: '5px' }}>
          <ChainLogo genesisHash={genesisHash} size={24} />
        </span>
        <Typography color='text.primary' sx={{ ml: '2px' }} textTransform='uppercase' variant='H-3'>
          {'tokens per year'}
        </Typography>
      </Stack>
    </div>
  );
}

export default Title;
