// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { BN } from '@polkadot/util';
import type { BalancesInfo, FetchedBalance } from '../../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { Coin, Lock1, Trade } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useReducer } from 'react';

import ReservedLockedPopup from '@polkadot/extension-polkagate/src/popup/tokens/partial/ReservedLockedPopup';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style/index';
import { BN_ZERO, noop } from '@polkadot/util';

import { useChainInfo, useFormatted3, useLockedInReferenda2, usePrices, useReservedDetails2, useTranslation } from '../../../hooks';
import { getValue } from '../../../popup/account/util';
import TokenDetailBox from '../../../popup/tokens/partial/TokenDetailBox';
import { GOVERNANCE_CHAINS, MIGRATED_NOMINATION_POOLS_CHAINS } from '../../../util/constants';

export type Type = 'locked' | 'reserved';

interface LockedReservedState {
  type: Type | undefined;
  data: {
    items: Record<string, BN | undefined>;
    titleIcon: Icon;
  } | undefined;
}

type Action =
  | { type: 'OPEN_MENU'; payload: { menuType: Type; items: Record<string, BN | undefined>; titleIcon: Icon } }
  | { type: 'CLOSE_MENU' }
  | { type: 'UPDATE_ITEMS'; payload: Record<string, BN | undefined> };

const lockedReservedReducer = (state: LockedReservedState, action: Action): LockedReservedState => {
  switch (action.type) {
    case 'OPEN_MENU':
      return {
        data: {
          items: action.payload.items,
          titleIcon: action.payload.titleIcon
        },
        type: action.payload.menuType
      };
    case 'CLOSE_MENU':
      return {
        data: undefined,
        type: undefined
      };
    case 'UPDATE_ITEMS':
      return state.data
        ? {
          ...state,
          data: {
            ...state.data,
            items: action.payload
          }
        }
        : state;
    default:
      return state;
  }
};

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  token: FetchedBalance | undefined;
}

