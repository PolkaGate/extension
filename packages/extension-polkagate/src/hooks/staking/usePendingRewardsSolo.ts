// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Forcing } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { ExpandedRewards } from '../../fullscreen/stake/type';
import type { Content } from '../../partials/Review';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { blockToDate } from '../../util/utils';
import useChainInfo from '../useChainInfo';
import useCurrentBlockNumber2 from '../useCurrentBlockNumber2';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import usePendingRewards3 from '../usePendingRewards3';

const usePendingRewardsSolo = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const { t } = useTranslation();
  const formatted = useFormatted3(address, genesisHash);
  const { api, decimal } = useChainInfo(genesisHash);
  const currentBlock = useCurrentBlockNumber2(genesisHash);
  const pendingRewards = usePendingRewards3(address, genesisHash);

  const payoutStakers = api?.tx['staking']['payoutStakersByPage'];
  const batch = api?.tx['utility']['batchAll'];

  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [selectedToPayout, setSelectedToPayout] = useState<ExpandedRewards[]>([]);
  const [expandedRewards, setExpandedRewards] = useState<ExpandedRewards[] | undefined>(undefined);

  useEffect(() => {
    if (!api?.derive?.staking) {
      return;
    }

    api.derive.session.progress().then(setProgress).catch(console.error);
    api.query['staking']['forceEra']().then((f) => setForcing(f as Forcing)).catch(console.error);

    api.query['staking']?.['historyDepth']
      ? api.query['staking']['historyDepth']().then((depth) => setHistoryDepth(depth as unknown as BN)).catch(console.error)
      : setHistoryDepth(api.consts['staking']['historyDepth'] as unknown as BN);
  }, [api?.consts, api?.derive.session, api?.derive?.staking, api?.query]);

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
    if (!(currentBlock && historyDepth && era && forcing && progress && progress.sessionLength.gt(BN_ONE))) {
      return undefined;
    }

    const EndEraInBlock =
      (forcing.isForceAlways
        ? progress.sessionLength
        : progress.eraLength
      ).mul(
        historyDepth
          .sub(progress.activeEra)
          .addn(era)
          .add(BN_ONE)
      ).sub(
        forcing.isForceAlways
          ? progress.sessionProgress
          : progress.eraProgress);

    return EndEraInBlock ? blockToDate(EndEraInBlock.addn(currentBlock).toNumber(), currentBlock, undefined, true) : undefined;
  }, [currentBlock, forcing, historyDepth, progress]);

  const totalSelectedPending = useMemo(() => {
    if (!selectedToPayout?.length) {
      return BN_ZERO;
    }

    return selectedToPayout.reduce((sum: BN, value: ExpandedRewards) => sum.add((value)[3]), BN_ZERO);
  }, [selectedToPayout]);
  const adaptiveDecimalPoint = totalSelectedPending && decimal && (String(totalSelectedPending).length >= decimal - 1 ? 2 : 4);

  const tx = useMemo(() => {
    if (!selectedToPayout || !payoutStakers || !batch) {
      return undefined;
    }

    const call = selectedToPayout.length === 1
      ? payoutStakers
      : batch;

    const params = selectedToPayout.length === 1
      ? [selectedToPayout[0][1], Number(selectedToPayout[0][0]), selectedToPayout[0][2]]
      : [selectedToPayout.map((p) => payoutStakers(p[1], Number(p[0]), p[2]))];

    return call(...params);
  }, [batch, payoutStakers, selectedToPayout]);

  const estimatedFee = useEstimatedFee2(genesisHash, formatted, tx ?? payoutStakers, tx ? undefined : [address, BN_ZERO]);

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
    adaptiveDecimalPoint,
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
};

export default usePendingRewardsSolo;
