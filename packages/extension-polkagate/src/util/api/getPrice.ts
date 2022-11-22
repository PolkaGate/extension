// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { Chain } from '@polkadot/extension-chains/types';

export async function getPrice(chain: Chain, currency = 'usd'): Promise<number> {
  const chainName = chain.name.replace(' Relay Chain', '')?.replace(' Network', '');

  if (chainName === 'Westend') {
    return 0;
  }

  const price = await getReq(`https://api.coingecko.com/api/v3/simple/price?ids=${chainName}&vs_currencies=${currency}`, {});

  return price[chainName.toLocaleLowerCase()]?.usd ?? 0;
}

function getReq(api: string, data: Record<string, any> = {}, option?: Record<string, any>): Promise<Record<string, any>> {
  return request.get(api, {
    data,
    ...option
  });
}
