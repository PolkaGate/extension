// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance, PositionInfo } from '../../util/types';

import { resolveStakingAssetId } from '@polkadot/extension-polkagate/src/util/workers/utils/adjustGenesis';

import { STAKING_CHAINS, TEST_NETS } from '../../util/constants';
import getChain from '../../util/getChain';
import { sanitizeChainName } from '../../util/utils';

export function getStakingAsset (accountAssets: FetchedBalance[] | null | undefined, genesisHash: string | undefined) {
    const _assetId = resolveStakingAssetId(genesisHash);
    const nativeTokenBalance = accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === _assetId);

    return nativeTokenBalance ?? null;
}

export function getEarningOptions (accountAssets: FetchedBalance[] | null | undefined, isTestnetEnabled: boolean | undefined) {
  const _stakingChains = isTestnetEnabled ? STAKING_CHAINS : STAKING_CHAINS.filter((genesisHash) => !TEST_NETS.includes(genesisHash));

  return _stakingChains.map((genesisHash) => {
    const chain = getChain(genesisHash);

    if (!chain) {
      return undefined;
    }

    const nativeTokenBalance = getStakingAsset(accountAssets, genesisHash);

    if ( // filter staked tokens
      (nativeTokenBalance?.soloTotal && !nativeTokenBalance.soloTotal.isZero()) ||
      (nativeTokenBalance?.pooledBalance && !nativeTokenBalance.pooledBalance.isZero())) {
      return undefined;
    }

    return {
      ...chain,
      ...nativeTokenBalance,
      chainName: sanitizeChainName(chain.name || '') ?? 'Unknown'
    } as unknown as PositionInfo;
  }).filter((item) => !!item);
}
