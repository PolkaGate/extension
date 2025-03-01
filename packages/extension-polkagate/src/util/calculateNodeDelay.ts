// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

const WORST_CASE_DELAY = 10000;

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const timeout = async (ms: number) => {
  await sleep(ms);

  return ms;
};

const fetchApiTime = async (api: ApiPromise, endpoint: string) => {
  const startTime = Date.now();

  try {
    const health = await api.rpc.system.health();

    console.info(`${endpoint} health check:`, health.toHuman());
  } catch (error) {
    console.error('Failed to fetch api:', error);

    return WORST_CASE_DELAY;
  }

  const endTime = Date.now();

  return endTime - startTime;
};

async function CalculateNodeDelay(endpoint: string | undefined) {
  if (!endpoint?.startsWith('wss')) {
    return;
  }

  const wsProvider = new WsProvider(endpoint);

  const api = await ApiPromise.create({ provider: wsProvider });
  const delay = await Promise.any([fetchApiTime(api, endpoint), timeout(WORST_CASE_DELAY)]);

  return { api, delay, endpoint };
}

export default CalculateNodeDelay;
