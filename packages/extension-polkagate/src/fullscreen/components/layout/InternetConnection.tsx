// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid } from '@mui/material';
import React from 'react';

import { MyTooltip } from '@polkadot/extension-polkagate/src/components/index';
import Connection from '@polkadot/extension-polkagate/src/components/SVG/Connection';

import { useIsDark, useTranslation } from '../../../hooks';

function InternetConnection(): React.ReactElement {
  const isDark = useIsDark();
  const { t } = useTranslation();

  return (
    <Grid
      alignItems='center' container item justifyContent='center'
      sx={{
        alignItems: 'center',
        backdropFilter: 'blur(20px)',
        background: isDark ? '#2D1E4A80' : '#FFFFFF',
        border: isDark ? 'none' : '1px solid #DDE3F4',
        borderRadius: '12px',
        boxShadow: isDark ? '0px 0px 24px 8px #4E2B7259 inset' : '0px 8px 22px rgba(133, 140, 176, 0.12)',
        cursor: 'pointer',
        height: '32px',
        width: '32px'
      }}
    >
      <Grid
        alignItems='center' container item justifyContent='center'
        sx={{
          ':hover': { background: isDark ? '#674394' : '#F3F6FD' },
          alignItems: 'center',
          backdropFilter: 'blur(20px)',
          background: isDark ? '#2D1E4A80' : '#FFFFFF8C',
          borderRadius: '12px',
          boxShadow: isDark ? '0px 0px 24px 8px #4E2B7259 inset' : 'none',
          height: '28px',
          transition: 'all 250ms ease-out',
          width: '28px'
        }}
      >
        <MyTooltip
          content={t('Internet is disconnected ...')}
        >
          <Grid container item justifyContent='center' >
            <Connection />
            <Divider sx={{ bgcolor: '#FF4FB9', bottom: '13px', height: '1.5px', left: 0, opacity: 1, position: 'absolute', rotate: '45deg', transition: 'all 150ms ease-out', width: '28px' }} />
          </Grid>
        </MyTooltip>
      </Grid>
    </Grid>
  );
}

export default React.memo(InternetConnection);
