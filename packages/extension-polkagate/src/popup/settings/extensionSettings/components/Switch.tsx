// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { SwitchProps } from '@mui/material/Switch';

import { Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import * as React from 'react';

interface Props extends SwitchProps {
  columnGap?: string;
  label?: string;
}

const PSwitch = styled(
  ({ checked, columnGap, label, onChange, ...props }: Props) => (
    <Stack component='label' columnGap={columnGap} direction='row'>
      <Switch
        checked={checked}
        disableRipple
        focusVisibleClassName='.Mui-focusVisible'
        onChange={onChange}
        {...props}
      />
      <Typography variant='B-1'>
        {label}
      </Typography>
    </Stack>
  )
)<SwitchProps>(({ checked, theme }) => ({
  border: `2px solid ${checked ? 'transparent' : '#6743944D'}`,
  background: checked
    ? 'linear-gradient(#2D1E4A, #2D1E4A) padding-box, linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%) border-box'
    : '#2D1E4A',
  backgroundClip: checked ? 'padding-box, border-box' : 'unset',
  backgroundOrigin: 'border-box',
  borderRadius: '109.71px',
  cursor: 'pointer',
  height: '24px',
  padding: 0,
  width: '36px',
  '& .MuiSwitch-root': {
    height: '100%',
    width: '100%'
  },
  '& .MuiSwitch-switchBase': {
    alignSelf: 'anchor-center',
    left: 0,
    margin: 2,
    padding: 0,
    transition: theme.transitions.create(['transform', 'background-color', 'box-shadow'], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    '&.Mui-checked': {
      background: '#EAEBF1',
      padding: 2,
      transform: 'translateX(14px)',
      '& .MuiSwitch-thumb': {
        background: '#EAEBF1'
      },
      '& + .MuiSwitch-track': {
        backgroundColor: '#EAEBF1',
        transition: theme.transitions.create('background-color', {
          duration: 300,
          easing: 'ease-in-out'
        }),
        ...theme.applyStyles('dark', {
          backgroundColor: '#2D1E4A'
        })
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5
      }
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600]
      })
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3
      })
    }
  },
  '& .MuiSwitch-thumb': {
    background: '#674394',
    boxSizing: 'border-box',
    height: 10.29,
    width: 10.29,
    transition: theme.transitions.create(['background-color', 'transform'], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
  },
  '& .MuiSwitch-track': {
    transition: theme.transitions.create(['background-color'], {
      duration: 500
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D'
    })
  }
}));

export default PSwitch;
