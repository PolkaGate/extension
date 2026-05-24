// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '@polkadot/extension-polkagate/src/util/types';

import { Container, Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Refresh } from 'iconsax-react';
import React, { useMemo } from 'react';

import { useIsExtensionPopup } from '../../../hooks';
import { PoolIdenticon } from './PoolIdenticon';

export interface Props {
  selectedPool: PoolInfo | undefined
  text: string;
  style?: SxProps<Theme>;
  onClick: () => void;
}

export default function SelectedPool({ onClick, selectedPool, style, text }: Props): React.ReactElement {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const color = useMemo(() => isExtension ? theme.palette.text.highlight : '#AA83DC', [isExtension, theme.palette.text.highlight]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : '#05091C', borderRadius: '14px', display: 'flex', gap: '10px', p: '8.5px 10px', width: '100%', ...style }}>
      <PoolIdenticon
        poolInfo={selectedPool}
        size={36}
      />
      <Stack direction='column' sx={{ display: 'flex', flexDirection: 'column', width: 'calc(100% - 70px)' }}>
        <Typography color='text.primary' sx={{ maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content' }} variant='B-2'>
          {selectedPool?.metadata || ''}
        </Typography>
        <Typography color={color} variant='B-4' width='fit-content'>
          {text}
        </Typography>
      </Stack>
      <Grid container onClick={onClick} sx={{ bgcolor: '#1C1D3A', borderRadius: '6px', cursor: 'pointer', p: '4px', width: 'fit-content' }}>
        <Refresh color={color} size='18' />
      </Grid>
    </Container>
  );
}
