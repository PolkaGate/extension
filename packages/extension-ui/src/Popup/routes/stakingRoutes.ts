// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import Stake from '@polkadot/extension-polkagate/src/fullscreen/stake';
import PoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/pool';
import SoloFS from '@polkadot/extension-polkagate/src/fullscreen/stake/solo';
import StakingIndex from '@polkadot/extension-polkagate/src/popup/staking';
import EarningOptions from '@polkadot/extension-polkagate/src/popup/staking/EarningOptions';
import Pool from '@polkadot/extension-polkagate/src/popup/staking/pool';
import PoolInformation from '@polkadot/extension-polkagate/src/popup/staking/pool/myPool';
import PoolNominations from '@polkadot/extension-polkagate/src/popup/staking/pool/nominations';
import PoolStake from '@polkadot/extension-polkagate/src/popup/staking/pool/stake';
import CreatePool from '@polkadot/extension-polkagate/src/popup/staking/pool/stake/createPool';
import JoinPool from '@polkadot/extension-polkagate/src/popup/staking/pool/stake/joinPool';
import PoolUnstake from '@polkadot/extension-polkagate/src/popup/staking/pool/unstake';
import FastUnstake from '@polkadot/extension-polkagate/src/popup/staking/solo/fastUnstake';
import SoloNominations from '@polkadot/extension-polkagate/src/popup/staking/solo/nominations';
import SoloPayout from '@polkadot/extension-polkagate/src/popup/staking/solo/rewards/PendingRewards';
import TuneUp from '@polkadot/extension-polkagate/src/popup/staking/solo/tuneUp';
import SoloUnstake from '@polkadot/extension-polkagate/src/popup/staking/solo/unstake';
import Solo from '@polkadot/extension-polkagate/src/popup/staking/solo-new';
import BondExtra from '@polkadot/extension-polkagate/src/popup/staking/solo-new/BondExtra';
import SoloInfo from '@polkadot/extension-polkagate/src/popup/staking/solo-new/Info';
import SoloRestake from '@polkadot/extension-polkagate/src/popup/staking/solo-new/restake';

export const STAKING_ROUTES: RouteConfig[] = [
  {
    Component: StakingIndex,
    path: '/stakingIndex',
    trigger: 'staking-index'
  },
  {
    Component: EarningOptions,
    path: '/stakingIndex-options',
    trigger: 'staking-index-options'
  },
  // POOL STAKING ROUTE
  {
    Component: CreatePool,
    path: '/pool/create/:address',
    trigger: 'pool-create'
  },
  {
    Component: JoinPool,
    path: '/pool/join/:address',
    trigger: 'pool-join'
  },
  {
    Component: PoolStake,
    path: '/pool/stake/:address',
    trigger: 'pool-stake'
  },
  {
    Component: PoolInformation,
    path: '/pool/myPool/:address',
    trigger: 'pool-poolInformation'
  },
  {
    Component: PoolNominations,
    path: '/pool/nominations/:address',
    trigger: 'pool-nominations'
  },
  {
    Component: PoolUnstake,
    path: '/pool/unstake/:address',
    trigger: 'pool-unstake'
  },
  {
    Component: Pool,
    path: '/pool/:address',
    trigger: 'pool-staking'
  },
  {
    Component: PoolFS,
    path: '/poolfs/:address',
    trigger: 'pool-staking-fullscreen'
  },
  // SOLO STAKING ROUTE
  {
    Component: FastUnstake,
    path: '/solo/fastUnstake/:address',
    trigger: 'solo-fast-unstake'
  },
  {
    Component: SoloNominations,
    path: '/solo/nominations/:address',
    trigger: 'solo-nominations'
  },
  {
    Component: SoloPayout,
    path: '/solo/payout/:address',
    trigger: 'solo-payout'
  },
  {
    Component: SoloRestake,
    path: '/solo/:genesisHash/restake',
    trigger: 'solo-restake'
  },
  {
    Component: SoloInfo,
    path: '/solo/:genesisHash/info',
    trigger: 'solo-info'
  },
  {
    Component: BondExtra,
    path: '/solo/:genesisHash/bondExtra',
    trigger: 'solo-bond-extra'
  },
  {
    Component: SoloUnstake,
    path: '/solo/unstake/:address',
    trigger: 'solo-unstake'
  },
  {
    Component: Solo,
    path: '/solo/:genesisHash',
    trigger: 'solo-staking'
  },
  {
    Component: SoloFS,
    path: '/solofs/:address',
    trigger: 'solo-staking-fullscreen'
  },
  {
    Component: Stake,
    path: '/stake/:address',
    trigger: 'stake'
  },
  {
    Component: TuneUp,
    path: '/tuneup/:address',
    trigger: 'tuneup'
  }
];
