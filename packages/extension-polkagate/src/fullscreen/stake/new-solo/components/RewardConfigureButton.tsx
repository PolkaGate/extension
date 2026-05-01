// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import { Setting } from 'iconsax-react';
import React, { useRef } from 'react';

import { MyTooltip } from '../../../../components';
import { useTranslation } from '../../../../hooks';

export default function RewardConfigureButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const refContainer = useRef(null);

  return (
    <MyTooltip content={t('Configure Reward Destination')} placement='bottom'>
      <Grid
        container
        item
        onClick={onClick}
        ref={refContainer}
        sx={{
          ':hover': {
            background: isDark ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#745E9F',
            borderColor: isDark ? '#1B133C' : '#745E9F',
            color: '#FFFFFF'
          },
          alignItems: 'center',
          background: isDark ? '#05091C' : '#FFFFFF',
          border: isDark ? '2px solid #1B133C' : '1px solid #DDE3F4',
          borderRadius: '12px',
          boxShadow: isDark ? 'none' : '0 6px 16px rgba(133, 140, 176, 0.12)',
          color: isDark ? '#AA83DC' : '#745E9F',
          cursor: 'pointer',
          height: '40px',
          justifyContent: 'center',
          width: '40px'
        }}
      >
        <Setting color='currentColor' size='20' variant='Bulk' />
      </Grid>
    </MyTooltip>
  );
}
