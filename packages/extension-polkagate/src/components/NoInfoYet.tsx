// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import { notFound } from '@polkadot/extension-polkagate/src/assets/animations';
import { useIsBlueish, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

interface Props {
  text?: string;
  show: boolean;
  style?: SxProps<Theme>;
  size?: number;
}

function NoInfoYet ({ show = false, size = 150, style = {}, text }: Props) {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  if (!show) {
    return null;
  }

  return (
    <Stack direction='column' sx={{ alignItems: 'center', justifyContent: 'center', py: '20px', width: '100%', ...style }}>
      <DotLottieReact autoplay loop src={notFound as string} style={{ height: size, width: size }} />
      <Typography color={isBlueish ? 'text.highlight' : 'label.primary'} variant='B-2'>
        {text ?? t('No information yet')}
      </Typography>
    </Stack>
  );
}

export default React.memo(NoInfoYet);
