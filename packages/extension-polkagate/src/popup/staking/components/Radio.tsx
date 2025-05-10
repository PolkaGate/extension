// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RadioProps } from '@mui/material/Radio';

import { Stack, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import { styled, type SxProps, type Theme, useTheme } from '@mui/material/styles';
import React from 'react';

const UnChecked = styled('span')(() => ({
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2
  },
  backgroundColor: 'transparent',
  border: '3px solid #2D1E4A',
  borderRadius: '999px',
  height: 18,
  padding: 0,
  width: 18
}));

const Checked = styled('span')(({ checked, theme }: { checked: boolean; theme: Theme }) => ({
  '&::after': {
    backgroundColor: theme.palette.text.primary,
    borderRadius: '999px',
    content: '""',
    height: '8px',
    left: '50%',
    opacity: checked ? 1 : 0,
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 250ms ease-out',
    width: '8px'
  },
  '&::before': {
    border: '3px solid #3988FF',
    borderRadius: '999px',
    bottom: 0,
    content: '""',
    height: '100%',
    left: 0,
    opacity: checked ? 1 : 0,
    padding: '2px',
    position: 'absolute',
    right: 0,
    top: 0,
    transition: 'all 250ms ease-out',
    width: '100%'
  },
  backgroundColor: 'transparent',
  height: '18px',
  opacity: checked ? 1 : 0,
  padding: 0,
  position: 'relative',
  transition: 'all 250ms ease-out',
  width: '18px'
}));

interface Props extends RadioProps {
  label?: string;
  props?: RadioProps;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: unknown;
  boxStyle?: SxProps<Theme>;
  labeStyle?: SxProps<Theme>;
}

export default function PRadio ({ boxStyle, checked, labeStyle, label, onChange, props, value }: Props) {
  const theme = useTheme();

  return (
    <Stack direction='row' sx={{ alignItems: 'center', columnGap: '12px', ...boxStyle }}>
      <Radio
        checked={checked}
        checkedIcon={<Checked checked={!!checked} theme={theme} />}
        color='default'
        disableRipple
        icon={<UnChecked />}
        onChange={onChange}
        style={{ margin: 0, padding: 0 }}
        value={value}
        {...props}
      />
      <Typography color={checked ? 'text.highlight' : 'text.primary'} sx={labeStyle} variant='B-2'>
        {label}
      </Typography>
    </Stack>
  );
}
