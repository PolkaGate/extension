// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, type SxProps } from '@mui/material';
import React from 'react';

import { useIsDark, useIsExtensionPopup } from '../hooks';

interface GradientBorderProps {
  type?: 'pinkish' | 'pastel';
  style?: SxProps;
}

function GradientBorder ({ style, type }: GradientBorderProps): React.ReactElement {
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();

  return (
    <Box sx={{
      background: type === 'pinkish'
        ? isDark
          ? isExtension
            ? 'linear-gradient(90deg, transparent 0%, #E74FCF 50.06%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, #E74FCF 50.06%, transparent 100%)'
          : 'linear-gradient(90deg, transparent 0%, #CFB1FF 50.06%, transparent 100%)'
        : 'linear-gradient(178deg, transparent 22.53%, #ECB4FF 47.68%, #ECB4FF 62.78%, transparent 72.53%)',
      height: '2px',
      justifySelf: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      width: '100%',
      zIndex: 2,
      ...style
    }}
    />
  );
}

export default GradientBorder;
