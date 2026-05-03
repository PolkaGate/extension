// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Grid, Stack } from '@mui/material';
import React from 'react';

import { logoWhiteTransparent } from '@polkadot/extension-polkagate/src/assets/logos/index';
import { MySkeleton } from '@polkadot/extension-polkagate/src/components';
import { useIsDark } from '@polkadot/extension-polkagate/src/hooks/index';

interface Props {
  length?: number;
}

export default function LoadingProxies({ length = 2 }: Props): React.ReactElement {
  const isDark = useIsDark();
  const cardBg = isDark ? '#05091C' : '#FFFFFF';
  const cardBorder = isDark ? 'none' : '1px solid #E3E8F7';
  const cardShadow = isDark ? 'none' : '0 10px 22px rgba(106, 116, 156, 0.12)';
  const skeletonBg = isDark ? '#946CC840' : '#D9DFF0';
  const skeletonBgLight = isDark ? '#946CC826' : '#E7EAF5';

  return (
    <>
      {
        Array.from({ length }).map((_, index) => (
          <Grid
            alignItems='center'
            columnGap='15px' container item key={index} sx={{
              background: cardBg,
              bgcolor: cardBg,
              border: cardBorder,
              borderRadius: '14px',
              boxShadow: cardShadow,
              height: '90px',
              maxWidth: '400px',
              minWidth: '379px',
              p: '0 5px 0 20px',
              position: 'relative',
              width: 'fit-content'
            }}
          >
            <MySkeleton
              bgcolor={skeletonBg}
              height={18}
              style={{ borderRadius: '6px', position: 'absolute', right: '8px', top: '8px' }}
              width={18}
            />
            <Avatar
              src={logoWhiteTransparent as string}
              sx={{
                '& img': {
                  filter: isDark ? 'brightness(0.3)' : 'none'
                },
                bgcolor: isDark ? '#292247' : '#EEF2FF',
                borderRadius: '999px',
                height: '36px',
                p: '4px',
                width: '36px'
              }}
            />
            <Stack direction='column' rowGap='4px'>
              <Stack alignItems='center' columnGap='8px' direction='row'>
                <MySkeleton
                  bgcolor={skeletonBg}
                  width={144}
                />
              </Stack>
              <Stack columnGap='5px' direction='row'>
                <MySkeleton
                  bgcolor={skeletonBgLight}
                  width={74}
                />
                <MySkeleton
                  bgcolor={skeletonBgLight}
                  width={74}
                />
              </Stack>
            </Stack>
          </Grid>
        ))
      } </>
  );
}
