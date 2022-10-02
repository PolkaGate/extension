// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { Chain } from '../../../../../extension-chains/src/types';
import getChainInfo from '../../../util/getChainInfo';
import { AccountsBalanceType, ChainInfo } from '../../../util/plusTypes';
import { amountToMachine } from '../../../util/plusUtils';
import { poolsInfo, poolsMembers, poolStakingConst } from '../../../util/test/testHelper';
import JoinPool from './JoinPool';

ReactDOM.createPortal = jest.fn((modal) => modal);
jest.setTimeout(260000);
const chain: Chain = {
  name: 'westend'
};
const availableBalance = '5.4321';
let chainInfo: ChainInfo;
let staker: AccountsBalanceType;

const setStakeAmount = jest.fn();
const setPool = jest.fn();
const setState = jest.fn();

describe('Testing joinPool component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
    staker = {
      address: '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD',
      chain: 'westend',
      name: 'Amir khan',
      balanceInfo: {
        available: amountToMachine(availableBalance, chainInfo.decimals),
        decimals: chainInfo.decimals
      }
    };
  });

  test('Checking the existance of elements', async () => {
    const { getAllByRole, getByRole, queryByText } = render(
      <JoinPool
        api={chainInfo.api}
        chain={chain}
        poolStakingConsts={poolStakingConst}
        poolsInfo={poolsInfo}
        poolsMembers={poolsMembers}
        setPool={setPool}
        setStakeAmount={setStakeAmount}
        setState={setState}
        showJoinPoolModal={true}
        staker={staker}
      />
    );

    const poolsToShow = [];

    poolsInfo.map((p) => {
      if (String(p?.bondedPool?.state) === 'Open') {
        poolsToShow.push(p);
      }
    });

    expect(queryByText('Join Pool')).toBeTruthy();
    expect(getByRole('spinbutton', { hidden: true, name: 'Amount' })).toBeTruthy();
    expect(queryByText('Fee:')).toBeTruthy();

    await waitFor(() => expect(getByRole('button', { hidden: true, name: 'min' })).toBeTruthy(), {
      timeout: 20000
    });

    expect(getByRole('button', { hidden: true, name: 'max' })).toBeTruthy();
    expect(queryByText('Choose a pool to join')).toBeTruthy();

    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText('Choose')).toBeTruthy();

    expect(getAllByRole('checkbox', { hidden: true })).toHaveLength(poolsToShow.length);
    expect(getAllByRole('checkbox', { checked: true, hidden: true })).toHaveLength(1);

    expect(getByRole('button', { hidden: true, name: 'Next' })).toBeTruthy();
    expect(getByRole('button', { hidden: true, name: 'Next' }).hasAttribute('disabled')).toBe(true);

    fireEvent.click(getByRole('button', { hidden: true, name: 'max' }));

    expect(getByRole('button', { hidden: true, name: 'Next' })).toBeTruthy();
    expect(getByRole('button', { hidden: true, name: 'Next' }).hasAttribute('disabled')).toBe(false);
  });

  test('Checking the existance of elements when pools info is empty', async () => {
    const { getByRole, queryByText } = render(
      <JoinPool
        api={chainInfo.api}
        chain={chain}
        poolStakingConsts={poolStakingConst}
        poolsInfo={[]}
        poolsMembers={poolsMembers}
        setPool={setPool}
        setStakeAmount={setStakeAmount}
        setState={setState}
        showJoinPoolModal={true}
        staker={staker}
      />
    );

    expect(queryByText('Join Pool')).toBeTruthy();
    expect(getByRole('spinbutton', { hidden: true, name: 'Amount' })).toBeTruthy();
    expect(queryByText('Fee:')).toBeTruthy();

    await waitFor(() => expect(getByRole('button', { hidden: true, name: 'min' })).toBeTruthy(), {
      timeout: 20000
    });

    expect(getByRole('button', { hidden: true, name: 'max' })).toBeTruthy();
    expect(queryByText('Choose a pool to join')).toBeTruthy();

    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText('Choose')).toBeTruthy();

    expect(queryByText('Loading ...')).toBeTruthy();

    expect(getByRole('button', { hidden: true, name: 'Next' })).toBeTruthy();
    expect(getByRole('button', { hidden: true, name: 'Next' }).hasAttribute('disabled')).toBe(true);
  });
});
