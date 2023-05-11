// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { getAddressVote, Vote } from '../popup/governance/post/myVote/util';
import { ReferendumSubScan } from '../popup/governance/utils/types';
import { useApi, useFormatted } from '.';

export default function useMyVote (address: string | undefined, referendumInfo: ReferendumSubScan | undefined): Vote | null | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const [vote, setVote] = useState<Vote | null | undefined>();
  const [alreadyFetched, setFetched] = useState<[address: string, refIndex: number] | undefined>();

  const refIndexAndId = useMemo(() => (referendumInfo ? { refIndex: referendumInfo.referendum_index, trackId: referendumInfo.origins_id } : undefined), [referendumInfo]);

  const getVote = useCallback((formatted: string, api: ApiPromise, refIndexAndId: { refIndex: number; trackId: number; }) => {
    getAddressVote(formatted, api, refIndexAndId.refIndex, refIndexAndId.trackId).then((vote) => {
      setVote(vote);
      setFetched([formatted, refIndexAndId.refIndex]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    formatted && api && refIndexAndId?.refIndex !== undefined && refIndexAndId?.trackId !== undefined && getVote(String(formatted), api, refIndexAndId);
  }, [api, formatted, getVote, refIndexAndId, refIndexAndId?.refIndex, refIndexAndId?.trackId]);

  useEffect(() => {
    if (alreadyFetched === undefined || !refIndexAndId || (address !== alreadyFetched[0] && refIndexAndId.refIndex !== alreadyFetched[1])) {
      setVote(undefined);
    }
  }, [address, alreadyFetched, refIndexAndId]);

  return vote;
}
