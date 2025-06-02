// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionButtonProps } from './ActionButton';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { useIsBlueish } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { ActionButton, GradientButton, GradientDivider, NeonButton } from '.';

interface Props {
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
  showChevron?: boolean;
  style?: React.CSSProperties;
}

function DecisionButtons({ arrow = false, cancelButton, direction, disabled, divider = false, flexibleWidth, isBusy, onPrimaryClick, onSecondaryClick, primaryBtnText, secondaryBtnText, secondaryButtonProps, showChevron, style }: Props): React.ReactElement {
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
        ? <ActionButton
          contentPlacement='center'
          isBlueish={isBlueish}
          onClick={onSecondaryClick}
          style={{ height: '44px', width: secondaryWidth }}
          text={secondaryBtnText}
          {...secondaryButtonProps}
        />
        : <NeonButton
          contentPlacement='center'
          disabled={secondaryDisabled}
          onClick={onSecondaryClick}
          style={{ height: '44px', width: secondaryWidth }}
          text={secondaryBtnText}
        />
      }
      {divider &&
        <GradientDivider isBlueish={isBlueish} orientation='vertical' style={{ height: '90%', mx: '8px' }} />
      }
      {isBlueish
        ? <StakingActionButton
          disabled={disabled}
          isBusy={isBusy}
          onClick={onPrimaryClick}
          startIcon
          style={style}
          text={primaryBtnText}
        />
        : <GradientButton
          disabled={disabled}
          endIconNode={arrow
            ? <ArrowForwardIosRoundedIcon sx={{ color: 'text.primary', fontSize: '13px', stroke: `${theme.palette.text.primary}`, strokeWidth: 1.1, zIndex: 10 }} />
            : undefined}
          isBusy={isBusy}
          onClick={onPrimaryClick}
          showChevron={showChevron}
          style={{ flex: flexibleWidth ? 1 : 'none', height: '44px', width: primaryWidth }}
          text={primaryBtnText}
        />
      }
    </Container>
  );
}

export default DecisionButtons;
