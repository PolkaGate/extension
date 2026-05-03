// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CheckIcon from '@mui/icons-material/Check';
import { Fade, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  show: boolean;
  timeout?: number;
  size?: string;
}

function GlowCheck({ show = false, size = '20px', timeout = 300 }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Fade in={show} timeout={timeout}>
      <CheckIcon sx={{ background: isDark ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : 'linear-gradient(135deg, #D83AA4 0%, #7A0FD1 100%)', borderRadius: '999px', boxShadow: isDark ? 'none' : '0 8px 18px rgba(139, 28, 190, 0.26)', color: '#FFFFFF', fontSize: size, p: '3px' }} />
    </Fade>
  );
}

export default GlowCheck;
