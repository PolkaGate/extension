// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, type SxProps, type Theme } from '@mui/material';
import { ArrowCircleLeft } from 'iconsax-react';
import React, { useRef } from 'react';

import { useIsHovered } from '../../hooks';

interface DynamicBackButtonProps {
  onClick: () => void;
  style?: SxProps<Theme>;
}

function BackButton ({ onClick, style }: DynamicBackButtonProps) {
  const refContainer = useRef(null);
  const hovered = useIsHovered(refContainer);

  return (
    <Box
      alignItems='center'
      display='flex'
      onClick={onClick}
      ref={refContainer}
      sx={{ cursor: 'pointer', width: 'fit-content', ...style }}
    >
      <ArrowCircleLeft color='#FF4FB9' size='24' variant={hovered ? 'Bold' : 'Bulk'} />
    </Box>
  );
}

export default BackButton;
