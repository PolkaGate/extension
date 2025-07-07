// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';
import type { DateAmount } from '../../../hooks/useSoloStakingInfo';

import React from 'react';

import ToBeReleased from '../ToBeReleased';
import { type PopupCloser, StakingPopUps } from '../util/utils';
import Info from './Info';
import Unstake from './unstake';
import Withdraw from './withdraw';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  stakingPopup: StakingPopUps;
  popupCloser: PopupCloser;
  stakingInfo: PoolStakingInfo;
  toBeReleased: DateAmount[] | undefined;
}

function PopUpHandler ({ address, genesisHash, popupCloser, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement | null {
  switch (stakingPopup) {
    case StakingPopUps.NONE:
      return null;

    case StakingPopUps.INFO:
      return (
        <Info
          genesisHash={genesisHash}
          onClose={popupCloser}
          stakingInfo={stakingInfo}
        />);

    case StakingPopUps.UNSTAKE:
      return (
        <Unstake
          address={address}
          genesisHash={genesisHash}
          onClose={popupCloser}
        />);

    case StakingPopUps.UNLOCKING:

      return (
        <ToBeReleased
          genesisHash={genesisHash}
          onClose={popupCloser}
          toBeReleased={toBeReleased}
        />);

    case StakingPopUps.WITHDRAW:
      return (
        <Withdraw
          address={address}
          genesisHash={genesisHash}
          onClose={popupCloser}
        />);

    default:
      return null;
  }
}

export default React.memo(PopUpHandler);
