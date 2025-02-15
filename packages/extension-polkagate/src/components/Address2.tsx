// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Variant } from '@mui/material/styles/createTypography';

import { Stack, type SxProps, Typography } from '@mui/material';
import React, { } from 'react';

import { useTranslation } from '../hooks';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { ShortAddress } from '.';

interface Props {
  address: string;
  name?: string;
  style?: SxProps;
  variant?: Variant;
  showAddress?: boolean;
}

function Address2 ({ address, name, showAddress, style = {}, variant }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Stack alignItems='center' direction='row' sx={{ bgcolor: '#05091C', borderRadius: '18px', columnGap: '10px', height: showAddress ? '71px' : '52px', mt: '15px', pl: '10px', width: '100%', ...style }}>
      <PolkaGateIdenticon
        address={address}
        size={24}
      />
      <Stack justifyContent='flex-start' sx={{ overflowX: 'scroll', width: '100%' }}>
        <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
          {name || t('Unknown')}
        </Typography>
        {showAddress &&
          <ShortAddress
            address={address}
            charsCount={5}
            showCopy
            style={{ color: 'text.secondary', justifyContent: 'flex-start' }}
            variant={(variant || 'B-4') as Variant}
          />}
      </Stack>
    </Stack>

  );
}

export default React.memo(Address2);
