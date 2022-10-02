// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, Matcher, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { Chain } from '../../../../../extension-chains/src/types';
import { FormatBalance } from '../../../components';
import getChainInfo from '../../../util/getChainInfo';
import { BalanceType, MyPoolInfo } from '../../../util/plusTypes';
import { amountToMachine } from '../../../util/plusUtils';
import { pool, poolsMembers, stakingConsts, state, validatorsIdentities, validatorsList } from '../../../util/test/testHelper';
import ConfirmStaking from './ConfirmStaking';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

let api: ApiPromise | undefined;
let decimals: number | undefined = 12;
const validAmountToStake = 10;
const availableBalanceInHuman = 15; // WND
const balanceInfo: BalanceType = {
  available: amountToMachine(availableBalanceInHuman.toString(), decimals),
  coin: 'WND',
  decimals,
  total: amountToMachine(availableBalanceInHuman.toString(), decimals)
};
const chain: Chain = {
  name: 'westend'
};
const staker = {
  address: '5DaBEgUMNUto9krwGDzXfSAWcMTxxv7Xtst4Yjpq9nJue7tm',
  balanceInfo,
  chain: 'westend',
  name: 'Amir khan'
};

let formatBalance: (value: BN) => string | null;
const setState = () => null;
const setConfirmStakingModalOpen = () => null;

let amount: BN = new BN(String(amountToMachine(validAmountToStake.toString(), decimals)));

