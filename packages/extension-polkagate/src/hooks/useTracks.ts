// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaTrackInfo } from '@polkadot/types/lookup';

import { useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { useApi, useChainName } from '.';

export type Tracks = {
  id: number,
  info: PalletReferendaTrackInfo
}

export default function useTracks(address: string, api: ApiPromise | undefined): Tracks[] | undefined {
  const _api = useApi(address, api);
  const chainName = useChainName(address);
  const [savedTracks, setSavedTracks] = useState<string[]>([]);

  const tracks = useMemo(() => {
    return _api?.consts?.referenda?.tracks as unknown as Tracks[];

    // if (tracks) {
    //   const jTracks = tracks.toJSON() as Track[];
    //   const trackInfo = tracks.map((t, index) => {
    //     jTracks[index][1].minApproval[isLinearDecreasing] = t.info.minApproval.isLinearDecreasing
    //     return jTracks[index]
    //   }
    //   )
    // }
    // return undefined;
  }, [_api]);

  useEffect(() => {
    if (tracks && chainName) {
      chrome.storage.local.set({ referendaTracks: { ...savedTracks, [chainName]: tracks } });
    }
  }, [tracks, chainName, savedTracks]);

  useEffect(() => {
    if (chainName && !tracks) {
      chrome.storage.local.get('referendaTracks', (res) => {
        setSavedTracks(res?.referendaTracks?.[chainName] || []);
      });
    }
  }, [chainName, tracks]);

  return tracks ;//|| savedTracks;
}
