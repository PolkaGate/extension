// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import { cleanup, Matcher, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import getChainInfo from '../../../util/getChainInfo';
import { AccountsBalanceType, ChainInfo } from '../../../util/plusTypes';
import { amountToMachine } from '../../../util/plusUtils';
import { chain, makeShortAddr, pool, poolsMembers } from '../../../util/test/testHelper';
import PoolTab from './PoolTab';

jest.setTimeout(100000);
ReactDOM.createPortal = jest.fn((modal) => modal);
let chainInfo: ChainInfo;
const availableBalance = '5.4321';
let staker: AccountsBalanceType;

describe('Testing pool tab', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
    staker = { address: '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD', chain: 'westend', name: 'Amir khan', balanceInfo: { available: amountToMachine(availableBalance, chainInfo.decimals), decimals: chainInfo.decimals } };
  });

  test('Checking the existence of components while loading', () => {
    for (let i = 1; i <= 3; i++) {
      const { queryByText } = render(
        <PoolTab
          api={i % 2 === 0 ? chainInfo.api : undefined}
          chain={chain('Kusama')} // Don't care
          newPool={undefined} // Don't care
          pool={i <= 2 ? undefined : pool()}
          poolsMembers={poolsMembers} // Don't care
          staker={staker} // Don't care
        />
      );

      expect(queryByText('Loading ...')).toBeTruthy();
      cleanup();
    }
  });

  test('No active pool found', () => {
    const { queryByText } = render(
      <PoolTab
        api={chainInfo.api}
        chain={chain('Kusama')} // Don't care
        newPool={undefined} // Don't care
        pool={null}
        poolsMembers={poolsMembers} // Don't care
        staker={staker} // Don't care
      />
    );

    expect(queryByText('No active pool found')).toBeTruthy();
  });

  test('Active pool found', async () => {
    const Conditions = [
      ['open', '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD'],
      ['open', 'not the root or state toggler account address'],
      ['blocked', '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD'],
      ['blocked', 'not the root or state toggler account address'],
      ['destroying', '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD'],
      ['destroying', 'not the root or state toggler account address']
    ];

    for (const Condition of Conditions) {
      const poolStates = pool(Condition[0]);

      staker.address = Condition[1];

      const { queryAllByText, queryByText } = render(
        <PoolTab
          api={chainInfo.api}
          chain={chain('Kusama')}
          newPool={undefined} // Don't care
          pool={poolStates}
          poolsMembers={poolsMembers}
          staker={staker}
        />
      );

      const poolId = poolStates?.poolId || poolStates?.member?.poolId;
      const mayPoolBalance = poolStates?.ledger?.active ?? poolStates?.bondedPool?.points;
      const staked = mayPoolBalance ? chainInfo.api.createType('Balance', mayPoolBalance) : undefined;

      expect(queryByText('Index')).toBeTruthy();
      expect(queryByText(String(poolId))).toBeTruthy();
      expect(queryByText('Name')).toBeTruthy();
      expect(queryByText(poolStates?.metadata as Matcher)).toBeTruthy();
      expect(queryByText('State')).toBeTruthy();
      expect(queryByText(poolStates?.bondedPool?.state as unknown as Matcher, { selector: 'div' })).toBeTruthy();
      expect(queryByText('Staked')).toBeTruthy();
      expect(queryByText(staked?.toHuman() as Matcher)).toBeTruthy();
      expect(queryByText('Members')).toBeTruthy();
      expect(queryByText(poolStates?.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();

      expect(queryByText('Roles')).toBeTruthy();
      expect(queryByText('Root:')).toBeTruthy();
      expect(queryByText('Depositor:')).toBeTruthy();
      expect(queryByText('Nominator:')).toBeTruthy();
      expect(queryByText('State toggler:')).toBeTruthy();
      await waitFor(() => expect(queryAllByText(makeShortAddr(poolStates.bondedPool?.roles.root as unknown as string) as unknown as Matcher).length).toBe(4), { timeout: 30000 });

      if ([String(poolStates.bondedPool?.roles.stateToggler), String(poolStates.bondedPool?.roles.root)].includes(staker.address)) {
        expect(queryByText('Ids')).toBeFalsy();
        expect(queryByText('Destroy', { selector: 'button' })).toBeTruthy();
        expect(queryByText('Block', { selector: 'button' })).toBeTruthy();
        expect(queryByText('Open', { selector: 'button' })).toBeTruthy();
        expect(queryByText('Edit', { selector: 'button' })).toBeTruthy();

        if (String(poolStates.bondedPool?.state) === 'open') {
          expect(queryByText('Open', { selector: 'button' })?.hasAttribute('disabled')).toBeTruthy();
          expect(queryByText('Block', { selector: 'button' })?.hasAttribute('disabled')).toBeFalsy();
          expect(queryByText('Destroy', { selector: 'button' })?.hasAttribute('disabled')).toBeFalsy();
          expect(queryByText('Edit', { selector: 'button' })?.hasAttribute('disabled')).toBeFalsy();
        }

        if (String(poolStates.bondedPool?.state) === 'blocked') {
          expect(queryByText('Open', { selector: 'button' })?.hasAttribute('disabled')).toBeFalsy();
          expect(queryByText('Block', { selector: 'button' })?.hasAttribute('disabled')).toBeTruthy();
          expect(queryByText('Destroy', { selector: 'button' })?.hasAttribute('disabled')).toBeFalsy();
          expect(queryByText('Edit', { selector: 'button' })?.hasAttribute('disabled')).toBeFalsy();
        }

        if (String(poolStates.bondedPool?.state) === 'destroying') {
          expect(queryByText('Open', { selector: 'button' })?.hasAttribute('disabled')).toBeTruthy();
          expect(queryByText('Block', { selector: 'button' })?.hasAttribute('disabled')).toBeTruthy();
          expect(queryByText('Destroy', { selector: 'button' })?.hasAttribute('disabled')).toBeTruthy();
          expect(queryByText('Edit', { selector: 'button' })?.hasAttribute('disabled')).toBeTruthy();
        }
      } else {
        expect(queryByText('Ids')).toBeTruthy();

        expect(queryByText('Stash id:')).toBeTruthy();
        await waitFor(() => expect(queryByText(makeShortAddr(poolStates.accounts?.stashId as string) as Matcher)).toBeTruthy(), { timeout: 30000 });

        expect(queryByText('Reward id:')).toBeTruthy();
        await waitFor(() => expect(queryByText(makeShortAddr(poolStates.accounts?.rewardId as string) as Matcher)).toBeTruthy(), { timeout: 30000 });

        expect(queryByText('Open', { selector: 'button' })).toBeFalsy();
        expect(queryByText('Block', { selector: 'button' })).toBeFalsy();
        expect(queryByText('Destroy', { selector: 'button' })).toBeFalsy();
        expect(queryByText('Edit', { selector: 'button' })).toBeFalsy();
      }

      cleanup();
    }
  });
});
