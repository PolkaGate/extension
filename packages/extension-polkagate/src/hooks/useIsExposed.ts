// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi, useCurrentEraIndex, useEndpoint2, useFormatted } from '.';

export default function useIsExposed(address: AccountId | string | undefined): boolean | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const currentEraIndex = useCurrentEraIndex(address);
  // const endpoint = useEndpoint2(address);
  const [exposed, setIsExposed] = useState<boolean>();

  const checkFastUnstakeEligibility = (endpoint: string, stakerAddress: AccountId | string) => {
    const exposedWorker: Worker = new Worker(new URL('../util/workers/isExposedInPreviousEras.js', import.meta.url));

    exposedWorker.postMessage({ endpoint, stakerAddress });

    exposedWorker.onerror = (err) => {
      console.log(err);
    };

    exposedWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const exposed: boolean | undefined = e.data;

      console.log(`fastUnstake eligibility for ${stakerAddress} is ${exposed}`);
      setIsExposed(exposed);

      exposedWorker.terminate();
    };
  };

  const checkIsExposed = useCallback(async (formatted: AccountId | string): Promise<undefined> => {
    const erasToCheck = (await api.query.fastUnstake.erasToCheckPerBlock()).toNumber();

    if (!erasToCheck) {
      setIsExposed(true); // TODO: double check

      return;
    }

    const erasStakers = await Promise.all(
      [...Array(erasToCheck)].map((_, i) =>
        api.query.staking.erasStakers.entries(currentEraIndex - i)
      )
    );

    setIsExposed(!!erasStakers.flat().map((x) => x[1].others).flat().find((x) => String(x.who) === formatted));
  }, [api, currentEraIndex]);

  useEffect(() => {
    api && formatted && api.query?.fastUnstake && currentEraIndex && checkIsExposed(formatted);
  }, [api, checkIsExposed, currentEraIndex, formatted]);

  return exposed;
}
