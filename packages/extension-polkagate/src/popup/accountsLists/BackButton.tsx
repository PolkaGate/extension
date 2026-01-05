// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, type SxProps, type Theme } from '@mui/material';
import { ArrowCircleLeft } from 'iconsax-react';
import React from 'react';

import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';

interface DynamicBackButtonProps {
  onClick: () => void;
  style?: SxProps<Theme>;
}

function BackButton ({ onClick, style }: DynamicBackButtonProps) {
  const { isHovered, ref } = useIsHovered();

  return (
    <Box
      alignItems='center'
      display='flex'
      onClick={onClick}
      ref={ref}
      sx={{ cursor: 'pointer', width: 'fit-content', ...style }}
    >
      <ArrowCircleLeft color='#FF4FB9' size='24' variant={isHovered ? 'Bold' : 'Bulk'} />
    </Box>
  );
}

export default BackButton;
