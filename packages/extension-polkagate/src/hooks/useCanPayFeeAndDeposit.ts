// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';
import type { BalancesInfo, CanPayFee } from '../util/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { getValue } from '../popup/account/util';
import useBalances from './useBalances';
import useTranslation from './useTranslation';

/**
 * Enum representing different payment capability states
 */
export enum CanPayStatements {
  /** Account cannot pay fee or deposit */
  CAN_NOT_PAY,
  /** Account can pay both fee and deposit */
  CAN_PAY,
  /** Account cannot pay the transaction fee */
  CAN_NOT_PAY_FEE,
  /** Account cannot pay the required deposit */
  CAN_NOT_PAY_DEPOSIT,
  /** Proxy account can pay the fee (but main account handles deposit) */
  PROXY_CAN_PAY_FEE,
}

interface PaymentCapability {
  canPayFee: boolean;
  canPayDeposit: boolean;
  canPayWholeAmount: boolean;
  hasDeposit: boolean;
  useProxy: boolean;
}

/**
 * Determine if an account can pay transaction fees and deposits
 * Supports both direct payments and proxy account scenarios
 *
 * @param address - The main account address
 * @param genesisHash - Chain genesis hash for network identification
 * @param proxyAddress - Optional proxy account address that can pay fees
 * @param estimatedFee - Estimated transaction fee
 * @param deposit - Required deposit amount (if any)
 * @param balancesFromProps - Optional pre-fetched balance info to avoid redundant API calls
 * @returns Object containing payment capability status and detailed statement
 */
