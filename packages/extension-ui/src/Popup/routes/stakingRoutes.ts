// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import Stake from '@polkadot/extension-polkagate/src/fullscreen/stake';
import PoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/new-pool';
import SoloFS from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo';
import StakingIndex from '@polkadot/extension-polkagate/src/popup/staking';
import EarningOptions from '@polkadot/extension-polkagate/src/popup/staking/EarningOptions';
import Pool from '@polkadot/extension-polkagate/src/popup/staking/pool-new';
import PoolBondExtra from '@polkadot/extension-polkagate/src/popup/staking/pool-new/bondExtra';
import CreatePool from '@polkadot/extension-polkagate/src/popup/staking/pool-new/createPool';
import PoolInfo from '@polkadot/extension-polkagate/src/popup/staking/pool-new/Info';
import JoinPool from '@polkadot/extension-polkagate/src/popup/staking/pool-new/joinPool';
import PoolStake from '@polkadot/extension-polkagate/src/popup/staking/pool-new/stake';
import PoolUnstake from '@polkadot/extension-polkagate/src/popup/staking/pool-new/unstake';
import StakingReward from '@polkadot/extension-polkagate/src/popup/staking/Reward';
import SoloPayout from '@polkadot/extension-polkagate/src/popup/staking/solo/rewards/PendingRewards';
import TuneUp from '@polkadot/extension-polkagate/src/popup/staking/solo/tuneUp';
import Solo from '@polkadot/extension-polkagate/src/popup/staking/solo-new';
import BondExtra from '@polkadot/extension-polkagate/src/popup/staking/solo-new/bondExtra';
import FastUnstake from '@polkadot/extension-polkagate/src/popup/staking/solo-new/fast-unstake/FastUnstake';
import SoloInfo from '@polkadot/extension-polkagate/src/popup/staking/solo-new/Info';
import SoloNominations from '@polkadot/extension-polkagate/src/popup/staking/solo-new/nominations/NominationsSetting';
import PendingReward from '@polkadot/extension-polkagate/src/popup/staking/solo-new/pendingReward';
import SoloRestake from '@polkadot/extension-polkagate/src/popup/staking/solo-new/restake';
import SoloSettings from '@polkadot/extension-polkagate/src/popup/staking/solo-new/settings';
import SoloUnstake from '@polkadot/extension-polkagate/src/popup/staking/solo-new/unstake';

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
  {
    Component: StakingReward,
    path: '/stakingReward/:address/:genesisHash/:type',
    trigger: 'staking-reward'
  },
  // POOL STAKING ROUTE
  {
    Component: CreatePool,
    path: '/pool/:genesisHash/create',
    trigger: 'pool-create'
  },
  {
    Component: JoinPool,
    path: '/pool/:genesisHash/join',
    trigger: 'pool-join'
  },
  {
    Component: PoolStake,
    path: '/pool/:genesisHash/stake',
    trigger: 'pool-stake'
  },
  {
    Component: PoolBondExtra,
    path: '/pool/:genesisHash/bondExtra',
    trigger: 'pool-bond-extra'
  },
  {
    Component: PoolUnstake,
    path: '/pool/:genesisHash/unstake',
    trigger: 'pool-unstake'
  },
  {
    Component: Pool,
    path: '/pool/:genesisHash',
    trigger: 'pool-staking-index'
  },
  {
    Component: PoolInfo,
    path: '/pool/:genesisHash/info',
    trigger: 'pool-staking-info'
  },
  // SOLO STAKING ROUTE
  {
    Component: PendingReward,
    path: '/solo/:genesisHash/pendingReward',
    trigger: 'solo-stake-pending-rewards'
  },
  {
    Component: FastUnstake,
    path: '/solo/:genesisHash/fastUnstake',
    trigger: 'solo-fast-unstake'
  },
  {
    Component: SoloNominations,
    path: '/solo/:genesisHash/nominations',
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
    path: '/solo/:genesisHash/unstake',
    trigger: 'solo-unstake'
  },
  {
    Component: SoloSettings,
    path: '/solo/:genesisHash/settings',
    trigger: 'solo-settings'
  },
  {
    Component: Solo,
    path: '/solo/:genesisHash',
    trigger: 'solo-staking-index'
  },
  // FULL SCREEN STAKING ROUTES
  {
    Component: SoloFS,
    path: '/fullscreen-stake/solo/:genesisHash',
    trigger: 'solo-staking-fullscreen'
  },
  {
    Component: PoolFS,
    path: '/fullscreen-stake/pool/:genesisHash',
    trigger: 'pool-staking-fullscreen'
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
