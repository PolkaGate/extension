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

function PopUpHandler ({ address, genesisHash, popupCloser, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement {
  switch (stakingPopup) {
    case StakingPopUps.NONE:
      return <></>;

    case StakingPopUps.INFO:
      return (
        <Info
          genesisHash={genesisHash}
          onClose={popupCloser}
          open={stakingPopup === StakingPopUps.INFO}
          stakingInfo={stakingInfo}
        />);

    case StakingPopUps.UNSTAKE:
      return (
        <Unstake
          address={address}
          genesisHash={genesisHash}
          onClose={popupCloser}
          open={stakingPopup === StakingPopUps.UNSTAKE}
        />);

    case StakingPopUps.UNLOCKING:

      return (
        <ToBeReleased
          genesisHash={genesisHash}
          onClose={popupCloser}
          open={stakingPopup === StakingPopUps.UNLOCKING}
          toBeReleased={toBeReleased}
        />);

    case StakingPopUps.WITHDRAW:
      return (
        <Withdraw
          address={address}
          genesisHash={genesisHash}
          onClose={popupCloser}
          open={stakingPopup === StakingPopUps.WITHDRAW}
        />);

    default:
      return <></>;
  }
}

export default React.memo(PopUpHandler);