function TokenInfo ({ address, genesisHash, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted3(address, genesisHash);
  const reservedReason = useReservedDetails2(formatted, genesisHash);
  const pricesInCurrency = usePrices();
  const { api } = useChainInfo(genesisHash);
  const { delegatedBalance, totalLocked, unlockableAmount } = useLockedInReferenda2(address, genesisHash, undefined); // TODO: timeToUnlock!

  const [lockedReservedState, dispatch] = useReducer(lockedReservedReducer, {
    data: undefined,
    type: undefined
  });

  const transferable = useMemo(() => getValue('transferable', token as unknown as BalancesInfo), [token]);
  const lockedBalance = useMemo(() => getValue('locked balance', token as unknown as BalancesInfo), [token]);
  const reservedBalance = useMemo(() => getValue('reserved', token as unknown as BalancesInfo)?.add(token?.poolReward ?? BN_ZERO), [token]);

  const isMigrationEnabled = useMemo(() => MIGRATED_NOMINATION_POOLS_CHAINS.includes(genesisHash ?? ''), [genesisHash]);

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
    if (!unlockableAmount || unlockableAmount.isZero() || !GOVERNANCE_CHAINS.includes(genesisHash ?? '') || !api) {
      return undefined;
    }

    return (t('{{amount}} can be unlocked', { replace: { amount: api.createType('Balance', unlockableAmount).toHuman() } }));
  }, [api, genesisHash, t, unlockableAmount]);

  const hasAmount = useCallback((amount: BN | undefined | null) => amount && !amount.isZero(), []);

  const displayPopup = useCallback((type: Type) => () => {
    const items: Record<string, BN | undefined> = {};

    const addStakingItems = (shouldAdd: boolean) => {
      if (!shouldAdd) {
        return;
      }

      if (token?.soloTotal && hasAmount(token?.soloTotal)) {
        items['Solo Staking'] = token.soloTotal;
      }

      if (token?.pooledBalance && hasAmount(token?.pooledBalance)) {
        items['Pool Staking'] = token.pooledBalance.add(token.poolReward ?? BN_ZERO);
      }
    };

    if (type === 'locked') {
      addStakingItems(!isMigrationEnabled);

      if (hasAmount(unlockableAmount) && !items['Governance']) {
        items['Governance'] = unlockableAmount;
      }
    } else {
      if (reservedReason) {
        Object.entries(reservedReason)
          .forEach(([reason, amount]) => {
            if (amount && hasAmount(amount)) {
              items[reason] = amount;
            }
          });
      }

      addStakingItems(!!isMigrationEnabled);
    }

    dispatch({
      payload: {
        items,
        menuType: type,
        titleIcon: type === 'locked' ? Lock1 : Coin
      },
      type: 'OPEN_MENU'
    });
  }, [hasAmount, isMigrationEnabled, reservedReason, token?.poolReward, token?.pooledBalance, token?.soloTotal, unlockableAmount]);

  useEffect(() => {
    if (lockedReservedState.data === undefined || lockedReservedState.type === undefined) {
      return;
    }

    const items: Record<string, BN | undefined> = lockedReservedState.data.items;

    if (lockedReservedState.type === 'reserved') {
      Object.entries(reservedReason).forEach(([reason, amount]) => {
        if (amount && !amount.isZero() && !items[reason]) {
          items[reason] = amount;
        }
      });

      if (reservedReasonLoading) {
        items['loading'] = undefined;
      } else {
        delete items['loading'];
      }
    }

    if (lockedReservedState.type === 'locked') {
      if (delegatedBalance && !delegatedBalance.isZero() && !items['delegate']) {
        items['delegate'] = delegatedBalance;
      }

      const hasVote = delegatedBalance && totalLocked && !totalLocked.isZero() && totalLocked.sub(delegatedBalance).gt(BN_ZERO) && !items['vote'];

      if (hasVote) {
        items['vote'] = totalLocked.sub(delegatedBalance);
      }

      if (lockedReasonLoading) {
        items['loading'] = undefined;
      } else if (!lockedReasonLoading) {
        delete items['loading'];
      }
    }

    dispatch({
      payload: items,
      type: 'UPDATE_ITEMS'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedBalance, lockedReasonLoading, JSON.stringify(lockedReservedState.data?.items), lockedReservedState.type, reservedReason, reservedReasonLoading, totalLocked]);

  const tokenPrice = pricesInCurrency?.prices[token?.priceId ?? '']?.value ?? 0;

  const closeMenu = useCallback(() => {
    dispatch({ type: 'CLOSE_MENU' });
  }, []);

  const stakings = useMemo(() => {
    if (!token) {
      return undefined;
    }

    return {
      hasPoolStake: token.pooledBalance && !token.pooledBalance.isZero(),
      hasSoloStake: token?.soloTotal && !token.soloTotal.isZero(),
      maybePoolStake: token?.pooledBalance?.add(token?.poolReward ?? BN_ZERO) ?? BN_ZERO,
      maybeSoloStake: token?.soloTotal ?? BN_ZERO
    };
  }, [token]);

  return (
    <>
      <Grid container item sx={{ display: 'flex', gap: '4px', p: '15px', pb: '10px' }}>
        <Typography sx={{ display: 'flex', mb: '10px', width: '100%' }} variant='B-3'>
          {t('Info')}
        </Typography>
        <VelvetBox>
          <Stack columnGap='5px' direction='row'>
            <TokenDetailBox
              Icon={Trade}
              amount={transferable}
              background='#05091C'
              decimal={token?.decimal}
              iconSize='20'
              onClick={noop}
              priceId={token?.priceId}
              title={t('Transferable')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Lock1}
              amount={lockedBalance}
              background='#05091C'
              decimal={token?.decimal}
              description={lockedTooltip}
              iconSize='20'
              onClick={hasAmount(lockedBalance) ? displayPopup('locked') : undefined}
              priceId={token?.priceId}
              title={t('Locked')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Coin}
              amount={reservedBalance}
              background='#05091C'
              decimal={token?.decimal}
              iconSize='20'
              onClick={hasAmount(reservedBalance) ? displayPopup('reserved') : undefined}
              priceId={token?.priceId}
              title={t('Reserved')}
              token={token?.token}
            />
            {
              stakings?.hasPoolStake &&
            <TokenDetailBox
              Icon={Coin}
              amount={stakings.maybePoolStake}
              background='#05091C'
              decimal={token?.decimal}
              iconSize='20'
              onClick={noop}
              priceId={token?.priceId}
              title={t('Pool Staked')}
              token={token?.token}
            />
            }
            {
              stakings?.hasSoloStake &&
            <TokenDetailBox
              Icon={Coin}
              amount={stakings.maybeSoloStake}
              background='#05091C'
              decimal={token?.decimal}
              iconSize='20'
              onClick={noop}
              priceId={token?.priceId}
              title={t('Solo Staked')}
              token={token?.token}
            />
            }
          </Stack>
        </VelvetBox>
      </Grid>
      <ReservedLockedPopup
        TitleIcon={lockedReservedState.data?.titleIcon}
        decimal={token?.decimal}
        handleClose={closeMenu}
        items={lockedReservedState.data?.items ?? {}}
        openMenu={!!lockedReservedState.type}
        price={tokenPrice}
        title={lockedReservedState.type ?? ''}
        token={token?.token}
      />
    </>
  );
}

export default memo(TokenInfo);
