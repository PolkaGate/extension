// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NOTIFICATION_GOVERNANCE_CHAINS, REFERENDA_COUNT_TO_TRACK_DOT, REFERENDA_COUNT_TO_TRACK_KSM, REFERENDA_STATUS } from '../../../popup/notification/constant';
import { STORAGE_KEY } from '../../constants';
import { isMigratedHub, isMigratedRelay } from '../../migrateHubUtils';

// interface ReferendaDeposit {
//   who: string;
//   amount: number;
// }
// interface Referenda {
//   approved?: [number, null, null];
//   timedOut?: [number, ReferendaDeposit, null];
//   rejected?: [number, ReferendaDeposit, null];
//   cancelled?: [number, ReferendaDeposit, null];
//   ongoing?: {
//    submissionDeposit: ReferendaDeposit;
//    decisionDeposit: ReferendaDeposit | null;
//    deciding: boolean | null;
//  };
// }

const getRefStatus = (/** @type {{ [x: string]: any; }} */ item) => {
  for (const status of REFERENDA_STATUS) {
    if (item[status]) {
      return status;
    }
  }

  return 'ongoing';
};

/**
 * @param {import('@polkadot/api').ApiPromise} api
 * @param {string} chainName
 * @param {MessagePort} port
 */
export async function newRefNotif (api, chainName, port) {
  if (!NOTIFICATION_GOVERNANCE_CHAINS.includes(chainName)) {
    return undefined;
  }

  const genesisHash = api.genesisHash.toHex();

  // Determine whether to fetch data from the hub chain or the relay chain.
  // - If the given genesisHash belongs to a migrated relay chain, return undefined,
  //   because the data should instead be fetched from its corresponding hub chain.
  // - If the genesisHash is not a migrated hub chain, return undefined as well,
  //   since in that case the data should still be fetched from the relay chain.
  const isMigratedRelayChain = isMigratedRelay(genesisHash);
  const isMigratedHubChain = isMigratedHub(genesisHash);

  if (isMigratedRelayChain || !isMigratedHubChain) {
    return undefined;
  }

  const isDot = chainName.toLowerCase().includes('polkadot');

  const latestRefId = Number((await api.query['referenda']['referendumCount']()).toPrimitive());

  const referendaInfoRequests = Array.from({ length: isDot ? REFERENDA_COUNT_TO_TRACK_DOT : REFERENDA_COUNT_TO_TRACK_KSM }, (_, index) =>
    api.query['referenda']['referendumInfoFor'](latestRefId - (index + 1)));

  const referendaInfo = await Promise.all(referendaInfoRequests);

  const info = referendaInfo.map((item, index) => {
    const status = getRefStatus(item);

    return {
      refId: latestRefId - index,
      status
    };
  });

  const message = {
    functionName: STORAGE_KEY.NOTIFICATIONS,
    message: {
      chainGenesis: api.genesisHash.toHex(),
      data: info,
      type: 'referenda'
    }
  };

  // console.log('message sent :', JSON.stringify(message));
  port.postMessage(JSON.stringify(message));
}
