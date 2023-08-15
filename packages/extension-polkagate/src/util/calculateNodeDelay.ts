// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const timeout = async (ms: number) => {
  await sleep(ms);

  return ms;
};

const fetchApiTime = async (api: ApiPromise | undefined) => {
  const startTime = Date.now();

  // eslint-disable-next-line no-unmodified-loop-condition
  while (!api) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    await api.rpc.system.chain();
  } catch (e) {
    return 10000;
  }

  const endTime = Date.now();

  return endTime - startTime;
};

async function CalculateNodeDelay(endpoint: string | undefined) {
  const TIMEOUT = 10000;

  const wsProvider = new WsProvider(endpoint);

  const api = await ApiPromise.create({ provider: wsProvider });
  const delay = await Promise.race([fetchApiTime(api), timeout(TIMEOUT)]);

  return { api, delay };
}

export default CalculateNodeDelay;
