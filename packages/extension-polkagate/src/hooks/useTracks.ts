// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { Track } from '../popup/governance/utils/types';
import { useApi, useChainName } from '.';

export default function useTracks(address: string | undefined): Track[] | undefined {
  const api = useApi(address);
  const chainName = useChainName(address);
  const [savedTracks, setSavedTracks] = useState<string[]>([]);

  const tracks = useMemo(() => {
    return api?.consts?.referenda?.tracks as unknown as Track[];
  }, [api]);

  // useEffect(() => {
  //   if (tracks && chainName) {
  //     chrome.storage.local.set({ referendaTracks: { ...savedTracks, [chainName]: tracks } });
  //   }
  // }, [tracks, chainName, savedTracks]);

  // useEffect(() => {
  //   if (chainName && !tracks) {
  //     chrome.storage.local.get('referendaTracks', (res) => {
  //       setSavedTracks(res?.referendaTracks?.[chainName] || []);
  //     });
  //   }
  // }, [chainName, tracks]);

  return tracks;//|| savedTracks;
}
