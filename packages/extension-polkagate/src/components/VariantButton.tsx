// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { GradientButton } from '.';

export interface DecisionButtonProps {
  disabled?: boolean;
  isBusy?: boolean | undefined;
  isBlueish: boolean | undefined;
  onClick: () => unknown;
  style?: React.CSSProperties;
  text: string;
}

function VariantButton ({ disabled, isBlueish, isBusy, onClick, style, text }: DecisionButtonProps): React.ReactElement {
  return (
    <>
      {isBlueish
        ? (
          <StakingActionButton
            disabled={disabled}
            isBusy={isBusy}
            onClick={onClick}
            startIcon
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
