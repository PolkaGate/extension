// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { useApi, useChainName } from '.';

export default function useTracks(address: string, api: ApiPromise | undefined): undefined | string[] {
  const _api = useApi(address, api);
  const chainName = useChainName(address);
  const [savedTracks, setSavedTracks] = useState<undefined | string[]>();

  const tracks = useMemo(() => _api && _api.consts.referenda && JSON.parse(JSON.stringify(_api.consts.referenda.tracks)), [_api]);

  useEffect(() => {
    tracks && chainName && chrome.storage.local.get('referendaTracks', (res) => {
      const k = `${chainName}`;
      const saved = res?.referendaTracks || {};

      saved[k] = tracks;

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ referendaTracks: saved });
    });
  }, [chainName, tracks]);

  useEffect(() => {
    chainName && chrome.storage.local.get('referendaTracks', (res) => {
      console.log('referendaTracks in local storage:', res);

      if (res?.referendaTracks?.[chainName] !== undefined) {
        setSavedTracks(res.referendaTracks[chainName]);
      }
    });
  }, [chainName]);

  return tracks || savedTracks;
}
