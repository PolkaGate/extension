// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Inputs, ParaspellFees } from './types';

import { Builder, type TDestination, type TSubstrateChain } from '@paraspell/sdk-pjs';
import { useEffect, useMemo, useState } from 'react';

import { useChainInfo } from '@polkadot/extension-polkagate/src/hooks';
import { BN_ZERO } from '@polkadot/util';
import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';

import { getCurrency, isParaspellSupportedChain, normalizeChainName } from './utils';

interface ParaSpellState {
  paraSpellFee?: ParaspellFees;
  paraSpellTransaction?: SubmittableExtrinsic<'promise', ISubmittableResult>;
}

export default function useParaSpellFeeCall(address: string | undefined, isReadyToMakeTx: boolean | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, setError: React.Dispatch<React.SetStateAction<string | undefined>>) {
  const { api, chainName: senderChainName } = useChainInfo(genesisHash);
  const [isCrossChain, setIsCrossChain] = useState<boolean>();
  const [paraSpellState, setParaSpellState] = useState<ParaSpellState>({});

  const isSupportedByParaspell = useMemo(() => !!senderChainName && isParaspellSupportedChain(senderChainName), [senderChainName]);

  const { amountAsBN,
    assetId,
    recipientAddress,
    recipientChain,
    token,
    transferType } = inputs ?? {};

  useEffect(() => {
    const _recipientChainName = recipientChain?.text;

    if (!isSupportedByParaspell || !address || !amountAsBN || amountAsBN?.isZero() || !api || assetId === undefined || !isReadyToMakeTx || !senderChainName || !token || !_recipientChainName || !recipientAddress) {
      return;
    }

    const fromChain = normalizeChainName(senderChainName);
    const toChain = normalizeChainName(_recipientChainName);

    setIsCrossChain(fromChain !== toChain);
    const currency = getCurrency(api, token, assetId);

    // const nativeToken = api.registry.chainTokens[0];
    // const feeAssetId = inputs?.feeInfo?.assetId;
    // const feeCurrency = feeAssetId ? { location: feeAssetId } : { symbol: Native(nativeToken) };

    const amount = transferType === 'All' ? 'ALL' : amountAsBN.toString();

    try {
      console.log(
        'address:', address,
        'recipientAddress:', recipientAddress,
        'fromChain:', fromChain,
        'toChain:', toChain,
        'amount:', amount,
        'currency:', currency,
      );

      const builder = Builder({ abstractDecimals: false }/* node api/ws_url_string/ws_url_array - optional*/)
        .from(fromChain as TSubstrateChain)
        .to(toChain as TDestination)
        .currency({ amount, ...currency })
        // .feeAsset(feeCurrency) // - Optional parameter when origin === AssetHubPolkadot and TX is supposed to be paid in same fee asset as selected currency.*/
        .address(recipientAddress)
        .senderAddress(address);

      // if (isEthereumAddress(address)) {
      //   const substrateAddress = evmToAddress(address);

      //   builder.ahAddress(substrateAddress);
      // }

      let cancelled = false;

      builder.build()
        .then((tx) => {
          if (cancelled) {
            return;
          }

          setParaSpellState((pre) => ({
            ...(pre || {}),
            paraSpellTransaction: tx
          }));
        }).catch((err) => {
          if (!cancelled) {
            setError('Something went wrong while building transaction!');
          }

          console.error('building transaction error', err);
        });

      builder.getTransferInfo()
        .then((info) => {
          if (cancelled) {
            return;
          }

          console.log('destination', info.destination.xcmFee.toString());
          console.log('origin', info.origin.xcmFee.toString());

          setParaSpellState((pre) => ({
            ...(pre || {}),
            paraSpellFee: {
              destinationFee: info.destination.xcmFee,
              originFee: info.origin.xcmFee
            }
          }));
        }).catch((err) => {
          if (!cancelled) {
            setError('Something went wrong while calculating estimated fee!');
          }

          // @ts-ignore
          setParaSpellState((pre) => ({
            ...(pre || {}),
            paraSpellFee: {
              originFee: { fee: BN_ZERO }
            }
          }));

          console.error('fee calc error', err);
        });

      return () => {
        cancelled = true;
      };
    } catch (error: any) {
      setError('Something went wrong while calculating estimated fee, try again later!');
      console.log('Something went wrong:', error?.message);

      // eslint-disable-next-line no-useless-return
      return;
    }
  }, [address, amountAsBN, api, assetId, isReadyToMakeTx, recipientChain?.text, recipientAddress, senderChainName, setError, token, transferType, isSupportedByParaspell]);

  return {
    isCrossChain,
    ...paraSpellState
  };
}
