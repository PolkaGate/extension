// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, type SxProps, type Theme, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { ActionButton, GradientButton, GradientDivider, NeonButton } from '.';

interface Props {
  arrow?: boolean;
  cancelButton?: boolean;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  divider?: boolean;
  flexibleWidth?: boolean;
  isBusy?: boolean | undefined;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  primaryBtnText: string;
  secondaryBtnText: string;
  style?: SxProps<Theme>;
}

function DecisionButtons ({ arrow = false, cancelButton, direction, disabled, divider = false, flexibleWidth, isBusy, onPrimaryClick, onSecondaryClick, primaryBtnText, secondaryBtnText, style }: Props): React.ReactElement {
  const theme = useTheme();

  const { primaryWidth, secondaryWidth } = useMemo(() => {
    const isVertical = direction === 'vertical';

    if (isVertical) {
      return {
        primaryWidth: '100%',
        secondaryWidth: '100%'
      };
    }

    return flexibleWidth
      ? {
        primaryWidth: 'auto',
        secondaryWidth: 'fit-content'
      }
      : {
        primaryWidth: '70%',
        secondaryWidth: '30%'
      };
  }, [direction, flexibleWidth]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: direction === 'vertical' ? 'column-reverse' : undefined, gap: direction === 'vertical' ? '18px' : '5px', justifyContent: 'space-between', position: 'relative', zIndex: 1, ...style }}>
      {cancelButton
        ? <ActionButton
          contentPlacement='center'
          onClick={onSecondaryClick}
          style={{ height: '44px', width: secondaryWidth }}
          text={secondaryBtnText}
        />
        : <NeonButton
          contentPlacement='center'
          onClick={onSecondaryClick}
          style={{ height: '44px', width: secondaryWidth }}
          text={secondaryBtnText}
        />
      }
      {divider &&
        <GradientDivider orientation='vertical' style={{ height: '90%', mx: '8px' }} />
      }
      <GradientButton
        disabled={disabled}
        endIconNode={arrow
          ? <ArrowForwardIosRoundedIcon sx={{ color: 'text.primary', fontSize: '13px', stroke: `${theme.palette.text.primary}`, strokeWidth: 1.1, zIndex: 10 }} />
          : undefined}
        isBusy={isBusy}
        onClick={onPrimaryClick}
        style={{ flex: flexibleWidth ? 1 : 'none', height: '48px', width: primaryWidth }}
        text={primaryBtnText}
      />
    </Container>
  );
}

export default DecisionButtons;
