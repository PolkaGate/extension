// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Content } from '../partials/Review';
import type { ExtraDetailConfirmationPage, TxInfo } from '../util/types';

import { useMemo } from 'react';

import { toBN } from '../util';
import useCanPayFeeAndDeposit from './useCanPayFeeAndDeposit';

export default function useTransactionData(
  address: string | undefined,
  genesisHash: string | undefined,
  proxyAddress: string | undefined,
  txInfo: TxInfo | undefined,
  transactionInformation: Content[],
  extraDetailConfirmationPage?: ExtraDetailConfirmationPage,
  externalAmount?: string | undefined
) {
  const txAmount = useMemo(() => externalAmount || transactionInformation.find(({ itemKey }) => itemKey === 'amount')?.content, [externalAmount, transactionInformation]);
  const txFee = useMemo(() => transactionInformation.find(({ itemKey }) => itemKey === 'fee'), [transactionInformation]);

  const canPayFee = useCanPayFeeAndDeposit(address, genesisHash, proxyAddress, txFee?.content ? toBN(txFee.content) : undefined);

  const transactionDetail = useMemo(() => {
    if (!txInfo) {
      return undefined;
    }

    const _txInfo = txInfo;

    if (txAmount) {
      _txInfo.amount = txAmount.toString();
    }

    if (txFee?.content) {
      _txInfo.fee = txFee.content.toString();
    }

    return { ..._txInfo, ...extraDetailConfirmationPage };
  }, [extraDetailConfirmationPage, txAmount, txFee?.content, txInfo]);

  const txInformation = useMemo(() => {
    if (canPayFee.isAbleToPay === false) {
      const feeIndex = transactionInformation.findIndex(({ itemKey }) => itemKey === 'fee');

      if (feeIndex === -1) {
        return transactionInformation;
      }

      const updatedInfo = [...transactionInformation];

      updatedInfo[feeIndex] = {
        ...updatedInfo[feeIndex],
        warningText: canPayFee.warning
      };

      return updatedInfo;
    }

    return transactionInformation;
  }, [canPayFee.isAbleToPay, canPayFee.warning, transactionInformation]);

  return {
    transactionDetail,
    txInformation
  };
}
