// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import { Setting } from 'iconsax-react';
import React, { useRef } from 'react';

import { MyTooltip } from '../../../../components';
import { useIsHovered, useTranslation } from '../../../../hooks';

export default function RewardConfigureButton ({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  const refContainer = useRef(null);

  const isHovered = useIsHovered(refContainer);

  return (
    <MyTooltip content={t('Configure Reward Destination')} placement='bottom'>
      <Grid
        container
        item
        onClick={onClick}
        ref={refContainer}
        sx={{
          ':hover': { background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' },
          alignItems: 'center',
          background: '#05091C',
          border: '2px solid #1B133C',
          borderRadius: '12px',
          cursor: 'pointer',
          height: '40px',
          justifyContent: 'center',
          width: '40px'
        }}
      >
        <Setting color={isHovered ? '#EAEBF1' : '#AA83DC'} size='20' variant='Bulk' />
      </Grid>
    </MyTooltip>
  );
}