describe('Testing confirmStaking page', () => {
  beforeAll(async () => {
    const chainInfo = await getChainInfo('westend');

    api = chainInfo?.api;
    decimals = chainInfo?.decimals;

    formatBalance = (value: BN) => {
      return render(
        <FormatBalance
          api={api}
          value={value}
        />
      ).asFragment().textContent;
    };
  });

  test('when state is joinPool', async () => {
    const joinPool: MyPoolInfo = pool(state[13]);

    const { queryAllByText, queryByLabelText, queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        basePool={joinPool}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={joinPool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[13]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    const currentlyStaked = joinPool?.member?.points ? new BN(joinPool.member?.points.toString()) : BN_ZERO;
    const confirmButton = queryAllByText('Confirm')[1];
    const index = joinPool.poolId.toString();
    const mayPoolBalance = joinPool?.ledger?.active ?? joinPool?.bondedPool?.points;
    const staked = api?.createType('Balance', mayPoolBalance).toHuman();

    expect(queryByText('JOIN POOL')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(formatBalance(amount));
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked.add(amount)));

    expect(queryByText('Pool')).toBeTruthy();
    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(index)).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(joinPool.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(joinPool.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(joinPool.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();

    expect(queryByLabelText('Password')).toBeTruthy();
    fireEvent.change(queryByLabelText('Password') as Element, { target: { value: 'invalidPassword' } });
    expect(queryByText('Please enter the account password')).toBeTruthy();
    fireEvent.click(confirmButton);
    await waitFor(() => queryByText('Password is not correct'), { timeout: 5000 });
  });

  test('when state is createPool', () => {
    const createPool: MyPoolInfo = pool(state[12]);

    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        basePool={createPool}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={createPool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[12]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    const currentlyStaked = createPool.member?.points ? new BN(createPool.member?.points.toString()) : BN_ZERO;
    const index = createPool.poolId.toString();
    const mayPoolBalance = createPool?.ledger?.active ?? createPool?.bondedPool?.points;
    const staked = api?.createType('Balance', mayPoolBalance).toHuman();

    expect(queryByText('CREATE POOL')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(formatBalance(amount));
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked.add(amount)));

    expect(queryByText('Pool')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(index)).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(createPool.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(createPool.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(createPool.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();
  });

  test('when state is bondExtra', () => {
    const bondPool: MyPoolInfo = pool(state[11]);

    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        basePool={bondPool}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={bondPool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[11]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    const currentlyStaked = bondPool.member?.points ? new BN(bondPool.member?.points.toString()) : BN_ZERO;
    const index = bondPool.poolId.toString();
    const mayPoolBalance = bondPool?.ledger?.active ?? bondPool?.bondedPool?.points;
    const staked = api?.createType('Balance', mayPoolBalance).toHuman();

    expect(queryByText('STAKING OF')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(formatBalance(amount));
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked.add(amount)));

    expect(queryByText('Pool')).toBeTruthy();
    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(index)).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(bondPool.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(bondPool.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(bondPool.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();
  });

  test('when state is bondExtraRewards', () => {
    const bondExtraRewardPool: MyPoolInfo = pool(state[10]);

    amount = bondExtraRewardPool.myClaimable; // bondExtraReward
    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        basePool={bondExtraRewardPool}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={bondExtraRewardPool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[10]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    const currentlyStaked = bondExtraRewardPool.member?.points ? new BN(bondExtraRewardPool.member?.points.toString()) : BN_ZERO;
    const index = bondExtraRewardPool.poolId.toString();
    const mayPoolBalance = bondExtraRewardPool?.ledger?.active ?? bondExtraRewardPool?.bondedPool?.points;
    const staked = api?.createType('Balance', mayPoolBalance).toHuman();

    expect(queryByText('STAKING OF')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(formatBalance(amount));
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked.add(amount)));

    expect(queryByText('Pool')).toBeTruthy();
    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(index)).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(bondExtraRewardPool.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(bondExtraRewardPool.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(bondExtraRewardPool.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();
  });

  test('when state is withdrawClaimable', () => {
    const withdrawClaimablePool: MyPoolInfo = pool(state[9]);

    amount = withdrawClaimablePool.myClaimable;

    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={withdrawClaimablePool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[9]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    const currentlyStaked = withdrawClaimablePool.member?.points ? new BN(withdrawClaimablePool.member?.points.toString()) : BN_ZERO;
    const index = withdrawClaimablePool.poolId.toString();
    const mayPoolBalance = withdrawClaimablePool?.ledger?.active ?? withdrawClaimablePool?.bondedPool?.points;
    const staked = api?.createType('Balance', mayPoolBalance).toHuman();

    expect(queryByText('CLAIM')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(formatBalance(amount));
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();

    expect(queryByText('Pool')).toBeTruthy();
    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(index)).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(withdrawClaimablePool?.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(withdrawClaimablePool.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(withdrawClaimablePool.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();
  });

  test('when state is withdrawUnbound', async () => {
    const withdrawUnboundPool: MyPoolInfo = pool(state[6]);
    let redeemValue = new BN('0');
    const currentlyStaked = withdrawUnboundPool.member?.points ? new BN(withdrawUnboundPool.member?.points.toString()) : BN_ZERO;
    const currentEraIndex = Number(await api?.query.staking.currentEra());

    for (const [era, unbondingPoint] of Object.entries(withdrawUnboundPool.member.unbondingEras)) {
      if (currentEraIndex > Number(era)) {
        redeemValue = redeemValue.add(unbondingPoint);
      }
    }

    const { debug, queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={redeemValue}
        api={api}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={withdrawUnboundPool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[6]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    expect(queryByText('REDEEM')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(formatBalance(redeemValue));
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();

    expect(queryByText('Available balance after redeem will be', { exact: false })).toBeTruthy();
  });

  test('when state is editPool', () => {
    const justAPool: MyPoolInfo = pool('');
    const editPool: MyPoolInfo = pool('', true, true); // metaData and roles going to change

    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={new BN('0')}
        api={api}
        basePool={editPool}
        chain={chain}
        nominatedValidators={validatorsList}
        pool={justAPool}
        poolsMembers={poolsMembers}
        selectedValidators={validatorsList}
        setConfirmStakingModalOpen={setConfirmStakingModalOpen}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[14]} // edit pool
        validatorsIdentities={validatorsIdentities}
      />
    );

    const currentlyStaked = justAPool.member?.points ? new BN(justAPool.member?.points.toString()) : BN_ZERO;
    const index = justAPool.poolId.toString();
    const mayPoolBalance = justAPool?.ledger?.active ?? justAPool?.bondedPool?.points;
    const staked = api?.createType('Balance', mayPoolBalance).toHuman();

    expect(queryByText('EDIT POOL')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual('');
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByTestId('currentlyStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByTestId('totalStaked')?.textContent).toEqual(formatBalance(currentlyStaked));
    expect(queryByText('Fee')).toBeTruthy();

    expect(queryByText('Pool')).toBeTruthy();
    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Index')).toBeTruthy();
    expect(queryByText(index)).toBeTruthy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText(justAPool.metadata as Matcher)).toBeTruthy();
    expect(queryByText('State')).toBeTruthy();
    expect(queryByText(justAPool.bondedPool?.state as unknown as Matcher)).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText(staked as Matcher)).toBeTruthy();
    expect(queryByText('Members')).toBeTruthy();
    expect(queryByText(justAPool.bondedPool?.memberCounter as unknown as Matcher)).toBeTruthy();
  });
});
