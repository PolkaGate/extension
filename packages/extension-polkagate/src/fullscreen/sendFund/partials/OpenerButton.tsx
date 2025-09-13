// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { Edit } from 'iconsax-react';
import React from 'react';

interface Props {
  flip?: boolean;
  style?: React.CSSProperties | undefined;
  onClick?: () => void
}

export default function OpenerButton ({ flip, onClick, style = {} }: Props): React.ReactElement {
  return (
    <Box
      onClick={onClick}
      sx={{
        '&:hover': {
          '& .edit-icon': {
            color: 'inherit'
          },
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          color: '#EAEBF1',
          cursor: 'pointer'
        },
        alignItems: 'center',
        border: '2px solid #1B133C',
        borderRadius: '12px',
        color: '#AA83DC',
        display: 'flex',
        height: '36px',
        justifyContent: 'center',
        transition: 'all 250ms ease-out',
        width: '36px',
        ...style
      }}
    >
      <Edit
        className='edit-icon'
        color='currentColor'
        size='24px'
        style={{
          transform: flip ? 'scaleY(-1)' : undefined
        }}
        variant='Bulk'
      />
    </Box>
  );
}
