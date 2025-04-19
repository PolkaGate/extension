// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import React, { useState } from 'react';

interface Props {
  Icon: Icon;
  text?: string;
  style?: React.CSSProperties;
}

function MenuButton ({ Icon, style = { marginBottom: '8px' }, text }: Props): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  return (
    <Stack
      alignItems='center'
      direction='row'
      justifyContent='start'
      sx={{
        borderRadius: '16px',
        cursor: 'pointer',
        paddingLeft: '30px',
        '&:hover': {
          backdropFilter: 'blur(20px)',
          background: '#2D1E4A80',
          boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
          transition: 'all 250ms ease-out'
        },
        height: '44px',
        width: '100%',
        ...style
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon color={hovered ? '#FF4FB9' : '#AA83DC'} size='20' variant='Bulk' />
      <Typography className='text' color={hovered ? '#FF4FB9' : '#EAEBF1'} ml='25px' variant='B-2'>
        {text}
      </Typography>
    </Stack>
  );
}

export default React.memo(MenuButton);
