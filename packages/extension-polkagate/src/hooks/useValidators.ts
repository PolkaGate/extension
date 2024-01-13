// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AllValidators, ValidatorInfo, Validators } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { useApi, useChain, useChainName, useCurrentEraIndex, useEndpoint } from '.';

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
  value: string;
}


/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

export default function useValidators(address: string, validators?: AllValidators): AllValidators | null | undefined {
  const [info, setValidatorsInfo] = useState<AllValidators | undefined | null>();
  const [newInfo, setNewValidatorsInfo] = useState<AllValidators | undefined | null>();
  const endpoint = useEndpoint(address);
  const chain = useChain(address);
  const currentEraIndex = useCurrentEraIndex(address);
  const chainName = useChainName(address);
  const api = useApi(address);

  const saveValidatorsInfoInStorage = useCallback((inf: AllValidators) => {
    chrome.storage.local.get('validatorsInfo', (res) => {
      const k = `${chainName as string}`;
      const last = res?.validatorsInfo ?? {};

      last[k] = inf;
      chrome.storage.local.set({ validatorsInfo: last }).catch(console.error);
    });
  }, [chainName]);

  const getValidatorsInfo = useCallback((chain: Chain, endpoint: string, savedValidators = []) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../util/workers/getValidatorsInfo.js', import.meta.url));

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: Validators | null = e.data;

      if (info && JSON.stringify(savedValidators) !== JSON.stringify(info)) {
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
    if (api.query.staking.erasStakersPaged) {
      return;
    }

    // eslint-disable-next-line no-void
    void chrome.storage.local.get('validatorsInfo', (res: { [key: string]: Validators }) => {
      console.log('ValidatorsInfo in local storage:', res);

      if (res?.validatorsInfo?.[chainName]) {
        setValidatorsInfo(res.validatorsInfo[chainName]);
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
        api.query.staking.validators.entries(),
        api.query.staking.erasStakersOverview.entries(currentEraIndex)
      ]);
      const validatorPrefs: Record<string, Prefs> = Object.fromEntries(
        prefs.map(([key, value]) => {
          const validatorAddress = key.toHuman() as string;

          return [validatorAddress, value as unknown as Prefs];
        }));
      const currentEraValidatorsOverview: Record<string, ExposureOverview> = Object.fromEntries(
        overview.map(([keys, value]) => {
          const validatorAddress = keys.toHuman()[1] as string;
          const uv = value.unwrap() as ExposureOverview;

          return [validatorAddress, { nominatorCount: uv.nominatorCount, own: uv.own, pageCount: uv.pageCount, total: uv.total }];
        }));

      const validatorKeys = Object.keys(currentEraValidatorsOverview);

      const validatorsPaged = await Promise.all(
        validatorKeys.map((v) =>
          api.query.staking.erasStakersPaged.entries(currentEraIndex, v)
        )
      );

      const currentNominators: Record<string, Others[]> = {};

      validatorsPaged.forEach((pages) => {
        const validatorAddress = pages[0][0].toHuman()[1] as string;

        currentNominators[validatorAddress] = [];

        pages.forEach(([, value]) => currentNominators[validatorAddress].push(...value.unwrap().others));
      });

      const current: ValidatorInfo[] = [];
      const waiting: ValidatorInfo[] = [];

      Object.keys(validatorPrefs).forEach((v) => {
        Object.keys(currentEraValidatorsOverview).includes(v)
          ? current.push({
            accountId: v,
            exposure: {
              ...currentEraValidatorsOverview[v],
              others: currentNominators[v]
            },
            stashId: v,
            validatorPrefs: validatorPrefs[v]
            // rewardDestination:
            // stakingLedger: PalletStakingStakingLedger
            // nominators: AccountId[];
          })
          : waiting.push({
            accountId: v,
            stashId: v,
            validatorPrefs: validatorPrefs[v],
            exposure: {
              own: BN_ZERO,
              total: BN_ZERO,
              others: []
            }
          });
      });
      const inf = {
        current,
        eraIndex: currentEraIndex as number,
        waiting
      };

      setNewValidatorsInfo(inf);
    };

    if (api && currentEraIndex && api.query.staking.erasStakersOverview) {
      getValidatorsPaged().catch(console.error);
    } else {
      /** get validators info, including current and waiting, should be called after savedValidators gets value */
      endpoint && chain && currentEraIndex && currentEraIndex !== info?.eraIndex && getValidatorsInfo(chain, endpoint, info);
    }
  }, [api, chain, currentEraIndex, endpoint, getValidatorsInfo, info, validators]);

  return newInfo || info;
}
