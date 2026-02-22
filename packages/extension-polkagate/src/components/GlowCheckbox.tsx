// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, type SxProps, type Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useIsHovered } from '../hooks';
import TwoToneText from './TwoToneText';

interface Props {
  checked?: boolean;
  disabled?: boolean;
  isBlueish?: boolean | undefined;
  label?: string;
  labelPartInColor?: string;
  changeState: (value: boolean) => void;
  style?: SxProps<Theme> | undefined;
  labelStyle?: React.CSSProperties | undefined;
  iconStyle?: SxProps<Theme> | undefined;
}

function GlowCheckbox({ changeState, checked = false, disabled, iconStyle = {}, isBlueish, label, labelPartInColor, labelStyle, style }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);

  const [state, setState] = useState<boolean>(checked);

  useEffect(() => {
    setState(checked);
  }, [checked]);

  const onClick = useCallback(() => {
    if (disabled) {
      return;
    }

    const newState = !state;

    setState(newState);
    changeState(newState);
  }, [changeState, disabled, state]);

  const CheckboxEffect = {
    background: hovered
      ? !disabled
        ? '#AA83DC'
        : state
          ? '#FF4FB9'
          : '#674394'
      : isBlueish
        ? '#809ACB4D'
        : state
          ? '#FF4FB9'
          : '#674394',
    border: '2px solid',
    borderColor: isBlueish ? '#809ACB' : '#AA83DC',
    borderRadius: '6px',
    height: '18px',
    opacity: disabled ? 0.3 : 1,
    position: 'relative',
    transition: 'all 100ms ease-out',
    width: '18px',

    ...(state && {
      '&::before': {
        background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
        border: 'unset',
        inset: 0,
        position: 'absolute',
        transition: 'all 100ms ease-out',
        zIndex: 2
      }
    }),

    ...iconStyle
  } as SxProps<Theme>;

  const LabelFontStyle = {
    color: theme.palette.text.primary,
    ...theme.typography['B-4']
  } as React.CSSProperties;

  return (
    <Container
      disableGutters
      onClick={onClick}
      ref={containerRef}
      sx={{ alignItems: 'center', columnGap: '10px', cursor: disabled ? 'default' : 'pointer', display: 'flex', ...style }}
    >
      <Grid sx={{ ...CheckboxEffect }}>
        <svg
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='3'
          style={{ color: theme.palette.text.primary, opacity: state ? 1 : 0, transition: 'all 100ms ease-out', zIndex: 2 }}
          viewBox='0 0 25 27'
        >
          <polyline points='20 6 9 17 4 12' />
        </svg>
      </Grid>
      {label &&
        <span style={{ ...LabelFontStyle, ...labelStyle, textAlign: 'left', userSelect: 'none' }}>
          <TwoToneText
            text={label}
            textPartInColor={labelPartInColor}
          />
        </span>
      }
    </Container>
  );
}

export default GlowCheckbox;
