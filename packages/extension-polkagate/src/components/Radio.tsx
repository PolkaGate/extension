// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RadioProps } from '@mui/material/Radio';

import { Stack, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const BpIcon = styled('span')(({ theme }) => ({
  backgroundColor: '#f5f8fa',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  border: '2px solid #2D1E4A',
  borderRadius: '50%',
  boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  height: 18,
  width: 18,

  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2
  },
  'input:hover ~ &': {
    backgroundColor: '#ebf1f5',
    ...theme.applyStyles('dark', {
      backgroundColor: '#AA83DC'
    })
  },

  'input:disabled ~ &': {
    background: 'rgba(206,217,224,.5)',
    boxShadow: 'none',
    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)'
    })
  },
  ...theme.applyStyles('dark', {
    backgroundColor: '#110F2A',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))',
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)'
  })
}));

const BpCheckedIcon = styled(BpIcon)({
  '&::after': {
    backgroundColor: '#fff',
    borderRadius: '50%',
    content: '""',
    height: '8px',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px'
  },
  '&::before': {
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'destination-out',
    background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
    borderRadius: '50%',
    bottom: '-2px',
    content: '""',
    left: '-2px',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    padding: '2px',
    position: 'absolute',
    right: '-2px',
    top: '-2px'
  },
  backgroundColor: '#110F2A',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  border: '2px solid transparent',
  'input:hover ~ &': {
    backgroundColor: '#AA83DC'
  },
  position: 'relative'
});

interface Props extends RadioProps {
  columnGap?: string;
  label?: string;
  props?: RadioProps;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: unknown;
}

export default function MyRadio ({ checked, columnGap, label, onChange, props, value }: Props) {
  return (
    <Stack columnGap={columnGap} direction='row' sx={{ alignItems: 'center' }}>
      <label htmlFor={`radio-${value}`} style={{ alignItems: 'center', cursor: 'pointer', display: 'flex' }}>
        <Radio
          checked={checked}
          checkedIcon={<BpCheckedIcon />}
          color='default'
          disableRipple
          icon={<BpIcon />}
          id={`radio-${value}`}
          onChange={onChange}
          value={value}
          {...props}
        />
        <Typography color='#AA83DC' variant='B-1'>
          {label}
        </Typography>
      </label>
    </Stack>
  );
}
