// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Vote } from '../fullscreen/governance/post/myVote/util';

import { useCallback, useEffect, useState } from 'react';

import { getAddressVote } from '../fullscreen/governance/post/myVote/util';
import { useInfo } from '.';

export default function useMyVote(
  address: string | undefined,
  refIndex: number | string | undefined,
  trackId: number | string | undefined,
  refresh?: boolean,
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>
): Vote | null | undefined {
  const { api, formatted } = useInfo(address);

  const [vote, setVote] = useState<Vote | null | undefined>();

  const fetchVote = useCallback(async () => {
    try {
      if (formatted && api && refIndex !== undefined && trackId !== undefined) {
        const vote = await getAddressVote(String(formatted), api, Number(refIndex), Number(trackId));

        setVote(vote);
        setRefresh?.(false);
      }
    } catch (error) {
      console.error(error);
    }
  }, [api, formatted, refIndex, setRefresh, trackId]);

  useEffect(() => {
    fetchVote().catch(console.error);
  }, [fetchVote]);

  useEffect(() => {
    refresh && fetchVote().catch(console.error);
  }, [fetchVote, refresh]);

  return vote;
}
