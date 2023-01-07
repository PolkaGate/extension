// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useApi, useEndpoint2, useFormatted } from '.';

export default function useIsEligibleForUnstake (address: AccountId | string | undefined): boolean | undefined {
  const [isEligible, setEligible] = useState<boolean>();
  const formatted = useFormatted(address);
  const api = useApi(address);
  const endpoint = useEndpoint2(address);

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

  useEffect(() => {
    api && formatted && api.query?.fastUnstake && endpoint && checkFastUnstakeEligibility(endpoint, formatted);
  }, [api, endpoint, formatted]);

  return isEligible;
}
