// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import getApi from '../getApi.ts';

async function getAllValidatorsIdentities(endpoint, _accountIds) {
  try {
    const api = await getApi(endpoint);
    let accountInfo = [];
    const page = 50;
    let totalFetched = 0;

    const currentEraIndex = await api.query.staking.currentEra();

    while (_accountIds.length > totalFetched) {
      console.log(`Fetching validators identities : ${totalFetched}/${_accountIds.length}`)
      const info = await Promise.all(
        _accountIds.slice(totalFetched, totalFetched + page)
          .map((i) =>
            api.derive.accounts.info(i)
          ));

      accountInfo = accountInfo.concat(info);
      totalFetched += page;
    }

    return {
      accountsInfo: JSON.parse(JSON.stringify(accountInfo)),
      eraIndex: Number(currentEraIndex.toString() || '0')
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
