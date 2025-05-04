// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, type SxProps, type Theme } from '@mui/material';
import { ArrowCircleLeft } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

interface DynamicBackButtonProps {
  onClick: () => void;
  style?: SxProps<Theme>;
}

function BackButton ({ onClick, style }: DynamicBackButtonProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  return (
    <Box
      alignItems='center'
      display='flex'
      onClick={onClick}
      onMouseEnter={toggleHovered}
      onMouseLeave={toggleHovered}
      sx={{ cursor: 'pointer', width: 'fit-content', ...style }}
    >
      <ArrowCircleLeft color='#FF4FB9' size='24' variant={hovered ? 'Bold' : 'Bulk'} />
    </Box>
  );
}

export default BackButton;
