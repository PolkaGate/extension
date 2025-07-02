// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DateAmount, SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';

import React, { useCallback } from 'react';

import ToBeReleased from '../ToBeReleased';
import { type PopupCloser, type PopupOpener, StakingPopUps } from '../util/utils';
import Info from './Info';
import Restake from './restake';
import Unstake from './unstake';
import Withdraw from './withdraw';
import BondExtra from './bondExtra';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  stakingPopup: StakingPopUps;
  popupOpener: PopupOpener;
  popupCloser: PopupCloser;
  stakingInfo: SoloStakingInfo;
  toBeReleased: DateAmount[] | undefined;
}

function PopUpHandler ({ address, genesisHash, popupCloser, popupOpener, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement {
  const onRestake = useCallback(() => {
    popupCloser();
    popupOpener(StakingPopUps.RESTAKE);
  }, [popupCloser, popupOpener]);

  return (
    <>
      <Info
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.INFO}
        stakingInfo={stakingInfo}
      />
      <Unstake
        address={address}
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.UNSTAKE}
      />
      <Restake
        address={address}
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.RESTAKE}
      />
      <ToBeReleased
        genesisHash={genesisHash}
        onClose={popupCloser}
        onRestake={onRestake}
        open={stakingPopup === StakingPopUps.UNLOCKING}
        toBeReleased={toBeReleased}
      />
      <Withdraw
        address={address}
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.WITHDRAW}
      />
      <BondExtra
        address={address}
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.BOND_EXTRA}
      />
    </>
  );
}

export default React.memo(PopUpHandler);
