// Copyright 2019-2026@polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { subscanQueue } from '../class/subscanQueue';

export async function postReq<T>(
  api: string,
  data: Record<string, unknown> = {},
  option?: Record<string, unknown>
): Promise<T> {
  return await request.post(api, { data, ...option }) as T;
}

export async function fetchFromSubscan<T>(url: string, options?: Record<string, unknown>): Promise<T> {
  return subscanQueue.enqueue<T>(async () => {
    const response = await postReq<T>(url, options);

    return response;
  });
}
