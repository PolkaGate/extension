// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { getAddressVote, Vote } from '../popup/governance/post/myVote/util';
import { useApi, useFormatted } from '.';

export default function useMyVote(address: string | undefined, refIndex: number | undefined, trackId: number | undefined): Vote | null | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const [vote, setVote] = useState<Vote | null | undefined>();
  const [alreadyFetched, setFetched] = useState<[address: string, referendum_index: number] | undefined>();

  const getVote = useCallback((formatted: string, api: ApiPromise, refIndex: number, trackId: number) => {
    getAddressVote(formatted, api, refIndex, trackId).then((vote) => {
      setVote(vote);
      setFetched([formatted, refIndex]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    formatted && api && refIndex !== undefined && trackId !== undefined && getVote(String(formatted), api, refIndex, trackId);
  }, [api, formatted, getVote, refIndex, trackId]);

  useEffect(() => {
    if (alreadyFetched === undefined || !refIndex || trackId === undefined || formatted !== alreadyFetched[0] || refIndex !== alreadyFetched[1]) {
      setVote(undefined);
    }
  }, [alreadyFetched, formatted, refIndex, trackId]);

  return vote;
}
