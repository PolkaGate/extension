// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AllValidators, ValidatorInfo, Validators } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

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

export interface Others {
  who: string;
  value: BN;
}

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain, which the address is already tied with.
 */

export default function useValidators(address: string, validators?: AllValidators): AllValidators | null | undefined {
  const { api, chain, chainName, endpoint } = useInfo(address);
  const currentEraIndex = useCurrentEraIndex(address); // TODO: Should we use active era index?

  const [info, setValidatorsInfo] = useState<AllValidators | undefined | null>();
  const [newInfo, setNewValidatorsInfo] = useState<AllValidators | undefined | null>();

  const saveValidatorsInfoInStorage = useCallback((inf: AllValidators) => {
    browser.storage.local.get('validatorsInfo').then((res) => {
      const k = `${chainName as string}`;
      const last = res?.['validatorsInfo'] ?? {};

      last[k] = inf;
      browser.storage.local.set({ validatorsInfo: last }).catch(console.error);
    });
  }, [chainName]);

  const getValidatorsInfo = useCallback((endpoint: string, savedValidators = []) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../util/workers/getValidatorsInfo.js', import.meta.url));

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: Validators | null = e.data;

      if (info && JSON.stringify(savedValidators) !== JSON.stringify(info)) {
        setNewValidatorsInfo(info as any);
        saveValidatorsInfoInStorage(info as any);
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

    browser.storage.local.get('validatorsInfo').then((res: { [key: string]: Validators }) => {
      // @ts-ignore
      if (res?.['validatorsInfo']?.[chainName]) {
        // @ts-ignore
        setValidatorsInfo(res['validatorsInfo'][chainName]);
      }
    });
  }, [api, chainName]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (validators) {
      setNewValidatorsInfo(validators);

      return;
    }

    const getValidatorsPaged = async () => {
      if (!api) {
        return; // never happens since we check api before, but to suppress linting
      }

      const [prefs, overview] = await Promise.all([
        api.query['staking']['validators'].entries(),
        api.query['staking']['erasStakersOverview'].entries(currentEraIndex)
      ]);

      const validatorPrefs: Record<string, Prefs> = Object.fromEntries(
        prefs.map(([key, value]) => {
          const validatorAddress = key.toHuman() as string;

          return [validatorAddress, value as unknown as Prefs];
        }));

      const currentEraValidatorsOverview: Record<string, ExposureOverview> = Object.fromEntries(
        overview.map(([keys, value]) => {
          // @ts-ignore
          const validatorAddress = keys.toHuman()[1] as string;
          // @ts-ignore
          const uv = value.unwrap() as ExposureOverview;

          return [validatorAddress, { nominatorCount: uv.nominatorCount, own: uv.own, pageCount: uv.pageCount, total: uv.total }];
        }));

      const validatorKeys = Object.keys(currentEraValidatorsOverview);

      const validatorsPaged = await Promise.all(
        validatorKeys.map((v) =>
          api.query['staking']['erasStakersPaged'].entries(currentEraIndex, v)
        )
      );

      const currentNominators: Record<string, Others[]> = {};

      validatorsPaged.forEach((pages) => {
        if (pages[0]) {
          const validatorAddress = pages[0][0].args[1].toString();

          currentNominators[validatorAddress] = [];
          // @ts-ignore
          pages.forEach(([, value]) => currentNominators[validatorAddress].push(...(value.unwrap()?.others || [])));
        }
      });

      const current: ValidatorInfo[] = [];
      const waiting: ValidatorInfo[] = [];

      Object.keys(validatorPrefs).forEach((v) => {
        Object.keys(currentEraValidatorsOverview).includes(v)
          ? current.push({
            accountId: v as any,
            exposure: {
              ...currentEraValidatorsOverview[v],
              others: currentNominators[v]
            },
            stashId: v as any,
            validatorPrefs: validatorPrefs[v] as any
            // rewardDestination:
            // stakingLedger: PalletStakingStakingLedger
            // nominators: AccountId[];
          } as any)
          : waiting.push({
            accountId: v as any,
            stashId: v as any,
            validatorPrefs: validatorPrefs[v] as any,
            exposure: {
              own: BN_ZERO,
              total: BN_ZERO,
              others: []
            }
          } as any);
      });
      const inf = {
        current,
        eraIndex: currentEraIndex as number,
        waiting
      };

      setNewValidatorsInfo(inf);
    };

    if (api && currentEraIndex && api.query['staking']['erasStakersOverview']) {
      getValidatorsPaged().catch(console.error);
    } else {
      /** get validators info, including current and waiting, should be called after savedValidators gets value */
      endpoint && chain && currentEraIndex && currentEraIndex !== info?.eraIndex && getValidatorsInfo(endpoint, info as any);
    }
  }, [api, chain, currentEraIndex, endpoint, getValidatorsInfo, info, validators]);

  return newInfo || info;
}
