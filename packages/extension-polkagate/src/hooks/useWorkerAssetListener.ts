// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../util/types';

import { useEffect } from 'react';

import { isObject } from '@polkadot/util';

import { updateMetadata } from '../messaging';
import { isHexToBn } from '../util';
import { FETCHING_ASSETS_FUNCTION_NAMES } from '../util/constants';

interface WorkerMessage { functionName?: string, metadata?: MetadataDef, results?: Record<string, MessageBody[]> }

interface BalancesDetails {
  ED: BN,
  availableBalance: BN,
  freeBalance: BN,
  frozenBalance: BN,
  frozenFee?: BN,
  frozenMisc?: BN,
  lockedBalance?: BN,
  soloTotal?: BN,
  pooledBalance?: BN,
  reservedBalance: BN,
  vestingLocked?: BN,
  vestedClaimable?: BN,
  vestingTotal?: BN,
  votingBalance?: BN
}

interface MessageBody {
  assetId: number | string,
  totalBalance: string,
  chainName: string,
  decimal: string,
  genesisHash: string,
  priceId: string,
  token: string,
  balanceDetails?: string,
}

function allHexToBN(balances: object | string | undefined): BalancesDetails | object {
  if (!balances) {
    return {};
  }

  const parsedBalances = isObject(balances) ? balances : JSON.parse(balances as string) as BalancesDetails;
  const _balances = {} as BalancesDetails;

  Object.keys(parsedBalances).forEach((item) => {
    const key = item as keyof BalancesDetails;

    if (parsedBalances[key] !== 'undefined') {
      _balances[key] = isHexToBn(parsedBalances[key] as unknown as string);
    }
  });

  return _balances;
}

/**
 * Hook to listen to worker asset messages and handle asset updates.
 */
export default function useWorkerAssetListener(
  worker: MessagePort | undefined,
  handleRequestCount: (functionName: string) => void,
  combineAndSetAssets: (assets: Record<string, FetchedBalance[]>) => void
) {
  useEffect(() => {
    if (!worker) {
      return;
    }

    function handleMessage(messageEvent: MessageEvent<string>) {
      const message = messageEvent.data;

      if (!message) {
        return;
      }

      try {
        const { functionName, metadata, results } = JSON.parse(message) as WorkerMessage;

        if (metadata) {
          updateMetadata(metadata).catch(console.error);

          return;
        }

        if (!functionName) {
          return;
        }

        handleRequestCount(functionName);

        if (!results) {
          return;
        }

        const _assets: Record<string, FetchedBalance[]> = {};

        if (functionName === FETCHING_ASSETS_FUNCTION_NAMES.RELAY) {
          Object.keys(results).forEach((address) => {
            _assets[address] = [
              {
                price: undefined,
                ...results[address][0],
                ...allHexToBN(results[address][0].balanceDetails) as BalancesDetails,
                date: Date.now(),
                decimal: Number(results[address][0].decimal),
                totalBalance: isHexToBn(results[address][0].totalBalance)
              }
            ];
            delete _assets[address][0].balanceDetails;
          });
        }

        if ([FETCHING_ASSETS_FUNCTION_NAMES.ASSET_HUB, FETCHING_ASSETS_FUNCTION_NAMES.MULTI_ASSET].includes(functionName)) {
          Object.keys(results).forEach((address) => {
            _assets[address] = results[address].map(
              (message: MessageBody) => {
                const temp = {
                  ...message,
                  ...allHexToBN(message.balanceDetails) as BalancesDetails,
                  date: Date.now(),
                  decimal: Number(message.decimal),
                  totalBalance: isHexToBn(message.totalBalance)
                };

                delete temp.balanceDetails;

                return temp;
              }
            );
          });
        }

        combineAndSetAssets(_assets);
      } catch (error) {
        console.error('Error while parsing json in useWorkerAssetListener', error);
      }
    }

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [worker, handleRequestCount, combineAndSetAssets]);
}
