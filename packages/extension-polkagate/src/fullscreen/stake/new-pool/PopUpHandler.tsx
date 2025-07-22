// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';
import type { DateAmount } from '../../../hooks/useSoloStakingInfo';
import type { MyPoolInfo } from '../../../util/types';

import React from 'react';

import ToBeReleased from '../ToBeReleased';
import { type PopupCloser, type PopupOpener, StakingPopUps } from '../util/utils';
import PoolDetail from './joinPool/PoolDetail';
import BondExtra from './bondExtra';
import CreatePool from './createPool';
import Info from './Info';
import JoinCreatePool from './JoinCreatePool';
import Unstake from './unstake';
import Withdraw from './withdraw';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  stakingPopup: StakingPopUps;
  popupCloser: PopupCloser;
  stakingInfo: PoolStakingInfo;
  toBeReleased: DateAmount[] | undefined;
  popupOpener: PopupOpener;
  poolInfo: MyPoolInfo | null | undefined;
}

function PopUpHandler ({ address, genesisHash, poolInfo, popupCloser, popupOpener, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement | null {
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

    case StakingPopUps.BOND_EXTRA:
      return (
        <BondExtra
          address={address}
          genesisHash={genesisHash}
          onClose={popupCloser}
        />);

    case StakingPopUps.JOIN_CREATE_POOL:
      return (
        <JoinCreatePool
          genesisHash={genesisHash}
          onClose={popupCloser}
          popupOpener={popupOpener}
        />);

    case StakingPopUps.CREATE_POOL:
      return (
        <CreatePool
          address={address}
          genesisHash={genesisHash}
          onClose={popupCloser}
        />);

    case StakingPopUps.MY_POOL:
      return (
        <PoolDetail
          genesisHash={genesisHash}
          onClose={popupCloser}
          poolDetail={poolInfo}
        />);

    default:
      return null;
  }
}

export default React.memo(PopUpHandler);
