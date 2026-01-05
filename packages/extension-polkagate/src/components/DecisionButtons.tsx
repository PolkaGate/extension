// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionButtonProps } from './ActionButton';
import type { GradientButtonProps } from './GradientButton';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useIsBlueish } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { ActionButton, GradientButton, GradientDivider, NeonButton } from '.';

export interface DecisionButtonProps {
  arrow?: boolean;
  cancelButton?: boolean;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  divider?: boolean;
  flexibleWidth?: boolean;
  isBusy?: boolean | undefined;
  onPrimaryClick: () => unknown;
  onSecondaryClick: () => void;
  primaryBtnText: string;
  secondaryBtnText: string;
  secondaryButtonProps?: Partial<ActionButtonProps>
  primaryButtonProps?: Partial<GradientButtonProps>
  showChevron?: boolean;
  style?: React.CSSProperties;
  dividerStyle?: React.CSSProperties;
}

function DecisionButtons ({ arrow = false, cancelButton, direction, disabled, divider = false, dividerStyle, flexibleWidth, isBusy, onPrimaryClick, onSecondaryClick, primaryBtnText, primaryButtonProps, secondaryBtnText, secondaryButtonProps, showChevron, style }: DecisionButtonProps): React.ReactElement {
  const theme = useTheme();
  const isBlueish = useIsBlueish();

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
        ? (
          <ActionButton
            contentPlacement='center'
            isBlueish={isBlueish}
            onClick={onSecondaryClick}
            style={{ height: '44px', width: secondaryWidth }}
            text={secondaryBtnText}
            {...secondaryButtonProps}
          />)
        : (
          <NeonButton
            contentPlacement='center'
            onClick={onSecondaryClick}
            style={{ height: '44px', width: secondaryWidth }}
            text={secondaryBtnText}
          />)
      }
      {divider &&
        <GradientDivider isBlueish={isBlueish} orientation='vertical' style={{ height: '90%', mx: '8px', ...dividerStyle }} />
      }
      {isBlueish
        ? (
          <StakingActionButton
            disabled={disabled}
            isBusy={isBusy}
            onClick={onPrimaryClick}
            startIcon
            style={{ flex: flexibleWidth ? 1 : 'none', width: primaryWidth, ...style }}
            text={primaryBtnText}
          />)
        : (
          <GradientButton
            disabled={disabled}
            endIconNode={arrow
              ? <ArrowForwardIosRoundedIcon sx={{ color: 'text.primary', fontSize: '13px', stroke: `${theme.palette.text.primary}`, strokeWidth: 1.1, zIndex: 10 }} />
              : undefined}
            isBusy={isBusy}
            onClick={onPrimaryClick}
            showChevron={showChevron}
            style={{ flex: flexibleWidth ? 1 : 'none', height: '44px', width: primaryWidth }}
            text={primaryBtnText}
            {...primaryButtonProps}
          />)
      }
    </Container>
  );
}

export default DecisionButtons;
