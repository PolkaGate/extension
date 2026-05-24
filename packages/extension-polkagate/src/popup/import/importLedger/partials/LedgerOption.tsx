// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Box, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

interface Props {
  Icon: Icon;
  label: string;
  mode: number | undefined;
  onClick: () => void;
  setHoveredMode: React.Dispatch<React.SetStateAction<number | undefined>>
}

function LedgerOption({ Icon, label, mode, onClick, setHoveredMode }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [hovered, setHovered] = useState<boolean>(false);
  const [colorChangeActive, setColorChangeActive] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => {
    setHovered(true);
    setColorChangeActive(true);
    setHoveredMode(mode);
    setTimeout(() => {
      setColorChangeActive(false);
    }, 400);
  }, [mode, setHoveredMode]);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    setHoveredMode(undefined);
  }, [setHoveredMode]);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        background: isDark ? (hovered ? '#2D1E4A' : '#2D1E4A8C') : (hovered ? '#F3F6FD' : '#FFFFFF'),
        border: isDark ? 'none' : '1px solid #DDE3F4',
        borderRadius: '18px',
        boxShadow: isDark ? 'none' : '0 10px 24px rgba(133, 140, 176, 0.12)',
        cursor: 'pointer',
        height: '138px',
        p: '15px 15px',
        position: 'relative',
        transition: 'all 250ms ease-out',
        width: '191px'
      }}
    >
      <Icon color={hovered ? '#AA83DC' : isDark ? '#BEAAD8' : '#7A69A8'} size='36' variant='TwoTone' />
      <Typography bottom={0} color={colorChangeActive ? (isDark ? '#BEAAD8' : '#7A69A8') : isDark ? '#EAEBF1' : 'text.primary'} display='block' p='0 15px 15px 0' position='absolute' textAlign='left' variant='B-2'>
        {label}
      </Typography>
    </Box>
  );
}

export default React.memo(LedgerOption);
