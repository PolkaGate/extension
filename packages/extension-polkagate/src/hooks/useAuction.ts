// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Auction } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { hexToBn } from '@polkadot/util';

import { useApi, useToken } from '.';

export default function useAuction(address: string): Auction | null | undefined {
  const api = useApi(address);
  const [auction, setAuction] = useState<Auction | null>();
  const currentToken = useToken(address);

  const getCrowdloans = useCallback(async (api: ApiPromise) => {
    console.log('Getting crowdloans ...');
    const allParaIds = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);

    const [auctionInfo, auctionCounter, funds, leases, header, token] = await Promise.all([
      api.query.auctions.auctionInfo(),
      api.query.auctions.auctionCounter(),
      api.query.crowdloan.funds.multi(allParaIds),
      api.query.slots.leases.multi(allParaIds),
      api.rpc.chain.getHeader(),
      api.registry.chainTokens[0]
    ]);

    const parsedInfo = auctionInfo.isSome ? JSON.parse(auctionInfo.toString()) : null;
    const auctionEndBlock = parsedInfo ? parsedInfo[1] : null;
    const currentBlock = Number(header?.number ?? 0);
    const blockOffset = auctionEndBlock && currentBlock ? currentBlock - auctionEndBlock + 1 : 0;

    const hasLease = [];

    leases.forEach((lease, index) => {
      if (lease?.length) {
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
    const nonEmptyFunds = fundsWithParaId.filter((fund) => fund);
    const crowdloansWithIdentity = nonEmptyFunds.map((fund) => {
      return {
        fund
      };
    });

    const winning = blockOffset > 1 ? await api.query.auctions.winning(blockOffset) : undefined;

    console.log('winning :', winning?.toString() ? Array.from(winning.toHuman()) : '');

    return {
      auctionCounter: Number(auctionCounter),
      auctionInfo: auctionInfo?.toString() ? JSON.parse(auctionInfo.toString()) : null,
      // blockchain: _chainName,
      crowdloans: crowdloansWithIdentity,
      currentBlockNumber: Number(String(header.number)),
      minContribution: api.consts.crowdloan.minContribution.toString(),
      token,
      winning:
        // winning.toString() ? Array.from(winning.toHuman()) :
        []
    };
  }, []);

  useEffect(() => {
    api && getCrowdloans(api).then((fetchedAuction) => {
      setAuction(fetchedAuction);
    });
  }, [api, getCrowdloans]);

  return auction && auction.token === currentToken
    ? auction
    : undefined;
}
