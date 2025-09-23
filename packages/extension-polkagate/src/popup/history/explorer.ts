// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getSubscanChainName } from '@polkadot/extension-polkagate/src/util';
import { CHAINS_ON_POLKAHOLIC } from '@polkadot/extension-polkagate/src/util/constants';

export function getLink (chainName: string, type: 'account' | 'extrinsic' = 'extrinsic', data: string): {link: string | undefined, name: string | undefined, } {
  if (type === 'extrinsic') {
    const maybeTheFirstPartOfChain = chainName?.split(' ')?.[0];

   const explorer = CHAINS_ON_POLKAHOLIC.includes(chainName ?? '') ? 'polkaholic' : 'subscan';

    switch (explorer) {
      case 'subscan':
        {
          const adjustedName = getSubscanChainName(chainName);

          return { link: 'https://' + adjustedName + '.subscan.io/extrinsic/' + String(data), name: 'subscan' }; // data here is txHash
        }

      case 'polkaholic':
        return { link: 'https://' + maybeTheFirstPartOfChain + '.polkaholic.io/tx/' + String(data), name: 'polkaholic' };

      // case 'statscan':
      //   return 'https://westmint.statescan.io/#/accounts/' + String(data); // NOTE, data here is formatted address
    }
  }

  return { link: undefined, name: undefined };
}
