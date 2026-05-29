// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import React, { memo } from 'react';

function GraphLoading({ isDark }: { isDark: boolean }) {
  const nodeBg = isDark ? '#AA83DC33' : '#DDE3F4';
  const lineBg = isDark ? '#AA83DC40' : '#C9D2EE';
  const centerBg = isDark ? '#FF4FB966' : '#FF4FB933';

  const lineStyle = {
    bgcolor: lineBg,
    borderRadius: '999px',
    height: '2px',
    opacity: 0.55,
    position: 'absolute',
    transformOrigin: 'left center'
  };
  const nodeStyle = {
    bgcolor: nodeBg,
    border: '2px solid',
    borderColor: isDark ? '#BEAAD833' : '#FFFFFF',
    borderRadius: '999px',
    boxShadow: isDark ? '0 0 18px rgba(170, 131, 220, 0.16)' : '0 8px 24px rgba(120, 130, 180, 0.18)',
    height: '38px',
    opacity: 0.85,
    position: 'absolute',
    width: '38px'
  };

  return (
    <Box sx={{ height: '100%', overflow: 'hidden', position: 'relative', width: '100%' }}>
      <Box sx={{ ...lineStyle, left: '40%', top: '50%', transform: 'rotate(-37deg)', width: '220px' }} />
      <Box sx={{ ...lineStyle, left: '39%', top: '50%', transform: 'rotate(34deg)', width: '185px' }} />
      <Box sx={{ ...lineStyle, left: '39%', top: '50%', transform: 'rotate(146deg)', width: '210px' }} />
      <Box sx={{ ...lineStyle, left: '39%', top: '50%', transform: 'rotate(-142deg)', width: '160px' }} />
      <Box sx={{ ...nodeStyle, left: '22%', top: '29%' }} />
      <Box sx={{ ...nodeStyle, left: '60%', top: '29%' }} />
      <Box sx={{ ...nodeStyle, left: '58%', top: '66%' }} />
      <Box sx={{ ...nodeStyle, left: '21%', top: '66%' }} />
      <Box sx={{ ...nodeStyle, bgcolor: centerBg, borderColor: isDark ? '#EAEBF1' : '#FFFFFF', height: '60px', left: '38%', top: '46%', width: '60px' }} />
    </Box>
  );
}

export default memo(GraphLoading);
