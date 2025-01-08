// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, type SxProps, type Theme, Typography } from '@mui/material';
import { ArrowCircleLeft } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

interface DynamicBackButtonProps {
  text: string;
  onClick: () => void;
  style?: SxProps<Theme>;
}

function BackWithLabel ({ onClick, style, text }: DynamicBackButtonProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  return (
    <Box
      alignItems='center'
      display='flex'
      onClick={onClick}
      onMouseEnter={toggleHovered}
      onMouseLeave={toggleHovered}
      sx={{ columnGap: '6px', cursor: 'pointer', pl: '15px', py: '8px', width: 'fit-content', ...style }}
    >
      <ArrowCircleLeft color='#FF4FB9' size='24' variant={hovered ? 'Bold' : 'Bulk'} />
      <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
        {text}
      </Typography>
    </Box>
  );
}

export default BackWithLabel;
