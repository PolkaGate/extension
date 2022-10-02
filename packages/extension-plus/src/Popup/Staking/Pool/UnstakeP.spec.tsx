// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import { render } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import getChainInfo from '../../../util/getChainInfo';
import { AccountsBalanceType, ChainInfo } from '../../../util/plusTypes';
import { amountToMachine } from '../../../util/plusUtils';
import { pool, poolStakingConst } from '../../../util/test/testHelper';
import Unstake from './Unstake';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);
const availableBalance = '4';
let chainInfo: ChainInfo;
let staker: AccountsBalanceType;

describe('Testing unstake tab', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
    staker = { balanceInfo: { available: amountToMachine(availableBalance, chainInfo.decimals), decimals: chainInfo.decimals } };
  });

  test('Checking the exist component while loading', () => {
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
        api={undefined} // Don't care
        availableBalance={new BN('0')} // Don't care
        currentlyStaked={undefined}
        pool={undefined} // Don't care
        poolStakingConsts={poolStakingConst} // Don't care
        staker={staker} // Don't care
      />
    );

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Fetching data from blockchain ...')).toBeTruthy();
    expect(queryAllByRole('button').length).toBe(1);
    expect(queryAllByRole('button')[0]?.textContent).toEqual('Next');
    expect(queryAllByRole('button')[0]?.hasAttribute('disabled')).toBeTruthy();
  });

  test('When account hasn\'t staked', () => {
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
        api={undefined} // Don't care
        availableBalance={new BN('0')} // Don't care
        currentlyStaked={null}
        pool={undefined} // Don't care
        poolStakingConsts={poolStakingConst} // Don't care
        staker={staker} // Don't care
      />
    );

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Fetching data from blockchain ...')).toBeFalsy();
    expect(queryByText('Nothing to unstake')).toBeTruthy();
    expect(queryByText('Unable to pay fee')).toBeFalsy();
    expect(queryAllByRole('button').length).toBe(1);
    expect(queryAllByRole('button')[0]?.hasAttribute('disabled')).toBeTruthy();
  });

  test('When account has staked', () => {
    staker.address = '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD';
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
        api={chainInfo.api} // Don't care
        availableBalance={new BN('400000000000')}
        currentlyStaked={new BN(pool().member?.points.toString() as string)}
        pool={pool()}
        poolStakingConsts={poolStakingConst}
        staker={staker}
      />
    );

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Max:')).toBeTruthy();
    expect(queryAllByRole('button').length).toBe(2);
    expect(queryAllByRole('button')[1]?.textContent).toEqual('Next');
    expect(queryAllByRole('button')[1]?.hasAttribute('disabled')).toBeTruthy();
  });

  test('When there is nothing to unstake', () => {
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
        api={undefined} // Don't care
        availableBalance={new BN('0')} // Don't care
        currentlyStaked={new BN('0')}
        pool={undefined} // Don't care
        poolStakingConsts={poolStakingConst} // Don't care
        staker={staker} // Don't care
      />
    );

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Nothing to unstake')).toBeTruthy();
    expect(queryAllByRole('button').length).toBe(1);
    expect(queryAllByRole('button')[0]?.textContent).toEqual('Next');
    expect(queryAllByRole('button')[0]?.hasAttribute('disabled')).toBeTruthy();
  });
});
