// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { ArrowRight3, Edit } from 'iconsax-react';
import React from 'react';

interface Props {
  flip?: boolean;
  style?: React.CSSProperties | undefined;
  type?: 'Edit' | 'Arrow';
  onClick?: () => void
}

export default function OpenerButton ({ flip, onClick, style = {}, type = 'Edit' }: Props): React.ReactElement {
  const Icon = type === 'Arrow' ? ArrowRight3 : Edit;
  const variant = type === 'Arrow' ? 'Bold' : 'Bulk';

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
        height: '40px',
        justifyContent: 'center',
        transition: 'all 250ms ease-out',
        width: '40px',
        ...style
      }}
    >
      <Icon
        className='edit-icon'
        color='currentColor'
        size='24px'
        style={{
          transform: flip ? 'scaleY(-1)' : undefined
        }}
        variant={variant}
      />
    </Box>
  );
}
