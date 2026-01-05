// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, useTheme } from '@mui/material';
import React from 'react';

const Drawer = ({ length }: { length: number }) => {
  const theme = useTheme();
  const colorD1 = theme.palette.mode === 'dark' ? '#24234DCC' : '#CFD5F0';
  const colorD2 = theme.palette.mode === 'dark' ? '#26255773' : '#DFE4FA';

  return (
    <Container disableGutters sx={{ display: 'flex', height: length === 0 ? 0 : length > 1 ? '18px' : '9px', justifyContent: 'center', overflow: 'hidden', position: 'relative', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '100%' }}>
      <div style={{ background: colorD1, borderRadius: '14px', height: length ? '50px' : 0, position: 'absolute', top: '-41px', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '90%', zIndex: 1 }} />
      <div style={{ background: colorD2, borderRadius: '14px', bottom: 0, height: length > 1 ? '50px' : 0, position: 'absolute', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '80%' }} />
    </Container>
  );
};

export default React.memo(Drawer);
