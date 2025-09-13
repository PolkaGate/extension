// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance, PositionInfo, Prices } from '../../../util/types';

import { Stack } from '@mui/material';
import React, { Fragment, memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router';

import { getEarningOptions } from '@polkadot/extension-polkagate/src/popup/staking/utils';
import { extractRelayChainName } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { FadeOnScroll, Motion } from '../../../components';
import { useAccountAssets, useIsTestnetEnabled, usePrices, useSelectedAccount } from '../../../hooks';
import { TEST_NETS } from '../../../util/constants';
import { fetchStaking } from '../../../util/fetchStaking';
import { type PopupOpener, POSITION_TABS, positionsInitialState, positionsReducer, type PositionsState } from '../util/utils';
import EarningItem from './EarningItem';
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
    {positionItems?.map(({ decimal, genesisHash, pooledBalance, priceId, soloTotal, token }) => {
      const price = pricesInCurrency?.prices[priceId ?? '']?.value ?? 0;

      if (TEST_NETS.includes(genesisHash) && !state.isTestnet) {
        return <Fragment key={`${genesisHash}_${token}_fragment`} />;
      }

      return (
        <Fragment key={`${genesisHash}_${token}_fragment`}>
          {pooledBalance && !pooledBalance?.isZero() && ['both', 'pool'].includes(state.stakingType) &&
            <PositionItem
              balance={pooledBalance}
              decimal={decimal}
              genesisHash={genesisHash}
              isSelected={isSelected(genesisHash, 'pool')}
              key={`${genesisHash}_${token}_pool`}
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
              key={`${genesisHash}_${token}_solo`}
              price={price}
              token={token}
              type='solo'
            />}
        </Fragment>
      );
    })}
  </>
);

interface EarningOptionsProps {
  earningItems: PositionInfo[] | undefined;
  rates: Record<string, number> | undefined;
  allSuggestedValidators: Record<string, string[]> | undefined;
  popupOpener: PopupOpener;
  state: PositionsState;
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
}

const EarningOptions = ({ allSuggestedValidators, earningItems, popupOpener, rates, setSelectedPosition, state }: EarningOptionsProps) => (
  <>
    {earningItems?.map((token) => {
      const { chainName, genesisHash, tokenSymbol } = token;
      const relayChainName = (extractRelayChainName(chainName) ?? chainName).toLowerCase();
      const info = { ...token, rate: rates?.[relayChainName] || 0, suggestedValidators: allSuggestedValidators?.[relayChainName] || [] } as PositionInfo;

      if (TEST_NETS.includes(genesisHash) && !state.isTestnet) {
        return <Fragment key={`${genesisHash}_${tokenSymbol}_fragment`} />;
      }

      return (
        <EarningItem
          info={info}
          key={`${genesisHash}_${tokenSymbol}`}
          popupOpener={popupOpener}
          setSelectedPosition={setSelectedPosition}
        />
      );
    })}
  </>
);

interface Props {
  popupOpener: PopupOpener;
  setSelectedPosition: React.Dispatch<React.SetStateAction<PositionInfo | undefined>>;
}

function StakingPositions ({ popupOpener, setSelectedPosition }: Props) {
  const selectedAccount = useSelectedAccount();
  const containerRef = useRef(null);
  const isTestnetEnabled = useIsTestnetEnabled();

  const accountAssets = useAccountAssets(selectedAccount?.address);
  const { pathname } = useLocation();
  const { genesisHash: urlGenesisHash } = useParams<{ genesisHash: string }>();

  const pricesInCurrency = usePrices();

  const [state, dispatch] = useReducer(positionsReducer, positionsInitialState);
  const [rates, setRates] = useState<Record<string, number> | undefined>(undefined);
  const [allSuggestedValidators, setAllSuggestedValidators] = useState<Record<string, string[]> | undefined>(undefined);

  const isSelected = useCallback((genesis: string, stakingType: string) => urlGenesisHash === genesis && pathname.includes(stakingType), [pathname, urlGenesisHash]);

  useEffect(() => {
    if ((rates && allSuggestedValidators) || state.tab !== POSITION_TABS.EXPLORE) {
      return;
    }

    fetchStaking().then((res) => {
      setRates(res.rates);
      setAllSuggestedValidators(res.validators);
    }).catch(console.error);
  }, [rates, state.tab, allSuggestedValidators]);

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
      }

      if (a.soloTotal && b.soloTotal) {
        return b.soloTotal.cmp(a.soloTotal);
      }

      return 0;
    });
  }, [positions, state.searchQuery, state.tab]);

  const earning = useMemo(() => getEarningOptions(accountAssets, isTestnetEnabled), [accountAssets, isTestnetEnabled]);

  const earningItems = useMemo(() => {
    return state.searchQuery
      ? earning?.filter((item) => item?.tokenSymbol?.toLowerCase().includes(state.searchQuery))
      : earning;
  }, [earning, state.searchQuery]);

  useEffect(() => {
    if (!positions && accountAssets === undefined) {
      return;
    }

    (!positions || positions?.length === 0)
      ? dispatch({ payload: POSITION_TABS.EXPLORE, type: 'SET_TAB' })
      : dispatch({ payload: POSITION_TABS.POSITIONS, type: 'SET_TAB' });
  }, [positions, accountAssets]);

  return (
    <Motion>
      <Stack direction='column' sx={{ position: 'relative', width: '100%' }}>
        <PositionsToolbar
          dispatch={dispatch}
          earningsCount={earning?.length}
          positionsCount={positions?.length}
          state={state}
        />
        <Stack direction='column' ref={containerRef} sx={{ gap: '4px', maxHeight: 'calc(100vh - 530px)', minHeight: '288px', overflow: 'auto', width: '100%' }}>
          {state.tab === POSITION_TABS.POSITIONS
            ? (
              <PositionOptions
                isSelected={isSelected}
                positionItems={positionItems}
                pricesInCurrency={pricesInCurrency}
                state={state}
              />)
            : (
              <EarningOptions
                allSuggestedValidators={allSuggestedValidators}
                earningItems={earningItems}
                popupOpener={popupOpener}
                rates={rates}
                setSelectedPosition={setSelectedPosition}
                state={state}
              />)
          }
        </Stack>
        <FadeOnScroll containerRef={containerRef} height='70px' ratio={0.2} style={{ borderRadius: '12px' }} />
      </Stack>
    </Motion>
  );
}

export default memo(StakingPositions);
