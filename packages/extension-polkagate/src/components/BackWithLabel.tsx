// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Box, type SxProps, type Theme, Typography } from '@mui/material';
import { ArrowCircleLeft } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '../hooks';

interface DynamicBackButtonProps {
  text?: string;
  content?: React.ReactNode;
  onClick: () => void;
  style?: SxProps<Theme>;
}

function BackWithLabel({ content, onClick, style, text }: DynamicBackButtonProps) {
  const { t } = useTranslation();

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  const renderContent = useMemo(() => {
    if (content) {
      return content;
    } else {
      return (
        <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
          {text ?? t('Back')}
        </Typography>
      );
    }
  }, [content, t, text]);

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
      {renderContent}
    </Box>
  );
}

export default BackWithLabel;
