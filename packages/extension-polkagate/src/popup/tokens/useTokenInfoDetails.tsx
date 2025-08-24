// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { BalancesInfo, FetchedBalance } from '../../util/types';

import { Coin, Lock1 } from 'iconsax-react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';
import { BN_ZERO, bnMax } from '@polkadot/util';

import { useChainInfo, useFormatted3, useLockedInReferenda2, usePrices, useReservedDetails2, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { updateStorage } from '../../util';
import { GOVERNANCE_CHAINS } from '../../util/constants';
import { getValue } from '../account/util';
import { lockedReservedReducer, type Type } from './LockedReserved';

export function useTokenInfoDetails (address: string | undefined, genesisHash: string | undefined, token: FetchedBalance | undefined) {
  const { t } = useTranslation();
  const pricesInCurrency = usePrices();
  const formatted = useFormatted3(address, genesisHash);
  const reservedReason = useReservedDetails2(formatted, genesisHash);
  const { api, chainName } = useChainInfo(genesisHash);
  const { delegatedBalance, totalLocked, unlockableAmount } = useLockedInReferenda2(address, genesisHash, undefined); // TODO: timeToUnlock!
  const [state, dispatch] = useReducer(lockedReservedReducer, {
    data: undefined,
    type: undefined
  });

  const assetId = token?.assetId;

  const transferable = useMemo(() => getValue('transferable', token as unknown as BalancesInfo), [token]);
  const lockedBalance = useMemo(() => getValue('locked balance', token as unknown as BalancesInfo), [token]);
  const reservedBalance = useMemo(() => getValue('reserved', token as unknown as BalancesInfo)?.add(token?.poolReward ?? BN_ZERO), [token]);

  const tokenPrice = pricesInCurrency?.prices[token?.priceId ?? '']?.value ?? 0;

  const { lockedReasonLoading, reservedReasonLoading } = useMemo(() => {
    const reasons = Object.values(reservedReason);
    const reservedReasonLoading = reasons.length === 0 || reasons.some((reason) => reason === undefined);

    const lockedReasonLoading = delegatedBalance === undefined || totalLocked === undefined;

    return {
      lockedReasonLoading,
      reservedReasonLoading
    };
  }, [delegatedBalance, reservedReason, totalLocked]);

  const lockedTooltip = useMemo(() => {
    if (!unlockableAmount || unlockableAmount.isZero() || !GOVERNANCE_CHAINS.includes(chainName ?? '') || !api) {
      return undefined;
    }

    return (t('{{amount}} can be unlocked', { replace: { amount: api.createType('Balance', unlockableAmount).toHuman() } }));
  }, [api, chainName, t, unlockableAmount]);

  const hasAmount = useCallback((amount: BN | undefined | null) => amount && !amount.isZero(), []);

  const onTransferable = useCallback(() => {
    address && windowOpen(`/send/${address}/${token?.genesisHash}/${assetId}`).catch(console.error);
  }, [address, assetId, token?.genesisHash]);

  const displayPopup = useCallback((type: Type) => () => {
    const items: Record<string, BN | undefined> = {};

    const addStakingItems = () => {
      if (token?.soloTotal && hasAmount(token?.soloTotal)) {
        items['Solo Staking'] = token.soloTotal;
      }

      if (token?.pooledBalance && hasAmount(token?.pooledBalance)) {
        items['Pool Staking'] = token.pooledBalance.add(token.poolReward ?? BN_ZERO);
      }
    };

    if (type === 'reserved') {
      Object.entries(reservedReason ?? {}).forEach(([reason, amount]) => {
        if (amount && hasAmount(amount)) {
          items[reason] = amount;
        }
      });

      addStakingItems();
    }

    dispatch({
      payload: {
        items,
        menuType: type,
        titleIcon: type === 'locked' ? Lock1 : Coin
      },
      type: 'OPEN_MENU'
    });
  }, [hasAmount, reservedReason, token?.poolReward, token?.pooledBalance, token?.soloTotal]);

  useEffect(() => {
    if (state.data === undefined || state.type === undefined) {
      return;
    }

    const newItems: Record<string, BN | undefined> = { ...state.data.items };

    if (state.type === 'reserved') {
      Object.entries(reservedReason ?? {}).forEach(([reason, amount]) => {
        if (amount && !amount.isZero() && !newItems[reason]) {
          newItems[reason] = amount;
        }
      });

      if (reservedReasonLoading) {
        newItems['loading'] = undefined;
      } else {
        delete newItems['loading'];
      }
    }

    if (state.type === 'locked') {
      const lockedInGovernance = bnMax(delegatedBalance ?? BN_ZERO, totalLocked ?? BN_ZERO);

      if (lockedInGovernance && !lockedInGovernance.isZero() && hasAmount(lockedInGovernance) && !newItems['Governance']) {
        newItems['Governance'] = lockedInGovernance;
      }

      if (lockedReasonLoading) {
        newItems['loading'] = undefined;
      } else {
        delete newItems['loading'];
      }
    }

    // shallow equality to prevent infinite UPDATE loop
    const same =
      Object.keys(newItems).length === Object.keys(state.data.items).length &&
      Object.entries(newItems).every(([k, v]) => {
        const prev = state.data?.items?.[k];

        if (v === prev) {
          return true;
        }

        if (!v || !prev) {
          return v === prev;
        }

        return typeof v.eq === 'function' ? v.eq(prev) : v === prev;
      });

    if (same) {
      return;
    }

    dispatch({
      payload: newItems,
      type: 'UPDATE_ITEMS'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedBalance, lockedReasonLoading, state.data?.items, state.type, reservedReason, reservedReasonLoading, totalLocked]);

  useEffect(() => {
    address && genesisHash && updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [address]: genesisHash }).catch(console.error);
  }, [address, genesisHash]);

  const closeMenu = useCallback(() => {
    dispatch({ type: 'CLOSE_MENU' });
  }, []);

  return {
    closeMenu,
    displayPopup,
    hasAmount,
    lockedBalance,
    lockedTooltip,
    onTransferable,
    pricesInCurrency,
    reservedBalance,
    state,
    tokenPrice,
    transferable
  };
}
