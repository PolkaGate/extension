// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, styled } from '@mui/material';
import React from 'react';

import { noop } from '@polkadot/util';

interface Props {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void
}

const Ball = styled(Grid)<{ checked: boolean; disabled: boolean }>(({ checked, disabled }) => ({
  background: disabled ? '#674394' : checked ? '#EAEBF1' : '#BEAAD8',
  borderRadius: '999px',
  height: checked ? '14px' : '10px',
  position: 'absolute',
  top: '50%',
  transform: `translate(${checked ? '11px' : '2px'}, -50%)`,
  transition: 'all 250ms ease-out',
  width: checked ? '14px' : '10px',
  zIndex: 2
}));

const SwitchContainer = styled(Grid)<{ checked: boolean; disabled: boolean }>(({ checked, disabled }) => ({
  '&::after': {
    background: disabled ? '#6743944D' : '#674394',
    borderRadius: '999px',
    content: '""',
    inset: '-2px',
    opacity: disabled ? 1 : checked ? 0 : 1,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    zIndex: -1
  },
  '&::before': {
    background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
    borderRadius: '999px',
    content: '""',
    inset: '-2px',
    opacity: disabled ? 0 : checked ? 1 : 0,
    position: 'absolute',
    transition: 'all 250ms ease-out',
    zIndex: -1
  },
  background: '#2D1E4A',
  borderRadius: '999px',
  cursor: disabled ? 'default' : 'pointer',
  height: '20px',
  padding: '4px',
  position: 'relative',
  transition: 'all 250ms ease-out',
  width: '32px'
}));

export default function GradientSwitch({ checked, disabled = false, onChange }: Props): React.ReactElement {
  return (
    <div style={{ zIndex: 1 }}>
      <SwitchContainer checked={checked} disabled={disabled} onClick={disabled ? noop : onChange}>
        <Ball checked={checked} disabled={disabled} />
      </SwitchContainer>
    </div>
  );
}
