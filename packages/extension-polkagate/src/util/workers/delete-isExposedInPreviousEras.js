// Copyright 2019-2023 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import getApi from '../getApi';

async function isExposedInPreviousEras(endpoint, stakerAddress) {
  console.log(`Checking fastUnstake eligibility for ${stakerAddress}`);
  const api = await getApi(endpoint);

  const erasToCheck = (await api.query.fastUnstake.erasToCheckPerBlock()).toNumber();

  if (!erasToCheck) {
    return undefined;
  }

  const currentEra = (await api.query.staking.currentEra()).unwrap();

  const erasStakers = await Promise.all(
    [...Array(erasToCheck)].map((_, i) =>
      api.query.staking.erasStakers.entries(currentEra - i)
    )
  );

  return !!erasStakers.flat().map((x) => x[1].others).flat().find((x) => String(x.who) === stakerAddress);
}

onmessage = (e) => {
  const { endpoint, stakerAddress } = e.data;

  // eslint-disable-next-line no-void
  void isExposedInPreviousEras(endpoint, stakerAddress).then((isExposed) => {
    postMessage(isExposed);
  });
};
