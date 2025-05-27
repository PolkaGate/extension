// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Skeleton, Stack } from '@mui/material';
import React, { } from 'react';

import { logoWhiteTransparent } from '@polkadot/extension-polkagate/src/assets/logos/index';
import { useIsDark } from '@polkadot/extension-polkagate/src/hooks/index';

interface Props {
  length?: number;
}

function MySkeleton ({ bgcolor, width }: { bgcolor: string, width: number }): React.ReactElement {
  return (<Skeleton
    animation='wave'
    height={12}
    sx={{ bgcolor, borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: `${width}px` }}
  />);
}

export default function LoadingProxies ({ length = 2 }: Props): React.ReactElement {
  const isDark = useIsDark();

  return (
    <>{
      Array.from({ length }).map((index) => (
        <Grid
          alignItems='center'
          columnGap='15px' container item key={index as number} sx={{
            background: '#05091C',
            bgcolor: '#05091C',
            border: '1px solid #2D1E4A',
            borderRadius: '14px',
            height: '90px',
            maxWidth: '400px',
            minWidth: '379px',
            p: '0 5px 0 20px',
            position: 'relative',
            width: 'fit-content'
          }}
        >
          <Box
            component='img'
            src={logoWhiteTransparent as string}
            sx={{
              bgcolor: isDark ? '#292247' : '#CFD5F0',
              borderRadius: '999px',
              filter: isDark ? 'brightness(0.4)' : 'brightness(0.9)',
              height: '36px',
              p: '4px',
              width: '36px'
            }}
          />
          <Stack direction='column' rowGap='4px'>
            <Stack alignItems='center' columnGap='8px' direction='row'>
              <MySkeleton
                bgcolor={isDark ? '#946CC840' : '#99A1C440'}
                width={100}
              />
              <MySkeleton
                bgcolor={isDark ? '#BEAAD826' : '#99A1C440'}
                width={25}
              />
            </Stack>
            <Stack columnGap='5px' direction='row'>
              <MySkeleton
                bgcolor={isDark ? '#946CC840' : '#99A1C440'}
                width={120}
              />
              <MySkeleton
                bgcolor={isDark ? '#946CC840' : '#99A1C440'}
                width={160}
              />
            </Stack>
          </Stack>
        </Grid>
      ))
    } </>
  );
}
