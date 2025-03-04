// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PositionInfo } from '../../../util/types';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { ChainLogo } from '../../../components/index';
import { useTranslation } from '../../../hooks';

interface Props {
  selectedPosition: PositionInfo | undefined;
}

function Title ({ selectedPosition }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ zIndex: 1 }}>
      <Stack direction='row'>
        <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
          {t('Earn up to')}
        </Typography>
        <Typography color='#82FFA5' textTransform='uppercase' variant='H-3' sx={{ px: '2px' }}>
          {`${selectedPosition?.rate || 0}%`}
        </Typography>
        <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
          {t('on your')}
        </Typography>
      </Stack>
      <Stack direction='row' alignItems='center' sx={{ mt: '-10px' }}>
        <Typography color='text.primary' textTransform='uppercase' variant='H-3' sx={{ mr: '4px' }}>
          {selectedPosition?.tokenSymbol}
        </Typography>
        <span style={{ marginBottom: '5px' }}>
          <ChainLogo genesisHash={selectedPosition?.genesisHash} size={24} />
        </span>
        <Typography color='text.primary' textTransform='uppercase' variant='H-3' sx={{ ml: '2px' }}>
          {t('tokens per year')}
        </Typography>
      </Stack>
    </div>
  );
}

export default Title;
