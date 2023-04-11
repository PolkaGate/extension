// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Origins } from '../popup/governance/helpers';
import { useApi, useChainName } from '.';

export type Reciprocal = {
  factor: number,
  xOffset: number,
  yOffset: number
}

export type LinearDecreasing = {
  ceil: number,
  floor: number,
  length: number
}

export type Track = [
  id: number,
  info: {
    confirmPeriod: number,
    decisionDeposit: BN,
    decisionPeriod: number,
    maxDeciding: number,
    minApproval: {
      reciprocal: Reciprocal
    }
    minEnactmentPeriod: number,
    minSupport: {
      linearDecreasing: LinearDecreasing
    }
    name: Origins,
    preparePeriod: number
  }
]

export default function useTracks(address: string, api: ApiPromise | undefined): Track[] | undefined {
  const _api = useApi(address, api);
  const chainName = useChainName(address);
  const [savedTracks, setSavedTracks] = useState<string[]>([]);

  const tracks = useMemo(() => _api?.consts?.referenda?.tracks?.toJSON?.() as Track[], [_api]);

  useEffect(() => {
    if (tracks && chainName) {
      chrome.storage.local.set({ referendaTracks: { ...savedTracks, [chainName]: tracks } });
    }
  }, [tracks, chainName]);

  useEffect(() => {
    if (chainName && !tracks) {
      chrome.storage.local.get('referendaTracks', (res) => {
        setSavedTracks(res?.referendaTracks?.[chainName] || []);
      });
    }
  }, [chainName, tracks]);

  return tracks || savedTracks;
}
