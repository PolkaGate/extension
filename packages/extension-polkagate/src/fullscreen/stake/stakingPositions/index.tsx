// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { memo, useCallback, useMemo, useReducer, useRef } from 'react';
import { useLocation } from 'react-router';

import { FadeOnScroll } from '../../../components';
import { useAccountAssets, useAccountSelectedChain, usePrices, useSelectedAccount } from '../../../hooks';
import { TEST_NETS } from '../../../util/constants';
import { positionsInitialState, positionsReducer } from '../util/utils';
import PositionItem from './PositionItem';
import PositionsToolbar from './PositionsToolbar';

function StakingPositions () {
  const pricesInCurrency = usePrices();
  const selectedAccount = useSelectedAccount();
  const accountAssets = useAccountAssets(selectedAccount?.address);
  const selectedGenesisHash = useAccountSelectedChain(selectedAccount?.address);
  const containerRef = useRef(null);
  const { pathname } = useLocation();

  const [state, dispatch] = useReducer(positionsReducer, positionsInitialState);

  const positions = useMemo(() =>
    accountAssets?.filter(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero()))
  , [accountAssets]);

  const filteredToken = useMemo(() => {
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
  }, [positions, state.searchQuery]);

  const isSelected = useCallback((genesis: string, stakingType: string) => selectedGenesisHash === genesis && pathname.includes(stakingType), [pathname, selectedGenesisHash]);

  return (
    <Stack direction='column' sx={{ position: 'relative', width: '100%' }}>
      <PositionsToolbar dispatch={dispatch} state={state} />
      <Stack direction='column' ref={containerRef} sx={{ gap: '4px', maxHeight: '250px', overflow: 'auto', width: '100%' }}>
        {filteredToken?.map(({ decimal, genesisHash, pooledBalance, priceId, soloTotal, token }, index) => {
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
      </Stack>
      <FadeOnScroll containerRef={containerRef} height='70px' ratio={0.2} style={{ borderRadius: '12px' }} />
    </Stack>
  );
}

export default memo(StakingPositions);
