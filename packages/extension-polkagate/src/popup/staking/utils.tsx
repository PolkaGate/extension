// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance, PositionInfo } from '../../util/types';

import { mapRelayToSystemGenesisIfMigrated, resolveStakingAssetId } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { STAKING_CHAINS, TEST_NETS } from '../../util/constants';
import getChain from '../../util/getChain';
import { sanitizeChainName } from '../../util/utils';

export function getStakingAsset (accountAssets: FetchedBalance[] | null | undefined, genesisHash: string | undefined) {
  const mappedGenesisHash = mapRelayToSystemGenesisIfMigrated(genesisHash);
  const _assetId = resolveStakingAssetId(mappedGenesisHash);
  const asset = accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === mappedGenesisHash && String(assetId) === _assetId);

  return asset ?? null;
}

export function getEarningOptions(accountAssets: FetchedBalance[] | null | undefined, isTestnetEnabled: boolean | undefined) {
  const _stakingChains = isTestnetEnabled ? STAKING_CHAINS : STAKING_CHAINS.filter((genesisHash) => !TEST_NETS.includes(genesisHash));

  return _stakingChains.map((genesisHash) => {
    const chain = getChain(genesisHash);

    if (!chain) {
      return undefined;
    }

    const asset = getStakingAsset(accountAssets, genesisHash);

    // filter already staked assets
    if ((asset?.soloTotal && !asset.soloTotal.isZero()) ||
      (asset?.pooledBalance && !asset.pooledBalance.isZero())) {
      return null;
    }

    return {
      ...chain,
      ...asset,
      chainName: sanitizeChainName(chain.name || '') ?? 'Unknown'
    } as unknown as PositionInfo;
  }).filter((item) => !!item);
}
