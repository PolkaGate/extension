// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { Inputs } from './types';

import { useEffect, useMemo, useState } from 'react';

import { amountToMachine, decodeMultiLocation, isOnAssetHub } from '@polkadot/extension-polkagate/src/util';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';
import { BN_ONE, BN_ZERO, isFunction } from '@polkadot/util';

import { useChainInfo } from '../../hooks';
import { INVALID_PARA_ID, XCM_LOC } from './utils';

/**
 * React hook to estimate origin and cross-chain (XCM teleport) fees and
 * construct a limited transfer extrinsic for chains or scenarios where
 * Paraspell is not used or not supported.
 *
 * Primarily used for:
 * - Testnet transfers
 * - Native / non-native asset transfers on chains without Paraspell support
 * - Limited teleport fee estimation
 *
 * The hook prepares:
 * - On-chain transfer calls
 * - Cross-chain limitedTeleportAssets calls
 * - Origin and XCM fee estimations via paymentInfo
 *
 * @param address - Sender account address used to estimate fees.
 * @param assetId - Asset identifier (native, foreign, or parsed numeric ID).
 * @param assetToTransfer - Asset metadata and balance information.
 * @param inputs - User transfer inputs including amount, recipient, token, and transfer type.
 * @param genesisHash - Chain genesis hash used to resolve API and chain context.
 * @param teleportState - Teleport configuration including para-teleport flags.
 * @param isCrossChain - Indicates whether the transfer is cross-chain.
 * @param isSupportedByParaspell - If true, Paraspell handles the flow and this hook skips fee estimation.
 *
 * @returns An object containing:
 * - `fee`: structured origin and destination fee details
 * - `tx`: prepared SubmittableExtrinsic ready to be signed/submitted
 *
 * Notes:
 * - Returns an empty object until origin fee is resolved.
 * - Destination fee is currently zero for limited teleport scenarios.
 * - Uses transactionPaymentApi when available; otherwise applies a dummy fee fallback.
 */
