// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CheckIcon from '@mui/icons-material/Check';
import { Box, Checkbox } from '@mui/material';
import React from 'react';

export default function CustomCheckbox ({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <Checkbox
      checked={checked}
      checkedIcon={
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#596AFF',
            borderRadius: '8px',
            display: 'flex',
            height: 24,
            justifyContent: 'center',
            width: 24
          }}
        >
          <CheckIcon sx={{ color: '#fff', fontSize: 16, fontWeight: 900 }} />
        </Box>
      }
      disableRipple
      icon={
        <Box
          sx={{
            backgroundColor: '#222442',
            borderRadius: '8px',
            height: 24,
            width: 24
          }}
        />
      }
      onChange={onChange}
      sx={{
        '&.Mui-checked': {
          color: 'transparent'
        },
        height: 24,
        p: 0,
        width: 24
      }}
    />
  );
}
