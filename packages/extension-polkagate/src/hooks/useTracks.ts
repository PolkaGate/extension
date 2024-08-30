// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Track } from '../fullscreen/governance/utils/types';

import { useMemo } from 'react';

import { useApi, useChain } from '.';

interface TracksType { fellowshipTracks: Track[] | undefined, tracks: Track[] | undefined }

export default function useTracks (address: string | undefined): TracksType {
  const api = useApi(address);
  const chain = useChain(address);
  // const chainName = useChainName(address);
  // const [savedTracks, setSavedTracks] = useState<string[]>([]);

  const tracks: TracksType = useMemo(() => {
    if (chain?.genesisHash !== api?.genesisHash?.toString()) {
      return {
        fellowshipTracks: undefined,
        tracks: undefined
      };
    }

    return {
      fellowshipTracks: api?.consts?.['fellowshipReferenda']?.['tracks'] as unknown as Track[],
      tracks: api?.consts?.['referenda']?.['tracks'] as unknown as Track[]
    };
  }, [api, chain?.genesisHash]);

  // useEffect(() => {
  //   if (api && chainName && newTracks) {
  //     chrome.storage.local.get('tracks', (res) => {
  //       const k = `${chainName}`;
  //       const last = res?.tracks ?? {};

  //       last[k] = JSON.parse(JSON.stringify(newTracks));

  //       // eslint-disable-next-line no-void
  //       void chrome.storage.local.set({ tracks: last });
  //     });
  //   }
  // }, [chainName, savedTracks, api, newTracks]);

  // useEffect(() => {
  //   if (chainName && !newTracks?.tracks) {
  //     chrome.storage.local.get('tracks', (res) => {

  //       console.log('res:', res)
  //       setSavedTracks(res?.tracks?.[chainName]);
  //     });
  //   }
  // }, [chainName, newTracks]);

  return tracks;// || savedTracks;
}
