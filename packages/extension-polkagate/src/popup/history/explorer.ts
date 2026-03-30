// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getSubscanChainName } from '@polkadot/extension-polkagate/src/util';
import { SUBSCAN_CHAINS_ENDPOINT } from '@polkadot/extension-polkagate/src/util/subscanChains';

type linkType = 'account' | 'extrinsic' | 'extrinsics' | 'extrinsicApi' | 'total_reward' | 'transfers' | 'reward_slash' | 'pool_rewards';

export function getLink(chainName: string | undefined, type: linkType = 'extrinsic', data?: string): { link: string | undefined, name: string | undefined, } {
  if (chainName?.toLowerCase() === 'ethereum') {
    return { link: 'https://etherscan.io/tx/' + String(data), name: 'etherscan' };
  }

  const subscanChainName = getSubscanChainName(chainName) as keyof typeof SUBSCAN_CHAINS_ENDPOINT | undefined;

  switch (type) {
    case 'extrinsic': {
      const endpoint = subscanChainName ? SUBSCAN_CHAINS_ENDPOINT[subscanChainName] : undefined;

      return { link: 'https://' + endpoint + '/extrinsic/' + String(data), name: 'subscan' };
    }

    case 'account': {
      const pre = subscanChainName ?? 'portfolio';

      return { link: `https://${pre}.subscan.io/account/` + String(data), name: 'subscan' };
    }

    case 'extrinsicApi':
      return { link: `https://${subscanChainName}.api.subscan.io/api/scan/extrinsic`, name: 'subscan' };

    case 'extrinsics':
      return { link: `https://${subscanChainName}.api.subscan.io/api/v2/scan/extrinsics`, name: 'subscan' };

    case 'pool_rewards':
      return { link: `https://${subscanChainName}.api.subscan.io/api/scan/nomination_pool/rewards`, name: 'subscan' };

    case 'reward_slash':
      return { link: `https://${subscanChainName}.api.subscan.io/api/v2/scan/account/reward_slash`, name: 'subscan' };

    case 'total_reward':
      return { link: `https://${subscanChainName}.api.subscan.io/api/scan/staking/total_reward`, name: 'subscan' };

    case 'transfers':
      return { link: `https://${subscanChainName}.api.subscan.io/api/v2/scan/transfers`, name: 'subscan' };

    default:
      return { link: undefined, name: undefined };
  }
}
