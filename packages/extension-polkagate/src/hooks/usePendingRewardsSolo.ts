// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Forcing } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { ExpandedRewards } from '../fullscreen/stake/type';
import type { Content } from '../partials/Review';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { blockToDate } from '../util';
import useChainInfo from './useChainInfo';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useEraInfo from './useEraInfo';
import useEstimatedFee from './useEstimatedFee';
import useFormatted from './useFormatted';
import usePendingRewards from './usePendingRewards';
import useTranslation from './useTranslation';

export default function usePendingRewardsSolo (
  address: string | undefined,
  genesisHash: string | undefined
) {
  const { t } = useTranslation();
  const formatted = useFormatted(address, genesisHash);
  const { api } = useChainInfo(genesisHash);
  const currentBlock = useCurrentBlockNumber(genesisHash);
  const pendingRewards = usePendingRewards(address, genesisHash);

  const payoutStakers = api?.tx['staking']['payoutStakersByPage'];
  const batch = api?.tx['utility']['batchAll'];

  const eraInfo = useEraInfo(genesisHash);
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [selectedToPayout, setSelectedToPayout] = useState<ExpandedRewards[]>([]);
  const [expandedRewards, setExpandedRewards] = useState<ExpandedRewards[] | undefined>(undefined);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query['staking']['forceEra']().then((f) => setForcing(f as Forcing)).catch(console.error);

    api.query['staking']?.['historyDepth']
      ? api.query['staking']['historyDepth']().then((depth) => setHistoryDepth(depth as unknown as BN)).catch(console.error)
      : setHistoryDepth(api.consts['staking']['historyDepth'] as unknown as BN);
  }, [api, api?.consts, api?.query]);

  useEffect(() => {
    if (!pendingRewards) {
      return;
    }

    const rewardsArray: [string, string, number, BN][] = Object.entries(pendingRewards || {}).reduce<[string, string, number, BN][]>(
      (acc, [era, eraRewards]) => {
        const eraRewardsArray = Object.entries(eraRewards || {}).reduce<[string, string, number, BN][]>(
          (eraAcc, [validator, [page, amount]]) => {
            eraAcc.push([era, validator, page, amount]);

            return eraAcc;
          }, []);

        return acc.concat(eraRewardsArray);
      }, []);

    setExpandedRewards(rewardsArray);
  }, [pendingRewards]);

  const eraToDate = useCallback((era: number): string | undefined => {
    if (!(currentBlock && historyDepth && era && forcing && eraInfo && eraInfo.sessionLength > 1)) {
      return undefined;
    }

    const { activeEra, eraLength, eraProgress, sessionLength, sessionProgress } = eraInfo;

    const EndEraInBlock =
      (forcing.isForceAlways
        ? sessionLength
        : eraLength
      ) * (
        historyDepth
          .subn(activeEra)
          .addn(era)
          .add(BN_ONE)
          .toNumber()
      ) - (
        forcing.isForceAlways
          ? sessionProgress
          : eraProgress);

    return EndEraInBlock
      ? blockToDate(EndEraInBlock + currentBlock, currentBlock, undefined, true)
      : undefined;
  }, [currentBlock, forcing, historyDepth, eraInfo]);

  const totalSelectedPending = useMemo(() => {
    if (!selectedToPayout?.length) {
      return BN_ZERO;
    }

    return selectedToPayout.reduce((sum: BN, value: ExpandedRewards) => sum.add((value)[3]), BN_ZERO);
  }, [selectedToPayout]);

  const tx = useMemo(() => {
    if (!selectedToPayout.length || !payoutStakers || !batch) {
      return undefined;
    }

    const call = selectedToPayout.length > 1
      ? batch
      : payoutStakers;

    const params = selectedToPayout.length > 1
      ? [selectedToPayout.map((p) => payoutStakers(p[1], Number(p[0]), p[2]))]
      : [selectedToPayout[0][1], Number(selectedToPayout[0][0]), selectedToPayout[0][2]];

    return call(...params);
  }, [batch, payoutStakers, selectedToPayout]);

  const fakeTx = useMemo(() => payoutStakers?.(address, BN_ZERO, BN_ZERO), [address, payoutStakers]);

  const estimatedFee = useEstimatedFee(genesisHash, formatted, tx ?? fakeTx);

  const transactionInformation: Content[] = useMemo(() => {
    return [{
      content: totalSelectedPending,
      itemKey: 'amount',
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [estimatedFee, totalSelectedPending, t]);

  const onSelectAll = useCallback((checked: boolean) => {
    if (!checked && expandedRewards?.length) {
      setSelectedToPayout([...expandedRewards]);
    } else {
      setSelectedToPayout([]);
    }
  }, [expandedRewards]);

  const onSelect = useCallback((info: ExpandedRewards, checked: boolean) => {
    if (!checked) {
      setSelectedToPayout((prev) => prev.concat([info]));
    } else {
      const index = selectedToPayout.findIndex((s: ExpandedRewards) => s === info);

      setSelectedToPayout((prev) => {
        const newArray = [...prev];

        newArray.splice(index, 1);

        return newArray;
      });
    }
  }, [selectedToPayout]);

  return {
    eraToDate,
    estimatedFee,
    expandedRewards,
    onSelect,
    onSelectAll,
    selectedToPayout,
    totalSelectedPending,
    transactionInformation,
    tx
  };
}
