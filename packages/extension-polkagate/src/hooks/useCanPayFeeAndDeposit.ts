// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable curly */

import type { Balance } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';
import type { BalancesInfo, CanPayFee } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { getValue } from '../popup/account/util';
import { useBalances } from '.';

export enum CanPayStatements {
  CAN_NOT_PAY,
  CAN_PAY,
  CAN_NOT_PAY_FEE,
  CAN_NOT_PAY_DEPOSIT,
  PROXY_CAN_PAY_FEE,
}

export default function useCanPayFeeAndDeposit (
  formatted: AccountId | string | undefined,
  proxyAddress: AccountId | string | undefined,
  estimatedFee: Balance | undefined,
  deposit: BN | Balance | undefined,
  balancesFromProps?: BalancesInfo | undefined
): CanPayFee {
  const balancesFromAddress = useBalances(formatted?.toString());
  const proxyAddressBalances = useBalances(proxyAddress?.toString());

  const balances = balancesFromProps || balancesFromAddress;
  const [canPayFeeAndDeposit, setCanPayFeeAndDeposit] = useState<boolean | undefined>();
  const [canPayStatement, setCanPayStatement] = useState<number>();

  const getStatement = useCallback((canPayFee: boolean | undefined, canPayDeposit: boolean | undefined, canPayWholeAmount: boolean | undefined, useProxy: boolean | undefined, hasDeposit: boolean | undefined) => {
    if (useProxy) {
      if (hasDeposit) {
        if (canPayFee && canPayDeposit) return CanPayStatements.CAN_PAY;
        if (canPayFee && !canPayDeposit) return CanPayStatements.CAN_NOT_PAY_DEPOSIT;
        if (!canPayFee && canPayDeposit) return CanPayStatements.PROXY_CAN_PAY_FEE;

        return CanPayStatements.CAN_NOT_PAY;
      } else {
        if (canPayFee) return CanPayStatements.CAN_PAY;

        return CanPayStatements.PROXY_CAN_PAY_FEE;
      }
    } else {
      if (hasDeposit) {
        if (canPayWholeAmount) return CanPayStatements.CAN_PAY;
        if (canPayDeposit) return CanPayStatements.CAN_NOT_PAY_FEE;
        if (!canPayDeposit && canPayFee) return CanPayStatements.CAN_NOT_PAY_DEPOSIT;

        return CanPayStatements.CAN_NOT_PAY;
      } else {
        if (canPayFee) return CanPayStatements.CAN_PAY;

        return CanPayStatements.CAN_NOT_PAY_FEE;
      }
    }
  }, []);

  useEffect(() => {
    if (!balances || !estimatedFee) {
      return;
    }

    setCanPayFeeAndDeposit(undefined);

    if (proxyAddress && proxyAddressBalances) {
      const canPayFee = getValue('available', proxyAddressBalances)?.gt(estimatedFee);

      if (deposit && !deposit.isZero()) {
        const canPayDeposit = getValue('available', balances)?.gte(deposit);

        const statement = getStatement(canPayFee, canPayDeposit, false, true, true);

        setCanPayFeeAndDeposit(statement === CanPayStatements.CAN_PAY);
        setCanPayStatement(statement);

        return;
      }

      const statement = getStatement(canPayFee, true, false, true, false);

      setCanPayFeeAndDeposit(statement === CanPayStatements.CAN_PAY);
      setCanPayStatement(statement);
    }

    if (!proxyAddress) {
      const available = getValue('available', balances);
      const wholeAmount = estimatedFee.add(deposit ?? BN_ZERO);

      const canPayFee = !!available?.gt(estimatedFee);
      const canPayDeposit = !!available?.gte(deposit ?? BN_ZERO);
      const canPayWholeAmount = !!available?.gt(wholeAmount);

      const statement = getStatement(canPayFee, canPayDeposit, canPayWholeAmount, false, deposit && !deposit.isZero());

      setCanPayStatement(statement);
      setCanPayFeeAndDeposit(statement === CanPayStatements.CAN_PAY);
    }
  }, [balances, deposit, estimatedFee, proxyAddress, proxyAddressBalances, getStatement]);

  return { isAbleToPay: canPayFeeAndDeposit, statement: canPayStatement ?? 0 };
}
