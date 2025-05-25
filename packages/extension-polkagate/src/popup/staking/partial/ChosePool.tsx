// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { Refresh } from 'iconsax-react';
import React from 'react';

import { PolkaGateIdenticon } from '../../../style';

export interface Props {
  poolStashAddress: string | undefined;
  poolName: string | undefined;
  text: string;
  style?: SxProps<Theme>;
  onClick: () => void;
}

export default function ChosePool ({ onClick, poolName, poolStashAddress, style, text }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#110F2A', borderRadius: '14px', display: 'flex', gap: '10px', p: '8.5px 10px', width: '100%', ...style }}>
      <PolkaGateIdenticon
        address={poolStashAddress ?? ''}
        size={36}
      />
      <Stack direction='column' sx={{ display: 'flex', flexDirection: 'column', width: 'calc(100% - 70px)' }}>
        <Typography color='text.primary' sx={{ maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content' }} variant='B-2'>
          {poolName}
        </Typography>
        <Typography color='text.highlight' variant='B-4' width='fit-content'>
          {text}
        </Typography>
      </Stack>
      <Grid container onClick={onClick} sx={{ bgcolor: '#1C1D3A', borderRadius: '6px', cursor: 'pointer', p: '4px', width: 'fit-content' }}>
        <Refresh color={theme.palette.text.highlight} size='18' />
      </Grid>
    </Container>
  );
}
