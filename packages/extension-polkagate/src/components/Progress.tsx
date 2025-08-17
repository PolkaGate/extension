// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { BeatLoader } from 'react-spinners';

import { useIsBlueish } from '../hooks';

interface Props {
  direction?: 'column' | 'row'
  fontSize?: number;
  titlePaddingTop?: number;
  titlePaddingLeft?: number;
  title?: string;
  pt?: number | string;
  size?: number;
  gridSize?: number;
  type?: 'circle' | 'cubes' | 'grid' | 'wordpress' | 'beatLoader';
  withEllipsis?: boolean;
  style?: React.CSSProperties;
}

function Progress ({ direction = 'column', size = 15, style = {}, title, type = 'beatLoader', withEllipsis = false }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const isBlueish = useIsBlueish();

  return (
    <Stack direction={direction} sx={{ alignItems: 'center', gap: '40px', justifyContent: 'center', mt: '50px', width: '100%', ...style }}>
      {type === 'beatLoader' &&
        <BeatLoader color={isBlueish ? theme.palette.text.highlight : theme.palette.primary.main} cssOverride={{ alignSelf: 'center' }} loading size={size} speedMultiplier={0.6} />
      }
      {title &&
        <Typography color='text.primary' variant='B-3'>
          {title}{withEllipsis && ' ...'}
        </Typography>
      }
    </Stack>
  );
}

export default React.memo(Progress);
