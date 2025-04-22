// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid } from '@mui/material';
import { Notification } from 'iconsax-react';
import React, { } from 'react';

import { noop } from '@polkadot/util';

function Notifications (): React.ReactElement {
  return (
    <Grid
      alignItems='center'
      container
      item
      justifyContent='center'
      onClick={noop}
      sx={{
        '&:hover': {
          background: '#674394'
        },
        '&:hover .notification-dot': {
          borderColor: '#674394'
        },

        backdropFilter: 'blur(20px)',
        background: '#2D1E4A80',
        borderRadius: '12px',
        boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
        cursor: 'pointer',
        height: '32px',
        position: 'relative',
        transition: 'all 250ms ease-out',
        width: '32px'

      }}
    >
      <Box
        className='notification-dot'
        sx={{
          bgcolor: '#FF4FB9',
          border: '1.5px solid #2D1E4A',
          borderRadius: '50%',
          height: '9px',
          position: 'absolute',
          right: '5px',
          top: '5px',
          transition: 'border-color 200ms ease',
          width: '9px',
          zIndex: 1
        }}
      />
      <Notification
        color='#AA83DC'
        size='20'
        style={{ cursor: 'pointer', transform: 'rotate(30deg)' }}
        variant='Bold'
      />
    </Grid>
  );
}

export default React.memo(Notifications);
