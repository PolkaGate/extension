// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, styled } from '@mui/material';
import React from 'react';

import useIsDark from '@polkadot/extension-polkagate/src/hooks/useIsDark';
import { noop } from '@polkadot/util';

interface Props {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void
}

const Ball = styled(Grid)<{ checked: boolean; disabled: boolean; isdark: boolean }>(({ checked, disabled, isdark }) => ({
  background: disabled ? (isdark ? '#674394' : '#B8BFD8') : checked ? (isdark ? '#EAEBF1' : '#3988FF') : (isdark ? '#BEAAD8' : '#CCD2EA'),
  borderRadius: '999px',
  height: checked ? '14px' : '10px',
  position: 'absolute',
  top: '50%',
  transform: `translate(${checked ? '11px' : '2px'}, -50%)`,
  transition: 'all 250ms ease-out',
  width: checked ? '14px' : '10px',
  zIndex: 2
}));

const SwitchContainer = styled(Grid)<{ checked: boolean; disabled: boolean; isdark: boolean }>(({ checked, disabled, isdark }) => ({
  '&::after': {
    background: disabled ? (isdark ? '#6743944D' : '#C7CEE4') : (isdark ? '#674394' : '#CCD2EA'),
    borderRadius: '999px',
    content: '""',
    inset: '-2px',
    opacity: disabled ? 1 : checked ? 0 : 1,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    zIndex: -1
  },
  '&::before': {
    background: isdark ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#3988FF',
    borderRadius: '999px',
    content: '""',
    inset: '-2px',
    opacity: disabled ? 0 : checked ? 1 : 0,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    zIndex: -1
  },
  background: isdark ? '#2D1E4A' : '#FFFFFF',
  borderRadius: '999px',
  cursor: disabled ? 'default' : 'pointer',
  height: '20px',
  padding: '4px',
  position: 'relative',
  transition: 'all 250ms ease-out',
  width: '32px'
}));

export default function GradientSwitch({ checked, disabled = false, onChange }: Props): React.ReactElement {
  const isDark = useIsDark();

  return (
    <div style={{ zIndex: 1 }}>
      <SwitchContainer checked={checked} disabled={disabled} isdark={isDark} onClick={disabled ? noop : onChange}>
        <Ball checked={checked} disabled={disabled} isdark={isDark} />
      </SwitchContainer>
    </div>
  );
}
