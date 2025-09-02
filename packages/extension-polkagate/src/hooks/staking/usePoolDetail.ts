// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../../util/types';

import { useCallback, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import { BN_ZERO } from '@polkadot/util';

import { isHexToBn } from '../../util/utils';
import useChainInfo from '../useChainInfo';
import useTokenPriceBySymbol from '../useTokenPriceBySymbol';
import { calcPrice } from '../useYouHave2';

const usePoolDetail = (
  poolDetail: MyPoolInfo | null | undefined,
  genesisHash: string | undefined
) => {
  type CollapseState = Record<string, boolean>;

  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const price = useTokenPriceBySymbol(token ?? '', genesisHash ?? '');

  const collapseReducer = useCallback((state: CollapseState, action: { type: string }): CollapseState => {
    // Create new state where all sections are closed
    const newState: CollapseState = Object.keys(state).reduce((acc, key) => {
      // Only open the clicked section if it was previously closed
      acc[key] = key === action.type ? !state[action.type] : false;

      return acc;
    }, {} as CollapseState);

    return newState;
  }, []);

  const [collapse, dispatchCollapse] = useReducer(collapseReducer, { Ids: false, Members: false, Rewards: true, Roles: false });

  const unwrapRewardAccount = useCallback((rewardDestination: string | undefined) => {
    try {
      const parsed = rewardDestination ? JSON.parse(rewardDestination) as unknown : undefined;

      if (parsed && typeof parsed === 'object' && parsed !== null && 'account' in parsed) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return (parsed as { account?: string }).account;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }, []);

  const commission = useMemo(() => {
    const maybeCommission = poolDetail?.bondedPool?.commission?.current?.isSome ? poolDetail.bondedPool.commission.current.value[0] : 0;

    return Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);
  }, [poolDetail?.bondedPool?.commission]);

  const roles = useMemo(() => ({
    bouncer: poolDetail?.bondedPool?.roles.bouncer?.toString(),
    depositor: poolDetail?.bondedPool?.roles.depositor?.toString(),
    nominator: poolDetail?.bondedPool?.roles.nominator?.toString(),
    root: poolDetail?.bondedPool?.roles.root?.toString()
  }), [poolDetail]);

  const ids = useMemo(() => ({
    'reward ID': poolDetail?.accounts?.rewardId.toString() ?? unwrapRewardAccount(poolDetail?.stashIdAccount?.rewardDestination?.toString()),
    'stash ID': poolDetail?.accounts?.stashId.toString() ?? poolDetail?.stashIdAccount?.accountId.toString()
  }), [poolDetail?.accounts?.rewardId, poolDetail?.accounts?.stashId, poolDetail?.stashIdAccount?.accountId, poolDetail?.stashIdAccount?.rewardDestination, unwrapRewardAccount]);

  const poolStatus = useMemo(() => {
    if (!poolDetail) {
      return '';
    }

    const status = poolDetail.bondedPool?.state.toString();

    return status === 'Open'
      ? t('pool')
      : status === 'Destroying'
        ? t('destroying')
        : t('blocked');
  }, [poolDetail, t]);

  const totalPoolRewardAsFiat = useMemo(() => calcPrice(price.price, isHexToBn(poolDetail?.rewardClaimable?.toString() ?? '0') ?? BN_ZERO, decimal ?? 0), [decimal, poolDetail?.rewardClaimable, price.price]);

  const handleCollapses = useCallback((type: string) => () => dispatchCollapse({ type }), []);

  return {
    collapse,
    commission,
    handleCollapses,
    ids,
    poolStatus,
    roles,
    totalPoolRewardAsFiat
  };
};

export default usePoolDetail;
