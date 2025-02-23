// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import * as React from 'react';

import useIsDark from '../../../../hooks/useIsDark';

interface Props {
  options: { text: string, value: string | number }[];
  value: string | undefined;
  onChange: (event: SelectChangeEvent) => any;
}

export default function MySelect ({ onChange, options, value }: Props) {
  const isDark = useIsDark();
  const textStyle = { color: isDark ? '#AA83DC' : '#291443', fontFamily: 'Inter', fontSize: '14px', fontWeight: 600 };

  return (
    <Select
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: isDark ? '#05091C' : '#D9E0F5',
            border: '2px solid #1B133C',
            borderRadius: '8px'
          }
        }
      }}
      onChange={onChange}
      sx={{
        background: isDark ? '#1B133C' : '#EFF1F9',
        border: '1px solid #BEAAD833',
        borderRadius: '12px',
        height: '44px',
        mt: '10px',
        transition: 'background 0.3s ease-in-out, border-color 0.3s ease-in-out',
        width: '80px',

        '&:hover': {
          background: isDark ? '#2D1E4A' : '#D9E0F5'
        },

        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#BEAAD833'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#AA83DC'
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#AA83DC'
        },

        '& .MuiSelect-icon': {
          color: isDark ? '#AA83DC' : '#745D8B'
        },

        '&.Mui-focused .MuiSelect-icon': {
          color: '#FF4FB9'
        },

        '& .MuiInputBase-input': {
          ...textStyle,
          letterSpacing: '-0.6px',
          padding: 0,
          textAlign: 'center'
        },

        '&.Mui-focused .MuiInputBase-input': {
          color: isDark ? '#FFFFFF' : '#BEAAD833'
        }
      }}
      value={String(value)}
    >
      {options.map(({ text, value }) => (
        <MenuItem
          key={value}
          sx={{
            ...textStyle,
            color: 'text.primary',
            minHeight: '40px',
            py: 0,

            '&.Mui-selected': {
              background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
              borderRadius: '8px',
              color: '#FFFFFF'
            },

            '&:hover': {
              backgroundColor: '#6743944D',
              borderRadius: '8px',
              color: '#FFFFFF'
            }
          }}
          value={value || options[0]?.value}
        >
          {text}
        </MenuItem>
      ))}
    </Select>
  );
}
