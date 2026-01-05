// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';

import { Stack, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { BeatLoader, PuffLoader } from 'react-spinners';

import { useIsBlueish } from '../hooks';

interface Props {
  direction?: 'column' | 'row'
  title?: string;
  size?: number;
  type?: 'beatLoader' | 'puffLoader';
  withEllipsis?: boolean;
  style?: React.CSSProperties;
  variant?: string;
}

function Progress({ direction = 'column', size = 15, style = {}, title, type = 'beatLoader', variant = 'B-3', withEllipsis = false }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const isBlueish = useIsBlueish();

  const Loader = useMemo(() => {
    switch (type) {
      case 'puffLoader':
        return PuffLoader;
      default:
        return BeatLoader;
    }
  }, [type]);

  return (
    <Stack direction={direction} sx={{ alignItems: 'center', gap: '40px', justifyContent: 'center', mt: '50px', width: '100%', ...style }}>
      <Loader color={isBlueish ? theme.palette.text.highlight : theme.palette.primary.main} cssOverride={{ alignSelf: 'center' }} loading size={size} speedMultiplier={0.6} />
      {title &&
        <Typography color='text.primary' variant={variant as Variant}>
          {title}{withEllipsis && ' ...'}
        </Typography>
      }
    </Stack>
  );
}

export default React.memo(Progress);
