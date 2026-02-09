// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Teleport } from '@polkadot/extension-polkagate/src/hooks/useTeleport';
import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Inputs, ParaspellFees } from './types';

import { useMemo } from 'react';

import { useChainInfo } from '@polkadot/extension-polkagate/src/hooks';

import useLimitedFeeCall from './useLimitedFeeCall';
import useParaSpellFeeCall from './useParaSpellFeeCall';
import { isParaspellSupportedAsset, isParaspellSupportedChain } from './utils';

/**
 * Unified fee + transaction preparation hook.
 *
 * Determines whether the transfer should use the Paraspell flow or the
 * limited/manual fee flow, builds the appropriate transaction, and returns
 * normalized fee + tx results for the send-funds UI.
 *
 * Internally:
 * - Detects cross-chain transfers based on sender/recipient chains
 * - Checks Paraspell support for the current chain + asset
 * - Delegates to `useParaSpellFeeCall` or `useLimitedFeeCall`
 * - Returns a single consistent result shape regardless of strategy
 *
 * @param address - Sender account address.
 * @param isReadyToMakeTx - Indicates whether inputs are finalized and tx building can start.
 * @param genesisHash - Sender chain genesis hash used to resolve chain info/API.
 * @param inputs - Transfer form inputs (amount, token, assetId, recipient, chains, transfer type).
 * @param setError - React state dispatcher used to report builder/fee errors.
 * @param assetToTransfer - Asset balance/metadata for the selected token.
 * @param teleportState - Teleport configuration/state used for cross-chain limited transfers.
 *
 * @returns Object containing:
 * - `fee`: estimated origin/destination fees (normalized across strategies)
 * - `tx`: prepared SubmittableExtrinsic ready for signing/submission
 * - `isCrossChain`: boolean indicating whether transfer is cross-chain
 *
 * Notes:
 * - Automatically switches between Paraspell and limited fee strategies.
 * - Returns partial/empty values until fees and tx are resolved.
 * - Memoizes output to avoid unnecessary downstream renders.
 */
export default function useFeeCall(address: string | undefined, isReadyToMakeTx: boolean | undefined, genesisHash: string | undefined, inputs: Inputs | undefined, setError: React.Dispatch<React.SetStateAction<string | undefined>>, assetToTransfer: FetchedBalance | undefined, teleportState: Teleport) {
  const { chainName: senderChainName } = useChainInfo(genesisHash);

  const isCrossChain = useMemo(() => senderChainName && inputs?.recipientChain?.text
    ? senderChainName !== inputs?.recipientChain?.text
    : undefined
    , [inputs?.recipientChain?.text, senderChainName]);

  const isSupportedByParaspell = useMemo(() =>
    isParaspellSupportedChain(senderChainName) &&
    isParaspellSupportedAsset(senderChainName, inputs?.token)
    , [inputs?.token, senderChainName]);

  const { paraSpellFee, paraSpellTransaction } = useParaSpellFeeCall(address, isReadyToMakeTx, genesisHash, inputs, setError, !!isSupportedByParaspell);
  const { fee, tx } = useLimitedFeeCall(address, inputs?.assetId?.toString(), assetToTransfer, inputs, genesisHash, teleportState, isCrossChain, !!isSupportedByParaspell);

  return useMemo(() => ({
    fee: (isSupportedByParaspell ? paraSpellFee : fee) as ParaspellFees,
    isCrossChain,
    tx: isSupportedByParaspell ? paraSpellTransaction : tx
  }), [fee, isCrossChain, isSupportedByParaspell, paraSpellFee, paraSpellTransaction, tx]);
}
