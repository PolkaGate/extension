// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TextField } from '@mui/material';
import * as React from 'react';

interface Props {
  value?: unknown,
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined
}

export default function Field ({ onChange, value }: Props) {
  return (
    <TextField
      inputProps={{ style: { paddingLeft: '15px', textAlign: 'left' } }}
      onChange={onChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          background: '#1B133C',
          border: '1px solid #BEAAD833',
          borderRadius: '12px',
          height: '44px',
          mt: '10px',
          transition: 'background 0.3s ease-in-out, border-color 0.3s ease-in-out',
          width: '80px',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BEAAD833'
          },
          '&:hover': {
            background: '#2D1E4A'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#AA83DC' // Change border color on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#AA83DC'
          }
        },
        '& .MuiInputBase-input': {
          color: '#BEAAD8',
          fontFamily: 'Inter',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '-0.6px',
          padding: 0,
          textAlign: 'center'
        }
      }}
      value={value}
      variant='outlined'
    />
  );
}
