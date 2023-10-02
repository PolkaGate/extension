// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { getValue } from '../popup/account/util';
import { CanPayFee, CanPayStatements } from '../util/types';
import { useBalances } from '.';

export default function useCanPayFeeAndDeposit(formatted: AccountId | string | undefined, proxyAddress: AccountId | string | undefined, estimatedFee: Balance | undefined, deposit: BN | Balance | undefined): CanPayFee {
  const balances = useBalances(formatted?.toString());
  const proxyAddressBalances = useBalances(proxyAddress?.toString());
  const [canPayFeeAndDeposit, setCanPayFeeAndDeposit] = useState<boolean | undefined>();
  const [canPayStatement, setCanPayStatement] = useState<number>();

  useEffect(() => {
    if (!balances || !estimatedFee) {
      return;
    }

    if (proxyAddress && proxyAddressBalances) {
      const canPayFee = getValue('available', proxyAddressBalances)?.gt(estimatedFee);

      if (deposit && !deposit.isZero()) {
        const canPayDeposit = getValue('available', balances)?.gt(deposit);

        const statement = canPayFee && canPayDeposit
          ? CanPayStatements.CANPAY
          : !canPayFee && canPayDeposit
            ? CanPayStatements.PROXYCANPAYFEE
            : canPayFee && !canPayDeposit
              ? CanPayStatements.CANNOTPAYDEPOSIT
              : CanPayStatements.CANNOTPAY;

        setCanPayFeeAndDeposit(canPayFee && canPayDeposit);
        setCanPayStatement(statement);

        return;
      }

      setCanPayFeeAndDeposit(canPayFee);
      setCanPayStatement(canPayFee ? CanPayStatements.CANPAY : CanPayStatements.PROXYCANPAYFEE);
    } else if (!proxyAddress) {
      const amountToPay = estimatedFee?.add(deposit ?? BN_ZERO);
      const canPay = getValue('available', balances)?.gt(amountToPay);

      setCanPayFeeAndDeposit(canPay);
      setCanPayStatement(canPay ? CanPayStatements.CANPAY : deposit?.isZero() ? CanPayStatements.CANNOTPAYFEE : CanPayStatements.CANNOTPAY);
    }
  }, [balances, deposit, estimatedFee, proxyAddress, proxyAddressBalances]);

  return { isAbleToPay: canPayFeeAndDeposit, statement: canPayStatement ?? 0 };
}
