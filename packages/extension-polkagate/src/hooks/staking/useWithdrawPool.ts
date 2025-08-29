// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../../partials/Review';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getValue } from '../../popup/account/util';
import useAccountAssets from '../useAccountAssets';
import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import usePoolStakingInfo from '../usePoolStakingInfo';

const useWithdrawPool = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();

  const formatted = useFormatted3(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['nominationPools']['withdrawUnbonded'];

  const [param, setParam] = useState<[string, number] | null | undefined>(null);

  const transferable = useMemo(() => {
    const asset = accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0');

    return getValue('transferable', asset);
  }, [accountAssets, genesisHash]);
  const redeemable = useMemo(() => stakingInfo.sessionInfo?.redeemAmount, [stakingInfo.sessionInfo?.redeemAmount]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
      const spanCount = optSpans.isEmpty
        ? 0
        : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

      setParam([formatted, spanCount]);
    }).catch(console.error);
  }, [api, formatted, param]);

  const tx = useMemo(() => {
    if (redeem && param) {
      return redeem(...param);
    }

    return undefined;
  }, [redeem, param]);

  const estimatedFee = useEstimatedFee2(genesisHash ?? '', formatted, tx);

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

export default useWithdrawPool;
