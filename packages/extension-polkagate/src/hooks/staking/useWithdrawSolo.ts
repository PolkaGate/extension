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
import useSoloStakingInfo from '../useSoloStakingInfo';

const useWithdrawSolo = (
  address: string | undefined,
  genesisHash: string | undefined,
  review = false
) => {
  const { t } = useTranslation();

  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);
  const accountAssets = useAccountAssets(address);

  const redeem = api?.tx['staking']['withdrawUnbonded'];

  const [param, setParam] = useState<number | null | undefined>(null);

  const asset = useMemo(() =>
    accountAssets?.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0')
    , [accountAssets, genesisHash]);
  const transferable = useMemo(() => getValue('transferable', asset), [asset]);
  const redeemable = useMemo(() => stakingInfo.stakingAccount?.redeemable, [stakingInfo.stakingAccount?.redeemable]);

  useEffect(() => {
    if (!api || param !== null || !formatted) {
      return;
    }

    try {
      api.query['staking']['slashingSpans'](formatted).then((optSpans) => {
        const spanCount = optSpans.isEmpty
          ? 0
          : (optSpans.toPrimitive() as { prior: unknown[] }).prior.length + 1;

        setParam(spanCount as unknown as number);
      }).catch(console.error);
    } catch (e) {
      console.log('slashingSpans is not supported', e);
      setParam(0);
    }
  }, [api, formatted, param]);

  const estimatedFee = useEstimatedFee2(review ? genesisHash ?? '' : undefined, formatted, redeem, [param ?? 0]);

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
  }, [estimatedFee, redeemable, t, transferable]);
  const tx = useMemo(() => redeem?.(param), [redeem, param]);

  return {
    asset,
    redeemable,
    transactionInformation,
    tx
  };
};

export default useWithdrawSolo;
