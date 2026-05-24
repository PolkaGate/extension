// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';
import type { DateAmount } from '../../../hooks/useSoloStakingInfo';
import type { MyPoolInfo, PositionInfo } from '../../../util/types';

import React, { useCallback, useMemo } from 'react';

import StakingInfo from '../../../popup/staking/stakingInfo';
import EasyStake from '../easyStake';
import ToBeReleased from '../ToBeReleased';
import { type PopupCloser, type PopupOpener, StakingPopUps } from '../util/utils';
import PoolDetail from './joinPool/PoolDetail';
import BondExtra from './bondExtra';
import ClaimReward from './claimReward';
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
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
  selectedPosition: PositionInfo | undefined;
}

function PopUpHandlerPool({ address, genesisHash, poolInfo, popupCloser, popupOpener, selectedPosition, setSelectedPosition, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement | null {
  const handleClose = useCallback(() => {
    popupCloser();
    setSelectedPosition(undefined);
  }, [popupCloser, setSelectedPosition]);

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

      case StakingPopUps.CLAIM_REWARDS:
        return (
          <ClaimReward
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
            address={address}
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

      case StakingPopUps.STAKING_INFO:
        return (
          <StakingInfo
            onClose={handleClose}
            onNext={popupOpener(StakingPopUps.EASY_STAKE)}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
          />);

      case StakingPopUps.EASY_STAKE:
        return (
          <EasyStake
            address={address}
            onClose={popupCloser}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
          />);

      default:
        return null;
    }
  }, [address, genesisHash, handleClose, poolInfo, popupCloser, popupOpener, selectedPosition, setSelectedPosition, stakingInfo, stakingPopup, toBeReleased]);
}

export default React.memo(PopUpHandlerPool);
