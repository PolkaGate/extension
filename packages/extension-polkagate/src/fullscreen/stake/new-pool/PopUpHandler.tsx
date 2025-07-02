// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';
import type { DateAmount } from '../../../hooks/useSoloStakingInfo';

import React from 'react';

import ToBeReleased from '../ToBeReleased';
import { type PopupCloser, StakingPopUps } from '../util/utils';
import Withdraw from '../Withdraw';
import Info from './Info';
import Unstake from './unstake';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  stakingPopup: StakingPopUps;
  popupCloser: PopupCloser;
  stakingInfo: PoolStakingInfo;
  toBeReleased: DateAmount[] | undefined;
}

function PopUpHandler ({ address, genesisHash, popupCloser, stakingInfo, stakingPopup, toBeReleased }: Props): React.ReactElement {
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
      <ToBeReleased
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.UNLOCKING}
        toBeReleased={toBeReleased}
      />
      <Withdraw
        address={address}
        genesisHash={genesisHash}
        onClose={popupCloser}
        open={stakingPopup === StakingPopUps.WITHDRAW}
      />
    </>
  );
}

export default React.memo(PopUpHandler);
