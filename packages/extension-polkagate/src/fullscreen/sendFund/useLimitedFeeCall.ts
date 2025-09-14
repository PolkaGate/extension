// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import type { Inputs } from './types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB, TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToMachine } from '@polkadot/extension-polkagate/src/util/numberUtils';
import { decodeMultiLocation, isOnAssetHub } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ONE, BN_ZERO, isFunction } from '@polkadot/util';

import { useChainInfo } from '../../hooks';
import { INVALID_PARA_ID, isOnSameChain, XCM_LOC } from './utils';

// This hook is used to estimate fees and prepare the transaction for sending funds for testnets mostly and non xcm transfers on other chains since paraspell does not support transfer all as well
export default function useLimitedFeeCall (address: string | undefined, assetId: string | undefined, assetToTransfer: FetchedBalance | undefined, inputs: Inputs | undefined, genesisHash: string | undefined, teleportState: Teleport, transferType: string) {
  const { api, chainName: senderChainName } = useChainInfo(genesisHash);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedCrossChainFee, setEstimatedCrossChainFee] = useState<Balance>();
  const [maxFee, setMaxFee] = useState<Balance>();

  const decimal = inputs?.decimal;
  const recipientAddress = inputs?.recipientAddress;

  const transferableBalance = useMemo(() => getValue('transferable', assetToTransfer), [assetToTransfer]);
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
  const isCrossChain = useMemo(() => senderChainName !== inputs?.recipientChain?.text, [inputs?.recipientChain?.text, senderChainName]);

  const recipientParaId = useMemo(() => {
    const mayParaId = inputs?.recipientChain?.value;

    try {
      return isCrossChain ? parseInt(String(mayParaId)) : INVALID_PARA_ID;
    } catch {
      return INVALID_PARA_ID;
    }
  }, [inputs?.recipientChain, isCrossChain]);

  const onChainCall = useMemo(() => {
    if (!api || !genesisHash) {
      return undefined;
    }

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
  }, [api, isNonNativeToken, genesisHash, isForeignAsset, transferType]);

  const call = useMemo((): SubmittableExtrinsicFunction<'promise'> | undefined => {
    if (!api) {
      return;
    }

    if (isCrossChain) {
      const m = XCM_LOC.filter((x) => api.tx[x] && isFunction(api.tx[x]['limitedTeleportAssets']))?.[0];

      return m ? api.tx[m]['limitedTeleportAssets'] : undefined;
    }

    return onChainCall;
  }, [api, isCrossChain, onChainCall]);

  const crossChainParams = useMemo(() => {
    if (!api || !assetToTransfer || !teleportState || isCrossChain === false || (recipientParaId === INVALID_PARA_ID && !teleportState?.isParaTeleport) || !amountAsBN || amountAsBN.isZero()) {
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
  }, [api, assetToTransfer, teleportState, isCrossChain, recipientParaId, amountAsBN, recipientAddress]);

  const transaction = useMemo(() => {
    // we only use these parts to support testnets otherwise we use paraSpell to form the transaction
    if (!genesisHash || !assetToTransfer || recipientAddress === undefined || !amountAsBN || amountAsBN.isZero() || !call) {
      return;
    }

    const isTestNet = TEST_NETS.includes(genesisHash);
    const _isOnSameChain = isOnSameChain(senderChainName, inputs?.recipientChain?.text);

    if (!isTestNet && !_isOnSameChain) {
      return;
    }

    const params = (isCrossChain
      ? crossChainParams
      : isNonNativeToken
        ? ['currencies', 'tokens'].includes(onChainCall?.section || '')
          ? [recipientAddress, assetToTransfer.currencyId, amountAsBN] // this is for transferring on mutliasset chains
          : [parsedAssetId, recipientAddress, amountAsBN] // this is for transferring on asset hubs
        : transferType === 'All'
          ? [recipientAddress, false] // transferAll with keepalive = false
          : [recipientAddress, amountAsBN]) as unknown[];

    return params && call(...params);
  }, [genesisHash, assetToTransfer, recipientAddress, amountAsBN, call, senderChainName, inputs?.recipientChain?.text, isCrossChain, crossChainParams, isNonNativeToken, onChainCall?.section, parsedAssetId, transferType]);

  const calculateFee = useCallback((_amount: Balance | BN, setFeeCall: React.Dispatch<React.SetStateAction<Balance | undefined>>) => {
    /** to set Maximum fee which will be used to estimate and show max transferable amount */
    if (!api || !assetToTransfer || !address || !onChainCall) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      const dummyAmount = api.createType('Balance', BN_ONE) as unknown as Balance;

      return setFeeCall(dummyAmount);
    }

    const _params: unknown[] = isNonNativeToken
      ? ['currencies', 'tokens'].includes(onChainCall.section)
        ? [address, assetToTransfer.currencyId, _amount]
        : [parsedAssetId, address, _amount]
      : [address, _amount];

    onChainCall(..._params).paymentInfo(address).then((i) => setFeeCall(i?.partialFee)).catch(console.error);
  }, [api, address, assetToTransfer, onChainCall, isNonNativeToken, parsedAssetId]);

  useEffect(() => {
    // This is to estimate fee for max transferable amount
    if (!api || !transferableBalance) {
      return;
    }

    calculateFee(transferableBalance, setMaxFee);
  }, [api, calculateFee, transferableBalance]);

  useEffect(() => {
    // This is to estimate fee for transfer
    if (!api || amountAsBN === undefined || !assetToTransfer) {
      return;
    }

    calculateFee(amountAsBN || BN_ZERO, setEstimatedFee);
  }, [amountAsBN, api, assetToTransfer, calculateFee]);

  useEffect(() => {
    // This is to estimate cross network fee for teleport
    if (!call || !crossChainParams || !address) {
      return setEstimatedCrossChainFee(undefined);
    }

    isCrossChain && call(...crossChainParams).paymentInfo(address).then((i) => setEstimatedCrossChainFee(i?.partialFee)).catch(console.error);
  }, [call, address, isCrossChain, crossChainParams]);

  return {
    maxFee,
    totalFee: estimatedFee ? estimatedFee.add(estimatedCrossChainFee || BN_ZERO) : undefined,
    transaction
  };
}
