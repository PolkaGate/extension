// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { BN } from '@polkadot/util';

import { FormatBalance2 } from '.';

jest.setTimeout(20000);
const TwoDots = '2000000000000';
const OneDotBN = new BN('1000000000000');
const token = 'DOT';

describe('Testing Address component', () => {
  test('Value as string and different decimalPoints', () => {
    let zeros = '0';

    [1, 2, 3, undefined].forEach((decimalPoint) => {
      const { container } = render(
        <FormatBalance2
          decimalPoint={decimalPoint}
          decimals={[12]}
          tokens={[token]}
          value={TwoDots}
        />
      );

      expect(container.textContent).toBe(`2.${zeros} ${token}`);
      cleanup();
      zeros += '0';
    });
  });

  test('Value as BN and different decimalPoints', () => {
    let zeros = '0';

    [1, 2, 3, undefined].forEach((decimalPoint) => {
      const { container } = render(
        <FormatBalance2
          decimalPoint={decimalPoint}
          decimals={[12]}
          tokens={[token]}
          value={OneDotBN}
        />
      );

      expect(container.textContent).toBe(`1.${zeros} ${token}`);
      cleanup();
      zeros += '0';
    });
  });
});
