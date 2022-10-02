// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import { cleanup, Matcher, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { BN } from '@polkadot/util';

import { FormatBalance } from '../../../components';
import getChainInfo from '../../../util/getChainInfo';
import { ChainInfo } from '../../../util/plusTypes';
import { chain, makeShortAddr, pool, poolsMembers } from '../../../util/test/testHelper';
import PoolMoreInfo from './PoolMoreInfo';

ReactDOM.createPortal = jest.fn((modal) => modal);
jest.setTimeout(60000);
let chainInfo: ChainInfo;

describe('Testing poolInfo component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
  });

  test('Checking the existance of elements', async () => {
    const poolId = new BN('3');
    const { queryAllByTestId, queryAllByText, queryByText } = render(
      <PoolMoreInfo
        api={chainInfo.api}
        chain={chain()}
        pool={pool('open')}
        poolId={poolId}
        poolsMembers={poolsMembers}
        showPoolInfo={true}
      />
    );

    const mayPoolBalance = pool('open')?.ledger?.active ?? pool('open')?.bondedPool?.points;
    const staked = mayPoolBalance ? chainInfo.api.createType('Balance', mayPoolBalance) : undefined;
    const myPoolMembers = poolsMembers && pool('open') ? poolsMembers[Number(poolId)] : undefined;

    const formatBalance = (value: BN | undefined) => {
      return render(
        <FormatBalance
          api={chainInfo.api}
          value={value}
        />
      ).asFragment().textContent;
    };

    expect(queryByText('Pool Info')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(String(pool('open').poolId))).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(pool('open')?.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(pool('open')?.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked?.toHuman() as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(pool('open')?.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();

    expect(queryByText('Roles')).toBeTruthy();
    expect(queryByText('Root:')).toBeTruthy();
    expect(queryByText('Depositor:')).toBeTruthy();
    expect(queryByText('Nominator:')).toBeTruthy();
    expect(queryByText('State toggler:')).toBeTruthy();

    await waitFor(() => expect(queryAllByText(makeShortAddr(pool('open').bondedPool?.roles.root as unknown as string) as unknown as Matcher).length).toBe(4), { timeout: 30000 });

    expect(queryByText('Ids')).toBeTruthy();
    expect(queryByText('Stash id:')).toBeTruthy();
    expect(queryByText(makeShortAddr(pool('open').accounts?.stashId as string) as Matcher)).toBeTruthy();
    expect(queryByText('Reward id:')).toBeTruthy();
    expect(queryByText(makeShortAddr(pool('open').accounts?.rewardId as string) as Matcher)).toBeTruthy();

    expect(queryByText('Rewards')).toBeTruthy();
    expect(queryByText('Pool claimable:')).toBeTruthy();
    expect(queryAllByTestId('ShowBalance2')[0].textContent).toEqual(formatBalance(pool('open').rewardClaimable));
    expect(queryByText('Pool total earnings:')).toBeTruthy();
    expect(queryAllByTestId('ShowBalance2')[1].textContent).toEqual(formatBalance(pool('open').rewardPool?.totalEarnings));

    expect(queryByText(`Members (${myPoolMembers.length})`)).toBeTruthy();
  });

  test('When something went wrong', () => {
    for (let i = 2; i <= 2; i++) {
      const { queryByText } = render(
        <PoolMoreInfo
          api={chainInfo.api}
          chain={chain()}
          pool={i === 1 ? undefined : pool('open')}
          poolId={pool('open').poolId}
          poolsMembers={i === 2 ? undefined : poolsMembers}
          showPoolInfo={true}
        />
      );

      expect(queryByText('Pool Info')).toBeTruthy();

      if (i === 1) {
        expect(queryByText('Loading pool ....')).toBeTruthy();
        expect(queryByText('Members (0)')).toBeTruthy();
      } else {
        expect(queryByText('Loading pool ....')).toBeFalsy();
        expect(queryByText('Index')).toBeTruthy();
        expect(queryByText('Roles')).toBeTruthy();
        expect(queryByText('Ids')).toBeTruthy();
        expect(queryByText('Rewards')).toBeTruthy();

        expect(queryByText('Members (0)')).toBeTruthy();
      }

      cleanup();
    }
  });
});
