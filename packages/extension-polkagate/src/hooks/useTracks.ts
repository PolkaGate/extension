// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { useApi, useChainName } from '.';

export default function useTracks(address: string, api: ApiPromise | undefined): string[] | undefined {
  const _api = useApi(address, api);
  const chainName = useChainName(address);
  const [savedTracks, setSavedTracks] = useState<string[]>();

  const tracks = useMemo(() => _api?.consts?.referenda?.tracks?.toJSON?.(), [_api]);

  useEffect(() => {
    if (tracks && chainName) {
      chrome.storage.local.get('referendaTracks', (res) => {
        const saved = res || {};

        saved[chainName] = tracks;
        chrome.storage.local.set({ referendaTracks: saved });
      });
    }
  }, [tracks, chainName]);

  useEffect(() => {
    if (chainName) {
      chrome.storage.local.get('referendaTracks', (res) => {
        setSavedTracks(res?.referendaTracks?.[chainName]);
      });
    }
  }, [chainName]);

  console.log('tracks || savedTracks:', tracks || savedTracks);
  
  return tracks || savedTracks;
}
