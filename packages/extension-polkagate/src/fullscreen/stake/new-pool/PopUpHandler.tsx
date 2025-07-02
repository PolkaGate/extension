// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolStakingInfo } from '../../../hooks/usePoolStakingInfo';

import React from 'react';

import { type PopupCloser, StakingPopUps } from '../util/utils';
import Info from './Info';
import Unstake from './unstake';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  stakingPopup: StakingPopUps;
  popupCloser: PopupCloser;
  stakingInfo: PoolStakingInfo;
}

function PopUpHandler ({ address, genesisHash, popupCloser, stakingInfo, stakingPopup }: Props): React.ReactElement {
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
    </>
  );
}

export default React.memo(PopUpHandler);
