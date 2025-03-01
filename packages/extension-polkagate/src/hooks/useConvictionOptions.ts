// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

/**
 * @description
 * This hook will get and calculate the conviction options
 */

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';
import type { DropdownOption } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { CONVICTIONS } from '../fullscreen/governance/utils/consts';
import { calcBlockTime } from '../fullscreen/governance/utils/util';
import { useInfo, useTranslation } from '.';

export default function useConvictionOptions(address: string | AccountId | undefined, blockTime: BN | undefined): DropdownOption[] | undefined {
  const { t } = useTranslation();
  const { api, genesisHash } = useInfo(address);

  const [convictionOptions, setConvictionOptions] = useState<DropdownOption[] | undefined>();
  const [savedConvictionOptions, setSavedConvictionOptions] = useState<DropdownOption[] | undefined>();
  const voteLockingPeriod = api?.consts['convictionVoting']?.['voteLockingPeriod'] as BN | undefined;

  const getConvictionOptions = useCallback((blockTime: BN, voteLockingPeriod: BN, genesisHash: string) => {
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
      const last = res?.['Convictions'] || {};

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
      const convictions = res?.['Convictions']?.[genesisHash] as DropdownOption[] | undefined;

      if (convictions) {
        setSavedConvictionOptions(convictions);

        return;
      }

      setSavedConvictionOptions(undefined);
    });
  }, [genesisHash]);

  return convictionOptions ?? savedConvictionOptions;
}
