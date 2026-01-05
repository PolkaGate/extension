// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteConfig } from './RouteDefinitions';

import PoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/new-pool';
import JoinPoolFS from '@polkadot/extension-polkagate/src/fullscreen/stake/new-pool/joinPool';
import SoloFS from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo';
import ManageValidators from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/nominations/ManageValidators';
import StakingIndex from '@polkadot/extension-polkagate/src/popup/staking';
import EarningOptions from '@polkadot/extension-polkagate/src/popup/staking/EarningOptions';
import EasyStake from '@polkadot/extension-polkagate/src/popup/staking/easyStake';
import Pool from '@polkadot/extension-polkagate/src/popup/staking/pool-new';
import PoolBondExtra from '@polkadot/extension-polkagate/src/popup/staking/pool-new/bondExtra';
import CreatePool from '@polkadot/extension-polkagate/src/popup/staking/pool-new/createPool';
import PoolInfo from '@polkadot/extension-polkagate/src/popup/staking/pool-new/Info';
import JoinPool from '@polkadot/extension-polkagate/src/popup/staking/pool-new/joinPool';
import PoolStake from '@polkadot/extension-polkagate/src/popup/staking/pool-new/stake';
import PoolUnstake from '@polkadot/extension-polkagate/src/popup/staking/pool-new/unstake';
import StakingReward from '@polkadot/extension-polkagate/src/popup/staking/Reward';
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
    Component: EasyStake,
    path: '/easyStake/:genesisHash',
    trigger: 'easy-stake'
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
    Component: StakingReward,
    path: '/stakingReward/:address/:genesisHash/:type',
    trigger: 'staking-reward'
  },
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
    path: '/fullscreen-stake/solo/:address/:genesisHash',
    trigger: 'solo-staking-fullscreen'
  },
  {
    Component: ManageValidators,
    path: '/fullscreen-stake/solo/manage-validator/:address/:genesisHash',
    trigger: 'solo-staking-manage-validator-fullscreen'
  },
  {
    Component: PoolFS,
    path: '/fullscreen-stake/pool/:address/:genesisHash',
    trigger: 'pool-staking-fullscreen'
  },
  {
    Component: JoinPoolFS,
    path: '/fullscreen-stake/pool/join-pool/:address/:genesisHash',
    trigger: 'join-pool-staking-fullscreen'
  }
];
