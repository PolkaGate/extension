// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance, Prices } from '../../../util/types';

import { Stack } from '@mui/material';
import React, { memo, useCallback, useMemo, useReducer, useRef } from 'react';
import { useLocation } from 'react-router';

import { FadeOnScroll } from '../../../components';
import { useAccountAssets, useAccountSelectedChain, usePrices, useSelectedAccount } from '../../../hooks';
import { TEST_NETS } from '../../../util/constants';
import { POSITION_TABS, positionsInitialState, positionsReducer, type PositionsState } from '../util/utils';
import PositionItem from './PositionItem';
import PositionsToolbar from './PositionsToolbar';

interface PositionOptionsProps {
  positionItems: FetchedBalance[] | undefined;
  pricesInCurrency: Prices | null | undefined;
  state: PositionsState;
  isSelected: (genesis: string, stakingType: string) => boolean;
}

const PositionOptions = ({ isSelected, positionItems, pricesInCurrency, state }: PositionOptionsProps) => (
  <>
    {positionItems?.map(({ decimal, genesisHash, pooledBalance, priceId, soloTotal, token }, index) => {
      const price = pricesInCurrency?.prices[priceId ?? '']?.value ?? 0;

      if (TEST_NETS.includes(genesisHash) && !state.isTestnet) {
        return <></>;
      }

      return (
        <>
          {pooledBalance && !pooledBalance?.isZero() && ['both', 'pool'].includes(state.stakingType) &&
            <PositionItem
              balance={pooledBalance}
              decimal={decimal}
              genesisHash={genesisHash}
              isSelected={isSelected(genesisHash, 'pool')}
              key={index}
              price={price}
              token={token}
              type='pool'
            />}
          {soloTotal && !soloTotal?.isZero() && ['both', 'solo'].includes(state.stakingType) &&
            <PositionItem
              balance={soloTotal}
              decimal={decimal}
              genesisHash={genesisHash}
              isSelected={isSelected(genesisHash, 'solo')}
              key={index}
              price={price}
              token={token}
              type='solo'
            />}
        </>
      );
    })}
  </>
);

function StakingPositions () {
  const selectedAccount = useSelectedAccount();
  const containerRef = useRef(null);
  const accountAssets = useAccountAssets(selectedAccount?.address);
  const selectedGenesisHash = useAccountSelectedChain(selectedAccount?.address);
  const { pathname } = useLocation();
  const pricesInCurrency = usePrices();

  const [state, dispatch] = useReducer(positionsReducer, positionsInitialState);

  const isSelected = useCallback((genesis: string, stakingType: string) => selectedGenesisHash === genesis && pathname.includes(stakingType), [pathname, selectedGenesisHash]);

  const positions = useMemo(() =>
    accountAssets?.filter(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero()))
  , [accountAssets]);

  const positionItems = useMemo(() => {
    if (state.tab !== POSITION_TABS.POSITIONS) {
      return [];
    }

    return (
      state.searchQuery
        ? positions?.filter(({ token }) => token?.toLowerCase().includes(state.searchQuery))
        : positions
    )?.sort((a, b) => {
      if (a.pooledBalance && b.pooledBalance) {
        return b.pooledBalance.cmp(a.pooledBalance);
      } else if (a.soloTotal && b.soloTotal) {
        return b.soloTotal.cmp(a.soloTotal);
      } else {
        return 0;
      }
    });
  }, [positions, state.searchQuery, state.tab]);

  return (
    <Stack direction='column' sx={{ position: 'relative', width: '100%' }}>
      <PositionsToolbar dispatch={dispatch} earningsCount={0} positionsCount={positions?.length} state={state} />
      <Stack direction='column' ref={containerRef} sx={{ gap: '4px', maxHeight: '250px', overflow: 'auto', width: '100%' }}>
        {state.tab === POSITION_TABS.POSITIONS
          ? (
            <PositionOptions
              isSelected={isSelected}
              positionItems={positionItems}
              pricesInCurrency={pricesInCurrency}
              state={state}
            />)
          : <></>
        }
      </Stack>
      <FadeOnScroll containerRef={containerRef} height='70px' ratio={0.2} style={{ borderRadius: '12px' }} />
    </Stack>
  );
}

export default memo(StakingPositions);
