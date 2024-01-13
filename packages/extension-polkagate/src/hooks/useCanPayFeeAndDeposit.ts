// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable curly */

import type { Balance } from '@polkadot/types/interfaces';

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { getValue } from '../popup/account/util';
import { CanPayFee, CanPayStatements } from '../util/types';
import { useBalances } from '.';

export default function useCanPayFeeAndDeposit (formatted: AccountId | string | undefined, proxyAddress: AccountId | string | undefined, estimatedFee: Balance | undefined, deposit: BN | Balance | undefined): CanPayFee {
  const balances = useBalances(formatted?.toString());
  const proxyAddressBalances = useBalances(proxyAddress?.toString());
  const [canPayFeeAndDeposit, setCanPayFeeAndDeposit] = useState<boolean | undefined>();
  const [canPayStatement, setCanPayStatement] = useState<number>();

  const getStatement = useCallback((canPayFee, canPayDeposit, canPayWholeAmount, useProxy, hasDeposit) => {
    if (useProxy) {
      if (hasDeposit) {
        if (canPayFee && canPayDeposit) return CanPayStatements.CANPAY;
        if (canPayFee && !canPayDeposit) return CanPayStatements.CANNOTPAYDEPOSIT;
        if (!canPayFee && canPayDeposit) return CanPayStatements.PROXYCANPAYFEE;

        return CanPayStatements.CANNOTPAY;
      } else {
        if (canPayFee) return CanPayStatements.CANPAY;

        return CanPayStatements.PROXYCANPAYFEE;
      }
    } else {
      if (hasDeposit) {
        if (canPayWholeAmount) return CanPayStatements.CANPAY;
        if (canPayDeposit) return CanPayStatements.CANNOTPAYFEE;
        if (!canPayDeposit && canPayFee) return CanPayStatements.CANNOTPAYDEPOSIT;

        return CanPayStatements.CANNOTPAY;
      } else {
        if (canPayFee) return CanPayStatements.CANPAY;

        return CanPayStatements.CANNOTPAYFEE;
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

        setCanPayFeeAndDeposit(statement === 1);
        setCanPayStatement(statement);

        return;
      }

      const statement = getStatement(canPayFee, true, false, true, false);

      setCanPayFeeAndDeposit(statement === 1);
      setCanPayStatement(statement);
    }

    if (!proxyAddress) {
      const wholeAmount = estimatedFee.add(deposit ?? BN_ZERO);
      const canPayFee = !!getValue('available', balances)?.gt(estimatedFee);
      const canPayDeposit = !!getValue('available', balances)?.gte(deposit ?? BN_ZERO);
      const canPayWholeAmount = !!getValue('available', balances)?.gt(wholeAmount);

      const statement = getStatement(canPayFee, canPayDeposit, canPayWholeAmount, false, deposit && !deposit.isZero());

      setCanPayStatement(statement);
      setCanPayFeeAndDeposit(statement === 1);
    }
  }, [balances, deposit, estimatedFee, proxyAddress, proxyAddressBalances, getStatement]);

  return { isAbleToPay: canPayFeeAndDeposit, statement: canPayStatement ?? 0 };
}
