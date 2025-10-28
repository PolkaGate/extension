// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { TransferType } from './types';

import { useMemo } from 'react';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '@polkadot/extension-polkagate/src/util/constants';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../../hooks';

export default function useWarningMessage (assetId: string | undefined, amountAsBN: BN | undefined, assetToTransfer: FetchedBalance | undefined, decimal: number | undefined, transferType: TransferType, totalFee: BN | undefined): string | undefined {
  const { t } = useTranslation();

  const transferableBalance = useMemo(() => getValue('transferable', assetToTransfer), [assetToTransfer]);
  const noAssetId = assetId === undefined || assetId === 'undefined';
  const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
  const isNonNativeToken = !noAssetId && !isNativeToken;

  return useMemo(() => {
    if (transferType !== 'All' && amountAsBN && decimal && assetToTransfer && transferableBalance) {
      const toTransferBalance = isNonNativeToken
        ? amountAsBN
        : amountAsBN.add(totalFee || BN_ZERO);

      const remainingBalanceAfterTransfer = assetToTransfer.totalBalance.sub(toTransferBalance);

      if (transferableBalance.isZero() || transferableBalance.lt(toTransferBalance)) {
        return t('There is no sufficient transferable balance!');
      }

      if (remainingBalanceAfterTransfer.lt(assetToTransfer.ED ?? BN_ZERO) && remainingBalanceAfterTransfer.gt(BN_ZERO)) {
        return t('This transaction will drop your balance below the Existential Deposit threshold, risking account reaping.');
      }
    }

    return undefined;
  }, [transferType, amountAsBN, decimal, assetToTransfer, transferableBalance, isNonNativeToken, totalFee, t]);
}
