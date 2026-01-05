// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RadioProps } from '@mui/material/Radio';

import { Stack, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import { styled, type SxProps, type Theme, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';

import useIsBlueish from '@polkadot/extension-polkagate/src/hooks/useIsBlueish';

const UnChecked = styled('span')<{ size: number; isBlueish: boolean; isHovered?: boolean }>(({ isBlueish, isHovered, size }) => ({
  '&::after': {
    backgroundColor: isBlueish ? '#809ACB' : '#FFF',
    borderRadius: '999px',
    content: isHovered ? '""' : 'none',
    height: size * 0.6,
    left: '50%',
    opacity: isHovered ? 1 : 0,
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 200ms ease',
    width: size * 0.6
  },
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2
  },
  backgroundColor: 'transparent',
  border: `3px solid ${isBlueish ? '#222442' : '#2D1E4A'}`,
  borderRadius: '999px',
  height: size,
  padding: 0,
  position: 'relative',
  width: size
}));

const Checked = styled('span')<{ checked: boolean; isBlueish: boolean; theme: Theme; size: number }>(({ checked, isBlueish, size, theme }) => ({
  '&::after': {
    backgroundColor: theme.palette.text.primary,
    borderRadius: '999px',
    content: '""',
    height: size * 0.44,
    left: '50%',
    opacity: checked ? 1 : 0,
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 250ms ease-out',
    width: size * 0.44
  },
  '&::before': {
    WebkitMask: isBlueish
      ? 'none'
      : 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: isBlueish ? 'none' : 'xor',
    background: isBlueish
      ? 'transparent'
      : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
    backgroundClip: isBlueish ? 'none' : 'border-box',
    border: isBlueish ? '3px solid #3988FF' : 'none',
    borderRadius: '999px',
    bottom: 0,
    content: '""',
    height: '100%',
    left: 0,
    maskComposite: isBlueish ? 'none' : 'exclude',
    opacity: checked ? 1 : 0,
    padding: '2px',
    position: 'absolute',
    right: 0,
    top: 0,
    transition: 'all 250ms ease-out',
    width: '100%'
  },
  backgroundColor: 'transparent',
  height: size,
  opacity: checked ? 1 : 0,
  padding: 0,
  position: 'relative',
  transition: 'all 250ms ease-out',
  width: size
}));

interface Props extends RadioProps {
  boxStyle?: React.CSSProperties;
  checked?: boolean;
  circleSize?: number;
  label?: string;
  labeStyle?: SxProps<Theme>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  props?: RadioProps;
  value: unknown;
  isHovered?: boolean;
}

export default function PRadio ({ boxStyle = {}, checked, circleSize = 18, isHovered: isHoveredProp, labeStyle, label, onChange, props, value }: Props) {
  const theme = useTheme();
  const isBlueish = useIsBlueish();
  const [internalHovered, setInternalHovered] = useState(false);

  const isHovered = isHoveredProp ?? internalHovered;

  return (
    <Stack
      direction='row'
      // eslint-disable-next-line react/jsx-no-bind
      onMouseEnter={() => {
        if (isHoveredProp === undefined) {
          setInternalHovered(true);
        }
      }}
      // eslint-disable-next-line react/jsx-no-bind
      onMouseLeave={() => {
        if (isHoveredProp === undefined) {
          setInternalHovered(false);
        }
      }}
      sx={{ alignItems: 'center', cursor: 'pointer' }}
    >
      <label htmlFor={`custom-radio_${label}`} style={{ alignItems: 'center', columnGap: label ? '12px' : 0, display: 'flex', ...boxStyle }}>
        <Radio
          checked={checked}
          checkedIcon={<Checked checked={!!checked} isBlueish={isBlueish} size={circleSize} theme={theme} />}
          color='default'
          disableRipple
          icon={<UnChecked isBlueish={isBlueish} isHovered={isHovered} size={circleSize} />}
          inputProps={{ id: `custom-radio_${label}` }}
          onChange={onChange}
          style={{ margin: 0, padding: 0 }}
          value={value}
          {...props}
        />
        <Typography
          color={
            checked
              ? isBlueish
                ? 'text.highlight'
                : 'text.secondary'
              : 'text.primary'
          } sx={labeStyle} variant='B-2'
        >
          {label}
        </Typography>
      </label>
    </Stack>
  );
}
