// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getAddressVote, Vote } from '../popup/governance/post/myVote/util';
import { useApi, useFormatted } from '.';

export default function useMyVote(
  address: string | undefined,
  refIndex: number | string | undefined,
  trackId: number | string | undefined,
  refresh?: boolean,
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>
): Vote | null | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const [vote, setVote] = useState<Vote | null | undefined>();

  useEffect(() => {
    const fetchVote = async () => {
      try {
        if (formatted && api && refIndex !== undefined && trackId !== undefined) {
          const vote = await getAddressVote(String(formatted), api, Number(refIndex), Number(trackId));

          setVote(vote);
          setRefresh && setRefresh(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchVote();
  }, [api, formatted, refIndex, trackId, refresh, setRefresh]);

  return vote;
}
