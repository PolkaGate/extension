// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getSubscanChainName } from '@polkadot/extension-polkagate/src/util';
import { SUBSCAN_CHAINS_ENDPOINT } from '@polkadot/extension-polkagate/src/util/subscanChains';

type linkType = 'account' | 'extrinsic' | 'extrinsics' | 'extrinsicApi' | 'total_reward' | 'transfers' | 'reward_slash' | 'pool_rewards';

const DEFAULT_OUTPUT = { link: undefined, name: undefined };

export function getLink(chainName: string | undefined, type: linkType = 'extrinsic', data?: string): { link: string | undefined, name: string | undefined, } {
  if (chainName?.toLowerCase() === 'ethereum') {
    return { link: 'https://etherscan.io/tx/' + String(data), name: 'etherscan' };
  }

  const subscanChainName = getSubscanChainName(chainName) as keyof typeof SUBSCAN_CHAINS_ENDPOINT | undefined;
  const apiHost = subscanChainName ? `https://${subscanChainName}.api.subscan.io` : undefined;

  switch (type) {
    case 'extrinsic': {
      const endpoint = subscanChainName ? SUBSCAN_CHAINS_ENDPOINT[subscanChainName] : undefined;

      return endpoint && data
        ? { link: `https://${endpoint}/extrinsic/${data}`, name: 'subscan' }
        : DEFAULT_OUTPUT;
    }

    case 'account': {
      const pre = subscanChainName ?? 'portfolio';

      return data
        ? { link: `https://${pre}.subscan.io/account/${data}`, name: 'subscan' }
        : DEFAULT_OUTPUT;
    }

    case 'extrinsicApi':
      return apiHost ? { link: `${apiHost}/api/scan/extrinsic`, name: 'subscan' } : DEFAULT_OUTPUT;

    case 'extrinsics':
      return apiHost ? { link: `${apiHost}/api/v2/scan/extrinsics`, name: 'subscan' } : DEFAULT_OUTPUT;

    case 'pool_rewards':
      return apiHost ? { link: `${apiHost}/api/scan/nomination_pool/rewards`, name: 'subscan' } : DEFAULT_OUTPUT;

    case 'reward_slash':
      return apiHost ? { link: `${apiHost}/api/v2/scan/account/reward_slash`, name: 'subscan' } : DEFAULT_OUTPUT;

    case 'total_reward':
      return apiHost ? { link: `${apiHost}/api/scan/staking/total_reward`, name: 'subscan' } : DEFAULT_OUTPUT;

    case 'transfers':
      return apiHost ? { link: `${apiHost}/api/v2/scan/transfers`, name: 'subscan' } : DEFAULT_OUTPUT;

    default:
      return DEFAULT_OUTPUT;
  }
}
