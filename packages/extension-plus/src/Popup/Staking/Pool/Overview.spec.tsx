// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { FormatBalance } from '../../../components';
import getChainInfo from '../../../util/getChainInfo';
import { ChainInfo } from '../../../util/plusTypes';
import { pool } from '../../../util/test/testHelper';
import Overview from './Overview';

jest.setTimeout(60000);
let chainInfo: ChainInfo;
const availableBalance = new BN(400000000000);
let currentEraIndex: number;

describe('Testing overview component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
    currentEraIndex = Number(await chainInfo.api.query.staking.currentEra());
  });

  test('Checking the existance of elements', () => {
    const { queryAllByTestId } = render(
      <Overview
        api={chainInfo.api}
        availableBalance={availableBalance}
        currentEraIndex={currentEraIndex}
        myPool={pool('')}
      />
    );

    const formatBalance = (value: BN | undefined): string | null => {
      return render(
        <FormatBalance
          api={chainInfo.api}
          value={value}
        />
      ).asFragment().textContent;
    };

    const staked = pool('') === undefined ? undefined : new BN(pool('')?.member?.points ?? 0);
    const claimable = pool('') === undefined ? undefined : new BN(pool('')?.myClaimable ?? 0);

    let redeemValue = BN_ZERO;
    let unlockingValue = BN_ZERO;

    for (const [era, unbondingPoint] of Object.entries(pool('').member?.unbondingEras)) {
      if (currentEraIndex > Number(era)) {
        redeemValue = redeemValue.add(new BN(unbondingPoint as string));
      } else {
        unlockingValue = unlockingValue.add(new BN(unbondingPoint as string));
      }
    }

    expect(queryAllByTestId('ShowBalance2')[0].textContent).toEqual('Available' + formatBalance(availableBalance));
    expect(queryAllByTestId('ShowBalance2')[1].textContent).toEqual('Staked' + formatBalance(staked));
    expect(queryAllByTestId('ShowBalance2')[2].textContent).toEqual('Rewards' + formatBalance(claimable));
    expect(queryAllByTestId('ShowBalance2')[3].textContent).toEqual('Redeemable' + formatBalance(redeemValue));
    expect(queryAllByTestId('ShowBalance2')[4].textContent).toEqual('Unstaking' + formatBalance(unlockingValue));
  });

  test('When somthing went wrong', () => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const newApi = i === 0 ? (j === 0 ? undefined : null) : chainInfo.api;
        const newCurrentEraIndex = i === 1 ? (j === 0 ? undefined : null) : currentEraIndex;
        const newMyPool = i === 2 ? (j === 0 ? undefined : null) : pool('');

        const { queryAllByTestId } = render(
          <Overview
            api={newApi}
            availableBalance={availableBalance}
            currentEraIndex={newCurrentEraIndex}
            myPool={newMyPool}
          />
        );

        const formatBalance = (value: BN | undefined): string | null => {
          return render(
            <FormatBalance
              api={chainInfo.api}
              value={value}
            />
          ).asFragment().textContent;
        };

        const staked = pool('') === undefined ? undefined : new BN(pool('')?.member?.points ?? 0);
        const claimable = pool('') === undefined ? undefined : new BN(pool('')?.myClaimable ?? 0);

        let redeemValue = BN_ZERO;
        let unlockingValue = BN_ZERO;

        for (const [era, unbondingPoint] of Object.entries(pool('').member?.unbondingEras)) {
          if (currentEraIndex > Number(era)) {
            redeemValue = redeemValue.add(new BN(unbondingPoint as string));
          } else {
            unlockingValue = unlockingValue.add(new BN(unbondingPoint as string));
          }
        }
        console.log('count: ', i)

        if (i === 0) {
          expect(queryAllByTestId('ShowBalance2')[0].textContent).toBe('Available');
          expect(queryAllByTestId('ShowBalance2')[1].textContent).toBe('Staked');
          expect(queryAllByTestId('ShowBalance2')[2].textContent).toBe('Rewards');
          expect(queryAllByTestId('ShowBalance2')[3].textContent).toBe('Redeemable');
          expect(queryAllByTestId('ShowBalance2')[4].textContent).toBe('Unstaking');
        } else if (i === 1) {
          expect(queryAllByTestId('ShowBalance2')[0].textContent).toBe('Available' + formatBalance(availableBalance));
          expect(queryAllByTestId('ShowBalance2')[1].textContent).toBe('Staked' + formatBalance(staked));
          expect(queryAllByTestId('ShowBalance2')[2].textContent).toBe('Rewards' + formatBalance(claimable));
          expect(queryAllByTestId('ShowBalance2')[3].textContent).toBe('Redeemable');
          expect(queryAllByTestId('ShowBalance2')[4].textContent).toBe('Unstaking');
        } else {
          if (j === 0) {
            expect(queryAllByTestId('ShowBalance2')[0].textContent).toBe('Available' + formatBalance(availableBalance));
            expect(queryAllByTestId('ShowBalance2')[1].textContent).toBe('Staked');
            expect(queryAllByTestId('ShowBalance2')[2].textContent).toBe('Rewards');
            expect(queryAllByTestId('ShowBalance2')[3].textContent).toBe('Redeemable');
            expect(queryAllByTestId('ShowBalance2')[4].textContent).toBe('Unstaking');
          } else {
            expect(queryAllByTestId('ShowBalance2')[0].textContent).toBe('Available' + formatBalance(availableBalance));
            expect(queryAllByTestId('ShowBalance2')[1].textContent).toBe('Staked' + formatBalance(BN_ZERO));
            expect(queryAllByTestId('ShowBalance2')[2].textContent).toBe('Rewards' + formatBalance(BN_ZERO));
            expect(queryAllByTestId('ShowBalance2')[3].textContent).toBe('Redeemable' + formatBalance(BN_ZERO));
            expect(queryAllByTestId('ShowBalance2')[4].textContent).toBe('Unstaking' + formatBalance(BN_ZERO));
          }
        }

        cleanup();
      }
    }
  });
});
