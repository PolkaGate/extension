// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi, useCurrentEraIndex, useEndpoint2, useFormatted } from '.';

export default function useIsEligibleForUnstake(address: AccountId | string | undefined): boolean | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const currentEraIndex = useCurrentEraIndex(address);
  // const endpoint = useEndpoint2(address);
  const [isEligible, setEligible] = useState<boolean>();

  const checkFastUnstakeEligibility = (endpoint: string, stakerAddress: AccountId | string) => {
    const isEligible: Worker = new Worker(new URL('../util/workers/isEligibleToFastUnstake.js', import.meta.url));

    isEligible.postMessage({ endpoint, stakerAddress });

    isEligible.onerror = (err) => {
      console.log(err);
    };

    isEligible.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const eligibility: boolean | undefined = e.data;

      console.log(`fastUnstake eligibility for ${stakerAddress} is ${eligibility}`);
      setEligible(eligibility);

      isEligible.terminate();
    };
  };

  const checkEligibility = useCallback(async (formatted: AccountId | string): Promise<undefined> => {
    const erasToCheck = (await api.query.fastUnstake.erasToCheckPerBlock()).toNumber();

    if (!erasToCheck) {
      setEligible(false);

      return;
    }

    const erasStakers = await Promise.all(
      [...Array(erasToCheck)].map((_, i) =>
        api.query.staking.erasStakers.entries(currentEraIndex - i)
      )
    );

    setEligible(!erasStakers.flat().map((x) => x[1].others).flat().find((x) => String(x.who) === formatted));
  }, [api, currentEraIndex]);

  useEffect(() => {
    api && formatted && api.query?.fastUnstake && currentEraIndex && checkEligibility(formatted);
  }, [api, checkEligibility, currentEraIndex, formatted]);

  return isEligible;
}