export default function useCanPayFeeAndDeposit (
  address: AccountId | string | undefined,
  genesisHash: string | undefined,
  proxyAddress: AccountId | string | undefined,
  estimatedFee: Balance | BN | undefined | null,
  deposit?: BN | Balance | undefined,
  balancesFromProps?: BalancesInfo | undefined
): CanPayFee {
  const { t } = useTranslation();
  const balancesFromAddress = useBalances(address?.toString(), genesisHash);
  const proxyAddressBalances = useBalances(proxyAddress?.toString(), genesisHash);
  const balances = balancesFromProps || balancesFromAddress;

  const [canPayFeeAndDeposit, setCanPayFeeAndDeposit] = useState<boolean | undefined>();
  const [canPayStatement, setCanPayStatement] = useState<number>();

  /**
   * Memoized calculation of basic payment parameters
  */
  const paymentParams = useMemo(() => {
    if (!balances || !estimatedFee) {
      return null;
    }

    const available = getValue('transferable', balances);
    const depositAmount = deposit ?? BN_ZERO;
    const hasDeposit = !!(deposit && !deposit.isZero());
    const wholeAmount = estimatedFee.add(depositAmount);

    return {
      available,
      depositAmount,
      hasDeposit,
      useProxy: !!proxyAddress,
      wholeAmount
    };
  }, [balances, estimatedFee, deposit, proxyAddress]);

  /**
   * Handles payment logic when using a proxy account
   * Proxy pays fees, main account pays deposits
   */
  const determineProxyPaymentStatement = useCallback((canPayFee: boolean, canPayDeposit: boolean, hasDeposit: boolean): CanPayStatements => {
    if (!hasDeposit) {
      // No deposit required, only need to check fee payment
      return canPayFee ? CanPayStatements.CAN_PAY : CanPayStatements.PROXY_CAN_PAY_FEE;
    }

    if (canPayFee && canPayDeposit) {
      return CanPayStatements.CAN_PAY;
    }

    if (canPayFee && !canPayDeposit) {
      return CanPayStatements.CAN_NOT_PAY_DEPOSIT;
    }

    if (!canPayFee && canPayDeposit) {
      return CanPayStatements.PROXY_CAN_PAY_FEE;
    }

    return CanPayStatements.CAN_NOT_PAY;
  }, []);

  /**
   * Handles payment logic for direct payments (no proxy)
   * Main account must pay both fees and deposits
   */
  const determineDirectPaymentStatement = useCallback((canPayFee: boolean, canPayDeposit: boolean, canPayWholeAmount: boolean, hasDeposit: boolean): CanPayStatements => {
    if (!hasDeposit) {
      // No deposit required, only check fee payment
      return canPayFee ? CanPayStatements.CAN_PAY : CanPayStatements.CAN_NOT_PAY_FEE;
    }

    if (canPayWholeAmount) {
      return CanPayStatements.CAN_PAY;
    }

    if (canPayDeposit && !canPayFee) {
      return CanPayStatements.CAN_NOT_PAY_FEE;
    }

    if (!canPayDeposit && canPayFee) {
      return CanPayStatements.CAN_NOT_PAY_DEPOSIT;
    }

    return CanPayStatements.CAN_NOT_PAY;
  }, []);

  /**
   * Determines the payment statement based on various payment capabilities
   * This function encapsulates the complex logic for different scenarios
   */
  const determinePaymentStatement = useCallback((capability: PaymentCapability): CanPayStatements => {
    const { canPayDeposit, canPayFee, canPayWholeAmount, hasDeposit, useProxy } = capability;

    if (useProxy) {
      return determineProxyPaymentStatement(canPayFee, canPayDeposit, hasDeposit);
    }

    return determineDirectPaymentStatement(canPayFee, canPayDeposit, canPayWholeAmount, hasDeposit);
  }, [determineDirectPaymentStatement, determineProxyPaymentStatement]);

  /**
   * Main effect that calculates payment capability when dependencies change
   */
  useEffect(() => {
    if (!estimatedFee) {
      return;
    }

    // Reset state if required data is missing
    if (!paymentParams) {
      setCanPayFeeAndDeposit(undefined);

      return;
    }

    const { available, depositAmount, hasDeposit, useProxy, wholeAmount } = paymentParams;

    let capability: PaymentCapability;

    if (useProxy && proxyAddressBalances) {
      // Proxy scenario: proxy pays fees, main account pays deposit
      const proxyAvailable = getValue('available', proxyAddressBalances);

      capability = {
        canPayDeposit: !depositAmount.isZero() && !!available?.gte(depositAmount),
        canPayFee: !!proxyAvailable?.gt(estimatedFee),
        canPayWholeAmount: false, // Not applicable in proxy scenario
        hasDeposit,
        useProxy: true
      };
    } else if (!useProxy) {
      // Direct payment scenario: main account pays everything
      capability = {
        canPayDeposit: !!available?.gte(depositAmount),
        canPayFee: !!available?.gt(estimatedFee),
        canPayWholeAmount: !!available?.gt(wholeAmount),
        hasDeposit,
        useProxy: false
      };
    } else {
      // Proxy address provided but balances not loaded yet
      return;
    }

    // Determine the payment statement and update state
    const statement = determinePaymentStatement(capability);
    const canPay = statement === CanPayStatements.CAN_PAY;

    setCanPayStatement(statement);
    setCanPayFeeAndDeposit(canPay);
  }, [paymentParams, proxyAddressBalances, estimatedFee, determinePaymentStatement]);

  const warning = useMemo(() => {
    if (canPayStatement === undefined) {
      return;
    }

    switch (canPayStatement as CanPayStatements) {
      case CanPayStatements.CAN_NOT_PAY_FEE:
        return t('Insufficient balance to cover transaction fee.');

      case CanPayStatements.CAN_NOT_PAY:
        return t('Insufficient balance to complete the transaction.');

      case CanPayStatements.CAN_NOT_PAY_DEPOSIT:
        return t('Insufficient balance for transaction deposit.');

      case CanPayStatements.PROXY_CAN_PAY_FEE:
        return t('Selected proxy account lacks funds for the fee.');

      default:
        return undefined;
    }
  }, [canPayStatement, t]);

  return {
    isAbleToPay: canPayFeeAndDeposit,
    statement: canPayStatement ?? 0,
    warning
  };
}
