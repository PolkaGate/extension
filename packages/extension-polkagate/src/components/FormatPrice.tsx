// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { BN } from '@polkadot/util';

interface Props {
  num?: number;
  amount?: BN;
  price?: number,
  decimalPoint?: number;
  decimals?: number;
}

function nFormatter(num: number, digits: number) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });

  if (!item && num > 0) {
    return num.toFixed(digits).replace(rx, '$1');
  }

  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

function FormatPrice({ amount, decimalPoint = 2, decimals, num, price }: Props): React.ReactElement<Props> {
  const total = num ?? (amount.toNumber() * 10 ** -decimals) * price;

  return (
    <>
      {`$${nFormatter(total, decimalPoint)}`}
    </>
  );
}

export default React.memo(FormatPrice);
