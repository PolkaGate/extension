// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';
// @ts-ignore
import type { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import type { AnyJson } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { AllValidators, Other, ValidatorInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { AUTO_MODE } from '../util/constants';
import { useCurrentEraIndex, useInfo } from '.';

export interface ExposureOverview {
  total: BN;
  own: BN
  nominatorCount: BN;
  pageCount: BN;
}
export interface Prefs {
  commission: number;
  blocked: boolean;
}

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain, which the address is already tied with.
 */

export default function useValidators(address: string | undefined, validators?: AllValidators): AllValidators | null | undefined {
  const { api, chain, chainName, endpoint } = useInfo(address);
  const currentEraIndex = useCurrentEraIndex(address); // TODO: Should we use active era index?

  const [info, setValidatorsInfo] = useState<AllValidators | undefined | null>();
  const [newInfo, setNewValidatorsInfo] = useState<AllValidators | undefined | null>();

  const saveValidatorsInfoInStorage = useCallback((inf: AllValidators) => {
    if (!chainName) {
      return;
    }

    chrome.storage.local.get('validatorsInfo', (res) => {
      const k = `${chainName}`;
      const last = res?.['validatorsInfo'] as Record<string, unknown> ?? {};

      last[k] = inf;
      chrome.storage.local.set({ validatorsInfo: last }).catch(console.error);
    });
  }, [chainName]);

  const getValidatorsInfo = useCallback((endpoint: string, savedValidators?: AllValidators | null) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../util/workers/getValidatorsInfo.js', import.meta.url));

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: AllValidators | null = e.data;

      if (info && JSON.stringify(savedValidators || {}) !== JSON.stringify(info)) {
        setNewValidatorsInfo(info);
        saveValidatorsInfoInStorage(info);
      }

      getValidatorsInfoWorker.terminate();
    };
  }, [saveValidatorsInfoInStorage]);

  useEffect(() => {
    if (!chainName || !api) {
      return;
    }

    /** We don't save paged eraStakers in storage,
     *  saving will be stopped after Polkadot runtime upgrade
     * */
    if (api.query['staking']['erasStakersPaged']) {
      return;
    }

    chrome.storage.local.get('validatorsInfo', (res) => {
      const maybeValidatorInfo = res?.['validatorsInfo'] as Record<string, AllValidators>;

      if (maybeValidatorInfo?.[chainName]) {
        setValidatorsInfo(maybeValidatorInfo[chainName]);
      }
    });
  }, [api, chainName]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (validators) {
      setNewValidatorsInfo(validators);

      return;
    }

    const getValidatorsPaged = async (eraIndex: number) => {
      if (!api || !currentEraIndex) {
        return; // never happens since we check api before, but to suppress linting
      }

      const [prefs, overview] = await Promise.all([
        api.query['staking']['validators'].entries(),
        api.query['staking']['erasStakersOverview'].entries(eraIndex)
      ]);

      const validatorPrefs: Record<string, PalletStakingValidatorPrefs> = Object.fromEntries(
        prefs.map(([key, value]) => {
          const validatorAddress = key.toHuman() as string;

          return [validatorAddress, value as PalletStakingValidatorPrefs];
        }));

      const currentEraValidatorsOverview = Object.fromEntries(
        overview.map(([keys, value]) => {
          const validatorAddress = (keys.toHuman() as AnyJson[])[1] as string;
          const { nominatorCount, own, pageCount, total } = (value as Option<any>).unwrap() as ExposureOverview;

          return [validatorAddress, { nominatorCount, own, pageCount, total }];
        }));

      const validatorKeys = Object.keys(currentEraValidatorsOverview);

      const validatorsPaged = await Promise.all(
        validatorKeys.map((v) =>
          api.query['staking']['erasStakersPaged'].entries(eraIndex, v)
        )
      );

      const currentNominators: Record<string, Other[]> = {};

      validatorsPaged.forEach((pages) => {
        if (pages[0]) {
          const validatorAddress = pages[0][0].args[1].toString();

          currentNominators[validatorAddress] = [];

          pages.forEach(([, value]) => currentNominators[validatorAddress].push(...((value as Option<any>).unwrap()?.others || [])));
        }
      });

      const current: ValidatorInfo[] = [];
      const waiting: ValidatorInfo[] = [];

      for (const v of Object.keys(validatorPrefs)) {
        if (Object.keys(currentEraValidatorsOverview).includes(v)) {
          // const apy = await getValidatorApy(api, v, currentEraValidatorsOverview[v].total, validatorPrefs[v].commission, currentEraIndex);

          current.push(
            {
              accountId: v as unknown as AccountId,
              // apy,
              exposure: {
                ...currentEraValidatorsOverview[v],
                others: currentNominators[v]
              },
              stashId: v as unknown as AccountId,
              validatorPrefs: validatorPrefs[v]
            } as unknown as ValidatorInfo // types need to be revised!
          );
        } else {
          waiting.push(
            {
              accountId: v as unknown as AccountId,
              exposure: {
                others: [],
                own: BN_ZERO,
                total: BN_ZERO
              },
              stashId: v as unknown as AccountId,
              validatorPrefs: validatorPrefs[v]
            } as unknown as ValidatorInfo
          );
        }
      }

      const inf = {
        current,
        eraIndex,
        waiting
      };

      setNewValidatorsInfo(inf);
    };

    if (api && currentEraIndex && api.query['staking']['erasStakersOverview']) {
      getValidatorsPaged(currentEraIndex).catch(console.error); // TODO: can save paged validators info in local storage
    } else if (endpoint && endpoint !== AUTO_MODE.value && chain && currentEraIndex && currentEraIndex !== info?.eraIndex) {
      /** get validators info, including current and waiting, should be called after savedValidators gets value */
      getValidatorsInfo(endpoint, info);
    }
  }, [api, chain, currentEraIndex, endpoint, getValidatorsInfo, info, validators]);

  return newInfo || info;
}
