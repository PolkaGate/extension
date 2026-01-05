// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { type ReactNode } from 'react';

import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { GradientButton } from '.';

export interface DecisionButtonProps {
  disabled?: boolean;
  isBusy?: boolean | undefined;
  isBlueish: boolean | undefined;
  onClick: () => unknown;
  startIcon?: ReactNode;
  style?: React.CSSProperties;
  text: string;
}

function VariantButton({ disabled, isBlueish, isBusy, onClick, startIcon, style, text }: DecisionButtonProps): React.ReactElement {
  return (
    <>
      {isBlueish
        ? (
          <StakingActionButton
            disabled={disabled}
            isBusy={isBusy}
            onClick={onClick}
            startIcon={startIcon}
            style={{ flex: 'none', ...style }}
            text={text}
          />)
        : (
          <GradientButton
            disabled={disabled}
            isBusy={isBusy}
            onClick={onClick}
            style={{ flex: 'none', height: '44px', ...style }}
            text={text}
          />)
      }
    </>
  );
}

export default VariantButton;
