// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { useCallback, useState } from 'react';

import { type BN, noop } from '@polkadot/util';

import { TRANSACTION_FLOW_STEPS } from '../../../util/constants';

export enum StakingPopUps {
  NONE,
  INFO,
  WITHDRAW,
  RESTAKE,
  UNSTAKE,
  BOND_EXTRA,
  STAKE,
  FAST_UNSTAKE,
  CLAIM_REWARDS,
  PENDING_REWARDS,
  UNLOCKING,
  REWARD_DESTINATION_CONFIG
}

export type PopupOpener = (popup: StakingPopUps) => () => void;
export type PopupCloser = () => void;

export function useStakingPopups () {
  const [stakingPopup, setStakingPopup] = useState<StakingPopUps>(StakingPopUps.NONE);

  const popupOpener: PopupOpener = useCallback((popup: StakingPopUps) => () => setStakingPopup(popup), []);
  const popupCloser: PopupCloser = useCallback(() => setStakingPopup(StakingPopUps.NONE), []);

  return { popupCloser, popupOpener, stakingPopup };
}

export interface Stats {
  value: number | string | BN | undefined;
  label: string;
  InfoIcon?: Icon;
  withLogo?: boolean;
}

export const FULLSCREEN_STAKING_TX_FLOW = {
  ...TRANSACTION_FLOW_STEPS,
  NONE: 'none'
};

export type FullScreenTransactionFlow = typeof FULLSCREEN_STAKING_TX_FLOW[keyof typeof FULLSCREEN_STAKING_TX_FLOW];

interface CloseBehavior {
  showCloseIcon?: boolean;
  onClose: () => void;
}

export function getCloseBehavior (
  flowStep: FullScreenTransactionFlow,
  handleClosePopup: () => void,
  setFlowStep: (step: FullScreenTransactionFlow) => void
): CloseBehavior {
  switch (flowStep) {
    case FULLSCREEN_STAKING_TX_FLOW.NONE:
    case FULLSCREEN_STAKING_TX_FLOW.CONFIRMATION:
      return {
        onClose: handleClosePopup,
        showCloseIcon: true
      };

    case FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN:
      return {
        onClose: noop,
        showCloseIcon: undefined
      };

    case FULLSCREEN_STAKING_TX_FLOW.REVIEW:
    default:
      return {
        onClose: () => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE),
        showCloseIcon: false
      };
  }
}
