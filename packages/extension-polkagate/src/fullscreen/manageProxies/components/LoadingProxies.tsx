// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, Stack } from '@mui/material';
import React, { } from 'react';

import { logoWhiteTransparent } from '@polkadot/extension-polkagate/src/assets/logos/index';
import { MySkeleton } from '@polkadot/extension-polkagate/src/components';
import { useIsDark } from '@polkadot/extension-polkagate/src/hooks/index';

interface Props {
  length?: number;
}

export default function LoadingProxies ({ length = 2 }: Props): React.ReactElement {
  const isDark = useIsDark();

  return (
    <>
      {
        Array.from({ length }).map((_, index) => (
          <Grid
            alignItems='center'
            columnGap='15px' container item key={index} sx={{
              background: '#05091C',
              bgcolor: '#05091C',
              borderRadius: '14px',
              height: '90px',
              maxWidth: '400px',
              minWidth: '379px',
              p: '0 5px 0 20px',
              position: 'relative',
              width: 'fit-content'
            }}
          >
            <MySkeleton
              bgcolor={isDark ? '#946CC840' : '#99A1C440'}
              height ={18}
              style={{ borderRadius: '6px', position: 'absolute', right: '8px', top: '8px' }}
              width={18}
            />
            <Avatar
              src={logoWhiteTransparent as string}
              sx={{
                '& img': {
                  filter: isDark ? 'brightness(0.3)' : 'brightness(0.9)'
                },
                bgcolor: isDark ? '#292247' : '#CFD5F0',
                borderRadius: '999px',
                height: '36px',
                p: '4px',
                width: '36px'
              }}
            />
            <Stack direction='column' rowGap='4px'>
              <Stack alignItems='center' columnGap='8px' direction='row'>
                <MySkeleton
                  bgcolor={isDark ? '#946CC840' : '#99A1C440'}
                  width={144}
                />
              </Stack>
              <Stack columnGap='5px' direction='row'>
                <MySkeleton
                  bgcolor={isDark ? '#946CC826' : '#99A1C440'}
                  width={74}
                />
                <MySkeleton
                  bgcolor={isDark ? '#946CC826' : '#99A1C440'}
                  width={74}
                />
              </Stack>
            </Stack>
          </Grid>
        ))
      } </>
  );
}