export default function useLimitedFeeCall(address: string | undefined, assetId: string | undefined, assetToTransfer: FetchedBalance | undefined, inputs: Inputs | undefined, genesisHash: string | undefined, teleportState: Teleport, isCrossChain: boolean | undefined, isSupportedByParaspell: boolean) {
  const { api } = useChainInfo(genesisHash);

  const [originFee, setOriginFee] = useState<Balance>();
  const [xcmFee, setXcmFee] = useState<Balance>();

  const { decimal, recipientAddress, recipientChain, token, transferType } = inputs || {};

  const isForeignAsset = assetId ? assetId.startsWith('0x') : undefined;
  const noAssetId = assetId === undefined || assetId === 'undefined';
  const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
  const isNonNativeToken = !noAssetId && !isNativeToken;
  const parsedAssetId = useMemo(() => noAssetId || isNativeToken
    ? undefined
    : isForeignAsset
      ? decodeMultiLocation(assetId as HexString)
      : parseInt(assetId)
    , [assetId, isForeignAsset, isNativeToken, noAssetId]);

  const amountAsBN = useMemo(() => decimal ? amountToMachine(inputs?.amount, decimal) : undefined, [decimal, inputs?.amount]);

  const recipientParaId = useMemo(() => {
    const mayParaId = recipientChain?.value;

    try {
      return isCrossChain ? parseInt(String(mayParaId)) : INVALID_PARA_ID;
    } catch {
      return INVALID_PARA_ID;
    }
  }, [recipientChain, isCrossChain]);

  const onChainCall = useMemo(() => {
    if (isSupportedByParaspell || !api || !genesisHash) {
      return undefined;
    }

  console.log('ecalculateFee 3');

    try {
      const module = isNonNativeToken
        ? isOnAssetHub(genesisHash)
          ? isForeignAsset
            ? 'foreignAssets'
            : 'assets'
          : api.tx?.['currencies']
            ? 'currencies'
            : 'tokens'
        : 'balances';

      if (['currencies', 'tokens'].includes(module)) {
        return api.tx[module]['transfer'];
      }

      return api.tx?.[module] && (
        transferType === 'Normal'
          ? api.tx[module]['transferKeepAlive']
          : isNonNativeToken
            ? api.tx[module]['transfer']
            : api.tx[module]['transferAll']
      );
    } catch (e) {
      console.log('Something wrong while making on network call!', e);

      return undefined;
    }
  }, [isSupportedByParaspell, api, genesisHash, isNonNativeToken, isForeignAsset, transferType]);

  const call = useMemo((): SubmittableExtrinsicFunction<'promise'> | undefined => {
    if (isSupportedByParaspell || !api) {
      return;
    }

    if (isCrossChain) {
      const m = XCM_LOC.filter((x) => api.tx[x] && isFunction(api.tx[x]['limitedTeleportAssets']))?.[0];

      return m ? api.tx[m]['limitedTeleportAssets'] : undefined;
    }

    return onChainCall;
  }, [api, isCrossChain, isSupportedByParaspell, onChainCall]);

  const crossChainParams = useMemo(() => {
    if (isSupportedByParaspell || !api || !assetToTransfer || !teleportState || isCrossChain === false || (recipientParaId === INVALID_PARA_ID && !teleportState?.isParaTeleport) || !amountAsBN || amountAsBN.isZero()) {
      return;
    }

    return [
      {
        V3: teleportState.isParaTeleport
          ? { interior: 'Here', parents: 1 }
          : { interior: { X1: { ParaChain: recipientParaId } }, parents: 0 }
      },
      {
        V3: {
          interior: {
            X1: {
              AccountId32: {
                id: api.createType('AccountId32', recipientAddress).toHex(),
                network: null
              }
            }
          },
          parents: 0
        }
      },
      {
        V3: [{
          fun: { Fungible: amountAsBN },
          id: {
            Concrete: {
              interior: 'Here',
              parents: teleportState.isParaTeleport ? 1 : 0
            }
          }
        }]
      },
      0,
      { Unlimited: null }
    ];
  }, [isSupportedByParaspell, api, assetToTransfer, teleportState, isCrossChain, recipientParaId, amountAsBN, recipientAddress]);

  const onChainParams = useMemo((): unknown[] | undefined => {
    if (!api || !assetToTransfer || !address || !onChainCall || !recipientAddress) {
      return;
    }

    const { method, section } = onChainCall;

    return (
      isNonNativeToken
        ? ['currencies', 'tokens'].includes(section)
          ? [recipientAddress, assetToTransfer.currencyId, method === 'transferAll' ? false : amountAsBN]
          : [parsedAssetId, recipientAddress, amountAsBN]
        : [recipientAddress, method === 'transferAll' ? false : amountAsBN]
    ) as unknown[];
  }, [api, assetToTransfer, address, onChainCall, isNonNativeToken, recipientAddress, amountAsBN, parsedAssetId]);

  useEffect(() => {
    if (!api || !onChainParams || !address || !onChainCall || isSupportedByParaspell) {
      return;
    }

  console.log('ecalculateFee 2');

    if (!api?.call?.['transactionPaymentApi']) {
      const dummyAmount = api.createType('Balance', BN_ONE) as unknown as Balance;

      return setOriginFee(dummyAmount);
    }

    onChainCall(...onChainParams).paymentInfo(address).then((i) => setOriginFee(i?.partialFee)).catch(console.error);
  }, [address, api, isSupportedByParaspell, onChainCall, onChainParams]);

  useEffect(() => {
    // This is to estimate cross network fee for teleport
    if (!call || !crossChainParams || !address || isSupportedByParaspell) {
      return setXcmFee(undefined);
    }

    isCrossChain && call(...crossChainParams).paymentInfo(address).then((i) => setXcmFee(i?.partialFee)).catch(console.error);
  }, [call, address, isCrossChain, crossChainParams, isSupportedByParaspell]);

  return useMemo(() => {
    if (!originFee) {
      return {};
    }

    return {
      fee: {
        destinationFee: {
          asset: {
            assetId,
            decimals: decimal,
            isNative: isNativeToken,
            symbol: token
          },
          fee: BN_ZERO
        },
        isCrossChain,
        originFee: {
          asset: {
            assetId,
            decimals: decimal,
            isNative: isNativeToken,
            symbol: token
          },
          fee: isCrossChain ? xcmFee : originFee
        }
      },
      tx: isCrossChain
        ? crossChainParams && call
          ? call?.(...crossChainParams)
          : undefined
        : onChainParams && onChainCall
          ? onChainCall?.(...onChainParams)
          : undefined
    };
  }, [assetId, call, crossChainParams, decimal, isCrossChain, isNativeToken, onChainCall, onChainParams, originFee, token, xcmFee]);
}
