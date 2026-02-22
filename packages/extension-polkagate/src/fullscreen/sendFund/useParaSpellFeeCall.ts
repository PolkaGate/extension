// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Inputs, ParaspellFees } from './types';

import { Builder, type TDestination, type TSubstrateChain } from '@paraspell/sdk-pjs';
import { useEffect, useState } from 'react';

import { useChainInfo } from '@polkadot/extension-polkagate/src/hooks';

import { getCurrency, normalizeChainName } from './utils';

interface ParaSpellState {
  paraSpellFee?: ParaspellFees;
  paraSpellTransaction?: SubmittableExtrinsic<'promise', ISubmittableResult>;
}

/**
 * Hook to build a Paraspell transfer transaction and estimate origin/destination
 * XCM fees when the selected chain and transfer are supported by Paraspell.
 *
 * Uses `@paraspell/sdk-pjs` Builder to:
 * - construct the transfer extrinsic
 * - fetch transfer info including XCM fee estimates
 *
 * The hook runs only when all required parameters are available and the transfer
 * is marked as Paraspell-supported.
 *
 * @param address - Sender account address.
 * @param isReadyToMakeTx - Indicates whether inputs are finalized and tx can be prepared.
 * @param genesisHash - Genesis hash used to resolve chain API and sender chain.
 * @param inputs - Transfer inputs including amount, token, assetId, recipient and transfer type.
 * @param setInputs
 * @param isSupportedByParaspell - Whether the current transfer flow is supported by Paraspell.
 *
 * @returns ParaSpellState containing:
 * - `paraSpellFee`: estimated origin and destination XCM fees
 * - `paraSpellTransaction`: prepared SubmittableExtrinsic ready for signing/submission
 *
 * Notes:
 * - Returns an empty object until fees and transaction are resolved.
 * - Automatically sets `keepAlive(false)` for "All" transfers on same-chain operations.
 * - Normalizes chain names before building Paraspell transactions.
 */
export default function useParaSpellFeeCall(address: string | undefined, isReadyToMakeTx: boolean | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>, isSupportedByParaspell: boolean) {
  const { chainName: senderChainName } = useChainInfo(genesisHash, true);
  const [paraSpellState, setParaSpellState] = useState<ParaSpellState>({});

  const { amountAsBN,
    assetId,
    recipientAddress,
    recipientChain,
    token,
    transferType } = inputs ?? {};

  useEffect(() => {
    setParaSpellState({});

    const _recipientChainName = recipientChain?.text;
    const isTransferAll = transferType === 'All';
    const amount = isTransferAll
      ? 'ALL'
      : isReadyToMakeTx
        ? amountAsBN?.toString() // may need to consider amountAsBN?.isZero()
        : undefined;

    if (!isSupportedByParaspell || !amount || assetId === undefined || !senderChainName || !address || !token || !_recipientChainName || !recipientAddress) {
      return;
    }

    const fromChain = normalizeChainName(senderChainName);
    const toChain = normalizeChainName(_recipientChainName);
    const isCrossChain = fromChain !== toChain;
    const currency = getCurrency(senderChainName, token, assetId);

    // const nativeToken = api.registry.chainTokens[0];
    // const feeAssetId = inputs?.feeInfo?.assetId;
    // const feeCurrency = feeAssetId ? { location: feeAssetId } : { symbol: Native(nativeToken) };

    try {
      const builder = !isCrossChain && isTransferAll
        ? Builder({ abstractDecimals: false }/* node api/ws_url_string/ws_url_array - optional*/)
          .from(fromChain as TSubstrateChain)
          .to(toChain as TDestination)
          .currency({ amount, ...currency })
          // .feeAsset(feeCurrency) // - Optional parameter when origin === AssetHubPolkadot and TX is supposed to be paid in same fee asset as selected currency.*/
          .address(recipientAddress)
          .senderAddress(address)
          .keepAlive(false) // to drain the account completely
        : Builder({ abstractDecimals: false })
          .from(fromChain as TSubstrateChain)
          .to(toChain as TDestination)
          .currency({ amount, ...currency })
          .address(recipientAddress)
          .senderAddress(address);

      let cancelled = false;

      Promise.all([builder.build(), builder.getTransferInfo()])
        .then(([tx, info]) => {
          if (cancelled) {
            return;
          }

          setParaSpellState({
            paraSpellFee: {
              destinationFee: info.destination.xcmFee,
              originFee: info.origin.xcmFee
            },
            paraSpellTransaction: tx
          });
        }).catch((err) => {
          if (!cancelled) {
            setInputs((prevInputs) => ({
              ...prevInputs,
              error: 'Something went wrong while calculating estimated fee!'
            }));
          }

          console.error('fee calc error', err);
        });

      return () => {
        cancelled = true;
      };
    } catch (error: any) {
      setInputs((prevInputs) => ({
        ...prevInputs,
        error: 'Something went wrong while calculating estimated fee, try again later!'
      }));

      return console.log('Something went wrong:', error?.message);
    }
  }, [address, amountAsBN, assetId, isReadyToMakeTx, recipientChain?.text, recipientAddress, senderChainName, setInputs, token, transferType, isSupportedByParaspell]);

  return paraSpellState;
}
