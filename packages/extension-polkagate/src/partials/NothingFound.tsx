// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import { emptyState } from '../assets/animations';
import { useIsBlueish, useTranslation } from '../hooks';

interface Props {
  text?: string;
  show: boolean;
  style?: SxProps<Theme>;
  size?: number;
}

function NothingFound ({ show = false, size = 150, style = {}, text }: Props) {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  if (!show) {
    return null;
  }

  return (
    <Stack direction='column' sx={{ alignItems: 'center', justifyContent: 'center', py: '20px', width: '100%', ...style }}>
      <DotLottieReact autoplay loop src={emptyState as string} style={{ height: size, width: size }} />
      <Typography color={isBlueish ? 'text.highlight' : 'text.primary'} variant='B-2'>
        {text ?? t('Nothing Found')}
      </Typography>
    </Stack>
  );
}

export default NothingFound;
