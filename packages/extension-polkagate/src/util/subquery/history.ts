// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { MAX_HISTORY_RECORD_TO_SHOW } from '../constants';
import { SubQueryHistory } from '../types';
import { getUrl, postReq } from './util';

/** reward is filtered while fetching history */
export async function getHistory(chainName: string, address: string | AccountId): Promise<SubQueryHistory[]> {
  const url = getUrl(chainName);

  const query = `query {
  historyElements(
    last:${MAX_HISTORY_RECORD_TO_SHOW}  ,
     filter: {
      address:{equalTo:"${String(address)}"},
      reward:{isNull:true}
      }
    ) {
      nodes {
        id
        blockNumber
        extrinsicIdx
        extrinsicHash
        timestamp
        address
        reward
        extrinsic
        transfer
        assetTransfer
      }
  }
}`;
  const res = await postReq(url, { query });

  console.log('getHistory from subquery:', res.data.historyElements.nodes);

  return res.data.historyElements.nodes as unknown as SubQueryHistory[];
}
