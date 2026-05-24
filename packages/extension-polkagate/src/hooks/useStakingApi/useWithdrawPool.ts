// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';

import { useEffect, useMemo, useState } from 'react';

import { getValue } from '../../popup/account/util';
import { getStakingAsset } from '../../popup/staking/utils';
import useAccountAssets from '../useAccountAssets';
import useChainInfo from '../useChainInfo';
import useEstimatedFee from '../useEstimatedFee';
import useFormatted from '../useFormatted';
import usePoolStakingInfo from '../usePoolStakingInfo';
import useTranslation from '../useTranslation';

export const useWithdrawPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const formatted = useFormatted(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['nominationPools']['withdrawUnbonded'];

  const [param, setParam] = useState<[string, number] | null | undefined>(null);

  const transferable = useMemo(() => {
    const asset = getStakingAsset(accountAssets, genesisHash);

    return getValue('transferable', asset);
  }, [accountAssets, genesisHash]);
  const redeemable = useMemo(() => stakingInfo.sessionInfo?.redeemAmount, [stakingInfo.sessionInfo?.redeemAmount]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    try {
      api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
        const spanCount = optSpans.isEmpty
          ? 0
          : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

        setParam([formatted, spanCount]);
      }).catch(console.error);
    } catch (e) {
      console.log('slashingSpans is deprecated', e);
      setParam([formatted, 0]);
    }
  }, [api, formatted, param]);

  const tx = useMemo(() => {
    if (redeem && param) {
      return redeem(...param);
    }

    return undefined;
  }, [redeem, param]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: redeemable,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    },
    {
      content: redeemable && transferable ? transferable.add(redeemable) : undefined,
      description: t('Available balance after redeemable withdrawal'),
      title: t('Available balance after'),
      withLogo: true
    }];
  }, [transferable, estimatedFee, redeemable, t]);

  return {
    redeemable,
    transactionInformation,
    tx
  };
};
