// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/* eslint-disable header/header */

/**
 * @description
 * This hook will get and calculate the conviction options
 */

import { TFunction } from '@polkagate/apps-config/types';
import { useCallback, useEffect, useState } from 'react';

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { CONVICTIONS } from '../fullscreen/governance/utils/consts';
import { calcBlockTime } from '../fullscreen/governance/utils/util';
import useApi from './useApi';
import useChain from './useChain';

export default function useConvictionOptions(address: string | AccountId | undefined, blockTime: BN | undefined, t: TFunction): { text: string; value: number }[] | undefined {
  const [convictionOptions, setConvictionOptions] = useState<{ text: string; value: number }[] | undefined>();
  const [savedConvictionOptions, setSavedConvictionOptions] = useState<{ text: string; value: number }[] | undefined>();
  const genesisHash = useChain(address)?.genesisHash;
  const api = useApi(address);
  const voteLockingPeriod = api && api.consts.convictionVoting?.voteLockingPeriod;

  const getConvictionOptions = useCallback((blockTime, voteLockingPeriod, genesisHash) => {
    const options = [
      { text: t('0.1x voting balance, no lockup period'), value: 0.1 },
      ...CONVICTIONS.map(([value, duration, durationBn]): { text: string; value: number } => ({
        text: t('{{value}}x voting balance, locked for {{duration}}x duration{{period}}', {
          replace: {
            duration,
            period: voteLockingPeriod && voteLockingPeriod.gt(BN_ZERO)
              ? ` (${calcBlockTime(blockTime, durationBn.mul(voteLockingPeriod), t)[1]})`
              : '',
            value
          }
        }),
        value
      }))
    ];

    // eslint-disable-next-line no-void
    chrome.storage.local.get('Convictions', (res) => {
      const k = `${genesisHash}`;
      const last = res?.Convictions || {};

      last[k] = options;

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ Convictions: last });
    });

    setConvictionOptions(options);
  }, [t]);

  useEffect(() => {
    if (!blockTime || !voteLockingPeriod || !genesisHash) {
      return;
    }

    getConvictionOptions(blockTime, voteLockingPeriod, genesisHash);
  }, [blockTime, genesisHash, getConvictionOptions, voteLockingPeriod]);

  useEffect(() => {
    if (!genesisHash) {
      return;
    }

    /** load Convictions from storage */
    chrome.storage.local.get('Convictions', (res) => {
      // console.log('ConvictionOptions in local storage:', res);

      if (res?.Convictions?.[genesisHash]) {
        setSavedConvictionOptions(res.Convictions[genesisHash]);

        return;
      }

      setSavedConvictionOptions(undefined);
    });
  }, [genesisHash]);

  return convictionOptions ?? savedConvictionOptions;
}
