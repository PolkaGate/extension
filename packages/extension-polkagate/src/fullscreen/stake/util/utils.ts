// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

export enum StakingPopUps {
  NONE,
  INFO,
  WITHDRAW,
  RESTAKE,
  UNSTAKE,
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
