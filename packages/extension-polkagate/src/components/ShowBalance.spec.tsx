// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { cleanup, render, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { useApiWithChain } from '../hooks';
import { getDecimal, getToken, kusamaGenesisHash } from '../util/test/testHelper';
import { ShowBalance } from '.';

jest.setTimeout(90000);
const balanceToShow = new BN('1000000000000');

let api: ApiPromise | undefined;
let BalanceToShowInHuman: string | undefined;

describe('Testing ShowBalance component', () => {
  beforeAll(async () => {
    const { result } = renderHook((prop) => useApiWithChain(prop.chain as Chain), { initialProps: { chain: { name: 'kusama' } } });

    await waitFor(() => expect(result.current).toBeTruthy(), {
      onTimeout (error) {
        console.error('Api connection is lost!');

        return error;
      },
      timeout: 60000
    });

    api = result.current;
    BalanceToShowInHuman = api?.createType('Balance', balanceToShow).toHuman();
  });

  afterEach(() => {
    cleanup();
  });

  test('Skeleton', () => {
    const { container } = render(
      <ShowBalance
        balance={balanceToShow}
      />
    );

    expect(container.getElementsByTagName('span')).toBeTruthy();
    expect(container.getElementsByTagName('span').item(0)?.className).toContain('MuiSkeleton-root');
  });

  test('With API', () => {
    const { container } = render(
      <ShowBalance
        api={api}
        balance={balanceToShow}
      />
    );

    expect(container.getElementsByClassName('ui--FormatBalance-value').item(0)?.textContent).toBe(BalanceToShowInHuman);
  });

  test('With Token & Decimal', () => {
    const token = getToken(kusamaGenesisHash);
    const decimal = getDecimal(kusamaGenesisHash);

    const { container } = render(
      <ShowBalance
        balance={balanceToShow}
        decimal={decimal}
        token={token}
      />
    );

    expect(container.getElementsByClassName('ui--FormatBalance-value').item(0)?.textContent).toBe(BalanceToShowInHuman);
  });
});
