// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DateAmount, SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';

import React, { useMemo } from 'react';

import ToBeReleased from '../ToBeReleased';
import { type PopupCloser, type PopupOpener, StakingPopUps } from '../util/utils';
import BondExtra from './bondExtra';
import FastUnstake from './fastUnstaking';
import Info from './Info';
import Restake from './restake';
import Settings from './settings';
import Unstake from './unstake';
import Withdraw from './withdraw';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  stakingPopup: StakingPopUps;
  popupOpener: PopupOpener;
  popupCloser: PopupCloser;
  stakingInfo: SoloStakingInfo;
  toBeReleased: DateAmount[] | undefined;
}

function PopUpHandler ({ address, genesisHash, popupCloser, popupOpener, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement | null {
  return useMemo(() => {
    switch (stakingPopup) {
      case StakingPopUps.NONE:
        return null;

      case StakingPopUps.INFO:
        return (
          <Info
            genesisHash={genesisHash}
            onClose={popupCloser}
            stakingInfo={stakingInfo}
          />
        );

      case StakingPopUps.UNSTAKE:
        return (
          <Unstake
            address={address}
            genesisHash={genesisHash}
            onClose={popupCloser}
          />
        );

      case StakingPopUps.RESTAKE:
        return (
          <Restake
            address={address}
            genesisHash={genesisHash}
            onClose={popupCloser}
          />
        );

      case StakingPopUps.UNLOCKING:
        return (
          <ToBeReleased
            genesisHash={genesisHash}
            onClose={popupCloser}
            onRestake={popupOpener(StakingPopUps.RESTAKE)}
            toBeReleased={toBeReleased}
          />
        );

      case StakingPopUps.WITHDRAW:
        return (
          <Withdraw
            address={address}
            genesisHash={genesisHash}
            onClose={popupCloser}
          />
        );

      case StakingPopUps.BOND_EXTRA:
        return (
          <BondExtra
            address={address}
            genesisHash={genesisHash}
            onClose={popupCloser}
          />
        );

      case StakingPopUps.FAST_UNSTAKE:
        return (
          <FastUnstake
            address={address}
            genesisHash={genesisHash}
            onClose={popupCloser}
          />
        );

      case StakingPopUps.REWARD_DESTINATION_CONFIG:
        return (
          <Settings
            address={address}
            genesisHash={genesisHash}
            onClose={popupCloser}
          />
        );

      default:
        return null;
    }
  }, [address, genesisHash, popupCloser, popupOpener, stakingInfo, stakingPopup, toBeReleased]);
}

export default React.memo(PopUpHandler);
