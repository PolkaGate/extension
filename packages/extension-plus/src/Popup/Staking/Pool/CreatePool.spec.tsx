// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { BN } from '@polkadot/util';

import getChainInfo from '../../../util/getChainInfo';
import { AccountsBalanceType, ChainInfo } from '../../../util/plusTypes';
import { amountToMachine } from '../../../util/plusUtils';
import { chain, poolStakingConst } from '../../../util/test/testHelper';
import CreatePool from './CreatePool';

ReactDOM.createPortal = jest.fn((modal) => modal);
jest.setTimeout(60000);
let chainInfo: ChainInfo;
const availableBalance = '5.4321';
let staker: AccountsBalanceType;
const nextPoolId = new BN('105');
const setStakeAmount = () => null;
const setNewPool = () => null;
const setState = () => null;
const setCreatePoolModalOpen = () => true;

describe('Testing createPool component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
    staker = { address: '5Cqq9GQEV2UdRKdZo2FkKmmBU2ZyxJWYrEpwnqemgyfTZ1ZD', chain: 'westend', name: 'Amir khan', balanceInfo: { available: amountToMachine(availableBalance, chainInfo.decimals), decimals: chainInfo.decimals } };
  });

  test('Checking the existance of elements', async () => {
    const { getAllByRole, getByLabelText, getByRole, getByText } = render(
      <CreatePool
        api={chainInfo.api}
        chain={chain()}
        nextPoolId={nextPoolId}
        poolStakingConsts={poolStakingConst}
        setCreatePoolModalOpen={setCreatePoolModalOpen}
        setNewPool={setNewPool}
        setStakeAmount={setStakeAmount}
        setState={setState}
        showCreatePoolModal={true}
        staker={staker}
      />
    );

    expect(getByText('Create Pool')).toBeTruthy();
    expect(getByLabelText('Pool name')).toBeTruthy();
    expect(getByRole('textbox', { hidden: true, name: 'Pool name' })).toBeTruthy();
    expect(getByRole('textbox', { hidden: true, name: 'Pool name' })?.hasAttribute('disabled')).toBe(false);

    expect(getByLabelText('Pool Id')).toBeTruthy();
    expect(getByRole('textbox', { hidden: true, name: 'Pool Id' })).toBeTruthy();
    expect(getByRole('textbox', { hidden: true, name: 'Pool Id' })?.hasAttribute('disabled')).toBe(true);

    expect(getByLabelText('Amount')).toBeTruthy();
    expect(getByRole('spinbutton', { hidden: true, name: 'Amount' })).toBeTruthy();
    expect(getByRole('spinbutton', { hidden: true, name: 'Amount' })?.hasAttribute('disabled')).toBe(false);

    expect(getByText('Fee:')).toBeTruthy();

    await waitFor(() => expect(getByRole('button', { hidden: true, name: 'min' })).toBeTruthy(), { timeout: 30000 });
    expect(getByRole('button', { hidden: true, name: 'max' })).toBeTruthy();

    expect(getByText('Roles')).toBeTruthy();
    expect(getAllByRole('combobox', { hidden: true })).toHaveLength(4);

    expect(getByLabelText('Depositor')).toBeTruthy();
    expect(getAllByRole('combobox', { hidden: true })[0].getAttribute('value')).toEqual(staker.address);
    expect(getAllByRole('combobox', { hidden: true })[0]?.hasAttribute('disabled')).toBe(true);

    expect(getByLabelText('Root')).toBeTruthy();
    expect(getAllByRole('combobox', { hidden: true })[1].getAttribute('value')).toEqual(staker.address);
    expect(getAllByRole('combobox', { hidden: true })[1]?.hasAttribute('disabled')).toBe(true);

    expect(getByLabelText('Nominator')).toBeTruthy();
    expect(getAllByRole('combobox', { hidden: true })[2].getAttribute('value')).toEqual(staker.address);
    expect(getAllByRole('combobox', { hidden: true })[2]?.hasAttribute('disabled')).toBe(false);

    expect(getByLabelText('State toggler')).toBeTruthy();
    expect(getAllByRole('combobox', { hidden: true })[3].getAttribute('value')).toEqual(staker.address);
    expect(getAllByRole('combobox', { hidden: true })[3]?.hasAttribute('disabled')).toBe(false);

    expect(getByRole('button', { hidden: true, name: 'Next' })).toBeTruthy();
    expect(getByRole('button', { hidden: true, name: 'Next' }).hasAttribute('disabled')).toBe(true);

    fireEvent.click(getByRole('button', { hidden: true, name: 'max' }));
    expect(getByRole('button', { hidden: true, name: 'Next' })).toBeTruthy();
    expect(getByRole('button', { hidden: true, name: 'Next' }).hasAttribute('disabled')).toBe(false);
  });

  test('when roles are invalid', async () => {
    const { getAllByRole, getByLabelText, getByRole } = render(
      <CreatePool
        api={chainInfo.api}
        chain={chain()}
        nextPoolId={nextPoolId}
        poolStakingConsts={poolStakingConst}
        setCreatePoolModalOpen={setCreatePoolModalOpen}
        setNewPool={setNewPool}
        setStakeAmount={setStakeAmount}
        setState={setState}
        showCreatePoolModal={true}
        staker={staker}
      />
    );

    const invalidAddress = '5sfkbjkdbfjkdfuhdsvfhdshgfvdshfvhdshvvhdsvhgdf';

    await waitFor(() => expect(getByRole('button', { hidden: true, name: 'min' })).toBeTruthy(), { timeout: 30000 });
    fireEvent.click(getByRole('button', { hidden: true, name: 'max' }));

    expect(getByLabelText('Nominator')).toBeTruthy();
    fireEvent.change(getAllByRole('combobox', { hidden: true })[2], { target: { value: '' } });
    expect(getAllByRole('combobox', { hidden: true })[2].getAttribute('value')).toEqual('');

    expect(getByLabelText('State toggler')).toBeTruthy();
    fireEvent.change(getAllByRole('combobox', { hidden: true })[3], { target: { value: invalidAddress } });
    expect(getAllByRole('combobox', { hidden: true })[3].getAttribute('value')).toEqual(invalidAddress);

    expect(getByRole('button', { hidden: true, name: 'Next' })).toBeTruthy();
    expect(getByRole('button', { hidden: true, name: 'Next' }).hasAttribute('disabled')).toBe(true);
  });
});
