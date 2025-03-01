// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Referendum } from '../utils/types';

import { useMemo } from 'react';

import { useCurrency, useInfo, useTokenPrice } from '../../../hooks';

interface ReferendaRequested {
  rAssetInCurrency: number,
  rCurrencySign: string,
  rDecimal: number,
  rToken: string
}

const DEFAULT_OUTPUT = {
  rAssetInCurrency: undefined,
  rCurrencySign: undefined,
  rDecimal: undefined,
  rToken: undefined
};

export default function useReferendaRequested(address: string | undefined, referendum: Referendum | undefined): ReferendaRequested | typeof DEFAULT_OUTPUT {
  const { chainName, decimal, token } = useInfo(address);
  const currency = useCurrency();

  const maybeAssetIdInNumber = referendum?.assetId ? Number(referendum.assetId) : undefined;

  const maybeAssetHubs = useMemo(() => {
    if (!referendum?.assetId || !chainName) {
      return undefined;
    }

    return chainName.includes('Polkadot')
      ? 'polkadot asset hub'
      : chainName.includes('Kusama')
        ? 'kusama asset hub'
        : undefined;
  }, [chainName, referendum?.assetId]);

  const priceInfo = useTokenPrice(address, maybeAssetIdInNumber, maybeAssetHubs);
  const _decimal = priceInfo?.decimal || referendum?.decimal || decimal;
  const _token = priceInfo?.token || referendum?.token || token;

  return useMemo(() => {
    if (!referendum?.requested || !currency || !_decimal || !_token || !priceInfo.price) {
      return DEFAULT_OUTPUT;
    }

    const requestedAssetInCurrency = (Number(referendum.requested) / 10 ** _decimal) * priceInfo.price;

    return {
      rAssetInCurrency: requestedAssetInCurrency,
      rCurrencySign: currency.sign,
      rDecimal: _decimal,
      rToken: _token
    };
  }, [_decimal, _token, currency, priceInfo, referendum?.requested]);
}
