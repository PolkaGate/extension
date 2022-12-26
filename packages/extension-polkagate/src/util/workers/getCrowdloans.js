// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import {
hexToBn,
hexToString
} from '@polkadot/util'

import {
  DEFAULT_IDENTITY
} from '../constants';
import getApi from '../getApi';

async function getIdentities(api, _address) {
  const identities = await api.query.identity.identityOf.multi(_address);

  const ids = identities.map((id) => {
    if (!id.toString()) {
      return DEFAULT_IDENTITY;
    }

    const jId = JSON.parse(id.toString());

    const info = {
      // 'judgements': [],
      //  'deposit':202580000000,
      info: {
        // 'additional':[],
        display: jId?.info?.display?.raw && hexToString(jId?.info?.display?.raw),
        legal: jId?.info?.legal?.raw && hexToString(jId?.info?.legal?.raw),
        web: jId?.info?.web?.raw && hexToString(jId?.info?.web?.raw),
        //  'riot':{'none':null},
        email: jId?.info?.email?.raw && hexToString(jId?.info?.email?.raw),
        //  'pgpFingerprint':null,
        //  'image':{'none':null},
        twitter: jId?.info?.twitter?.raw && hexToString(jId?.info?.twitter?.raw)
      }
    };

    return info;
  });

  return ids;
}

async function getCrowdloans(endpoint) {
  const api = await getApi(endpoint);

  console.log('getting crowdloans ...');
  const allParaIds = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);

  const [auctionInfo, auctionCounter, funds, leases, header] = await Promise.all([
    api.query.auctions.auctionInfo(),
    api.query.auctions.auctionCounter(),
    api.query.crowdloan.funds.multi(allParaIds),
    api.query.slots.leases.multi(allParaIds),
    api.rpc.chain.getHeader()
  ]);

  const parsedInfo = auctionInfo.isSome ? JSON.parse(auctionInfo.toString()) : null;
  const auctionEndBlock = parsedInfo ? parsedInfo[1] : null;
  const currentBlock = Number(header?.number ?? 0);
  const blockOffset = auctionEndBlock && currentBlock ? currentBlock - auctionEndBlock + 1 : 0;

  const hasLease = [];

  leases.forEach((lease, index) => {
    if (lease.length) {
      hasLease.push(allParaIds[index].toString());
    }
  }
  );

  const fundsWithParaId = funds.map((fund, index) => {
    if (fund.toString()) {
      const jpFund = JSON.parse(fund.toString());

      jpFund.raised = hexToBn(jpFund.raised).toString();
      jpFund.cap = hexToBn(jpFund.cap).toString();
      jpFund.deposit = (jpFund.deposit).toString();
      jpFund.paraId = String(allParaIds[index]);
      jpFund.hasLeased = hasLease.includes(jpFund.paraId);

      return jpFund;
    }

    return null;
  });
  const nonEmtyFunds = fundsWithParaId.filter((fund) => fund);
  const depositors = nonEmtyFunds.map((d) => d.depositor);

  const identities = await getIdentities(api, depositors);
  const crowdloansWithIdentity = nonEmtyFunds.map((fund, index) => {
    return {
      fund,
      identity: identities[index]
    };
  });

  const winning = blockOffset > 1 ? await api.query.auctions.winning(blockOffset) : undefined;
  console.log('winning :', winning?.toString() ? Array.from(winning.toHuman()):'');

  return {
    auctionCounter: Number(auctionCounter),
    auctionInfo: auctionInfo.toString() ? JSON.parse(auctionInfo.toString()) : null,
    // blockchain: _chainName,
    crowdloans: crowdloansWithIdentity,
    currentBlockNumber: Number(String(header.number)),
    minContribution: api.consts.crowdloan.minContribution.toString(),
    winning:
      // winning.toString() ? Array.from(winning.toHuman()) :
      []
  };
}

onmessage = (e) => {
  const {
    endpoint
  } = e.data;


  // eslint-disable-next-line no-void
  void getCrowdloans(endpoint).then((crowdloans) => {
    // console.log('crowdloans in worker',crowdloans);
    postMessage(crowdloans);
  });
};
