// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/* eslint-disable header/header */

// @ts-nocheck

import { hexToString } from '@polkadot/util';

import getApi from '../getApi.ts';

const convertId = (id) => ({
  display: hexToString(id.info.display.asRaw.toHex()),
  email: hexToString(id.info.email.asRaw.toHex()),
  // github: id.info.github && hexToString(id.info.github.asRaw.toHex()),
  judgements: id.judgements,
  legal: hexToString(id.info.legal.asRaw.toHex()),
  riot: hexToString(
    id.info.riot
      ? id.info.riot.asRaw.toHex()
      : id.info.matrix.asRaw.toHex()
  ),
  twitter: hexToString(id.info.twitter.asRaw.toHex()),
  web: hexToString(id.info.web.asRaw.toHex())
});

async function getAllValidatorsIdentities(endpoint, _accountIds) {
  try {
    const api = await getApi(endpoint);
    let accountInfo = [];
    let accountSubInfo = [];
    let mayHaveSubId = [];
    const page = 50;
    let totalFetched = 0;

    const currentEraIndex = api.query.staking?.currentEra && await api.query.staking?.currentEra();

    // get identity of validators if they have
    while (_accountIds.length > totalFetched) {
      console.log(`Fetching validators identities : ${totalFetched}/${_accountIds.length}`);
      const info = await Promise.all(
        _accountIds
          .slice(totalFetched, totalFetched + page)
          .map((i) =>
            api.query.identity.identityOf(i)
          ));

      const parsedInfo = info
        .map((i, index) => {
          const id = i.isSome ? i.unwrap()[0] : undefined;

          return id?.info
            ? {
              accountId: _accountIds[index + totalFetched],
              identity: convertId(id)
            }
            : undefined;
        })
        .filter((i) => !!i);

      const noIdentities = info
        .map((i, index) => i.isSome ? undefined : _accountIds[totalFetched + index])
        .filter((i) => !!i);

      mayHaveSubId = mayHaveSubId.concat(noIdentities);
      accountInfo = accountInfo.concat(parsedInfo);
      totalFetched += page;
    }

    // Fetch sub Id for validators which have not identity
    totalFetched = 0;

    while (mayHaveSubId.length > totalFetched) {
      console.log(`Fetching validators SUB identities : ${totalFetched}/${mayHaveSubId.length}`);
      const subInfo = await Promise.all(
        mayHaveSubId.slice(totalFetched, totalFetched + page)
          .map((i) =>
            api.query.identity.superOf(i)
          ));

      const parsedSubInfo = subInfo.map((i, index) => {
        const subId = i.isSome ? i.unwrap() : undefined;

        return subId
          ? {
            accountId: mayHaveSubId[index + totalFetched],
            display: hexToString(subId[1].asRaw.toHex()),
            parentAddress: subId[0].toString()
          }
          : undefined;
      }).filter((i) => !!i);

      accountSubInfo = accountSubInfo.concat(parsedSubInfo);
      totalFetched += page;
    }

    // get parent identity of validators who those have not identity but sub identity
    totalFetched = 0;

    while (accountSubInfo.length > totalFetched) {
      console.log(`Fetching validators PARENT identities : ${totalFetched}/${accountSubInfo.length}`);
      const parentInfo = await Promise.all(
        accountSubInfo.slice(totalFetched, totalFetched + page)
          .map((i) =>
            api.query.identity.identityOf(i.parentAddress)
          ));

      const parsedInfo = parentInfo.map((i, index) => {
        const id = i.isSome ? i.unwrap()[0] : undefined;

        return id?.info
          ? {
            accountId: accountSubInfo[index].accountId,
            identity: {
              ...convertId(id),
              display: accountSubInfo[index].display,
              displayParent: hexToString(id.info.display.asRaw.toHex())
            }
          }
          : undefined;
      }).filter((i) => !!i);

      accountInfo = accountInfo.concat(parsedInfo);
      totalFetched += page;
    }

    return {
      accountsInfo: JSON.parse(JSON.stringify(accountInfo)),
      eraIndex: Number(currentEraIndex?.toString() || '0')
    };
  } catch (error) {
    console.log('something went wrong while getting validators id, err:', error);

    return null;
  }
}

onmessage = (e) => {
  const { endpoint, validatorsAccountIds } = e.data;

  // eslint-disable-next-line no-void
  void getAllValidatorsIdentities(endpoint, validatorsAccountIds).then((info) => {
    postMessage(info);
  });
};
