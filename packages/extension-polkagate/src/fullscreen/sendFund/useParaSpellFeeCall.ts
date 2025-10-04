// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
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

export default function useParaSpellFeeCall (address: string | undefined, isReadyToMakeTx: boolean | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, setError: React.Dispatch<React.SetStateAction<string | undefined>>) {
  const { api, chainName: senderChainName } = useChainInfo(genesisHash);
  const [isCrossChain, setIsCrossChain] = useState<boolean>();
  const [paraSpellState, setParaSpellState] = useState<ParaSpellState>({});

  const { amountAsBN,
    assetId,
    recipientAddress,
    recipientChain,
    token } = inputs ?? {};

  useEffect(() => {
    const _recipientChainName = recipientChain?.text;

    if (!isReadyToMakeTx || assetId === undefined || !senderChainName || !amountAsBN || !api || amountAsBN?.isZero() || !address || !token || !_recipientChainName || !recipientAddress || !address) {
      return;
    }

    const fromChain = normalizeChainName(senderChainName);
    const toChain = normalizeChainName(_recipientChainName);

    setIsCrossChain(fromChain !== toChain);
    const currency = getCurrency(api, token, assetId);

    // const nativeToken = api.registry.chainTokens[0];
    // const feeAssetId = inputs?.feeInfo?.assetId;
    // const feeCurrency = feeAssetId ? { location: feeAssetId } : { symbol: Native(nativeToken) };
    try {
      const builder = Builder({ abstractDecimals: false }/* node api/ws_url_string/ws_url_array - optional*/)
        .from(fromChain as TSubstrateChain)
        .to(toChain as TDestination)
        .currency({ amount: amountAsBN.toString(), ...currency })
        // .feeAsset(feeCurrency) // - Optional parameter when origin === AssetHubPolkadot and TX is supposed to be paid in same fee asset as selected currency.*/
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
            setError('Something went wrong while calculating estimated fee!');
          }

          console.error('fee calc error', err);
        });

      return () => {
        cancelled = true;
      };
    } catch (error: any) {
      setError('Something went wrong while calculating estimated fee, try again later!');
      console.log('Something went wrong:', error?.message);

      return;
    }
  }, [api, address, senderChainName, genesisHash, isReadyToMakeTx, setError, assetId, token, recipientChain?.text, recipientAddress, amountAsBN]);

  return {
    isCrossChain,
    ...paraSpellState
  };
}
