// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { BN } from '@polkadot/util';

import { FormatPrice } from '.';

jest.setTimeout(20000);

const amountSym = [
  { sym: '', value: 5 },
  { sym: 'k', value: 3 * (10 ** 3) },
  { sym: 'M', value: 4 * (10 ** 6) },
  { sym: 'G', value: 9 * (10 ** 9) },
  { sym: 'T', value: 7 * (10 ** 12) },
  { sym: 'P', value: 6 * (10 ** 15) },
  { sym: 'E', value: 1 * (10 ** 18) }
];

describe('Testing FormatePrice component', () => {
  test('No input props', () => {
    const { getByText } = render(
      <FormatPrice />
    );

    expect(getByText('$0')).toBeTruthy();
  });

  test('With num', () => {
    amountSym.forEach((item) => {
      const { getByText } = render(
        <FormatPrice
          num={item.value}
        />
      );

      const justNum = item.value.toString()[0];

      expect(getByText(`$${justNum}${item.sym}`)).toBeTruthy();
      cleanup();
    });
  });

  test('With amount & decimal & price', () => {
    const { getByText } = render(
      <FormatPrice
        amount={new BN('8000000000000')}
        decimals={12}
        price={55}
      />
    );

    const result = 8 * 55;

    expect(getByText(`$${result}`)).toBeTruthy();
  });
});
