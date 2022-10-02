// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import type { StakingLedger } from '@polkadot/types/interfaces';

import { fireEvent, Matcher, render, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApiPromise } from '@polkadot/api';

import { Chain } from '../../../../../extension-chains/src/types';
import getChainInfo from '../../../util/getChainInfo';
import { BalanceType } from '../../../util/plusTypes';
import { amountToHuman, amountToMachine } from '../../../util/plusUtils';
import { makeShortAddr, putInFront, rebagFalse, rebagTrue, stakingConsts, validatorsIdentities, validatorsList } from '../../../util/test/testHelper';
import ConfirmStaking from './ConfirmStaking';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

let api: ApiPromise;
let decimals = 12;
let coin: string;
const validAmountToStake = 10;
const amountToUnstake = 7;
const redeemAmount = 5;
const availableBalanceInHuman = 15; // WND
const balanceInfo: BalanceType = {
  available: amountToMachine(availableBalanceInHuman.toString(), decimals),
  coin: 'WND',
  decimals: decimals,
  total: amountToMachine(availableBalanceInHuman.toString(), decimals)
};
const chain: Chain = {
  name: 'westend'
};
const ledger: StakingLedger = {
  active: 4000000000000n
};
const staker = {
  address: '5DaBEgUMNUto9krwGDzXfSAWcMTxxv7Xtst4Yjpq9nJue7tm',
  balanceInfo: balanceInfo,
  chain: 'westend',
  name: 'Amir khan'
};
const state = ['stakeAuto', 'stakeManual', 'stakeKeepNominated', 'changeValidators', 'setNominees', 'unstake', 'withdrawUnbound', 'stopNominating', 'tuneUp'];
const setState = () => null;

describe('Testing ConfirmStaking component', () => {
  beforeAll(async () => {
    const chainInfo = await getChainInfo('westend');

    api = chainInfo?.api;
    decimals = chainInfo?.decimals;
    coin = chainInfo?.coin;
  });

  test('when state is stakeAuto, stakeManual, stakeKeepNominated', async () => {
    const amount = amountToMachine(validAmountToStake.toString(), decimals);

    const { queryAllByText, queryByLabelText, queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={validatorsList}
        putInFrontInfo={undefined}
        rebagInfo={undefined}
        selectedValidators={validatorsList}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[0]}
        validatorsIdentities={validatorsIdentities}
      />
    );
    const currentlyStaked = amountToHuman(ledger.active.toString(), decimals);
    const amountToStakeInHuman = amountToHuman(amount.toString(), decimals);
    const confirmButton = queryAllByText('Confirm')[1];

    expect(queryByText('STAKING OF')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(`${amountToStakeInHuman} ${coin}`);
    expect(queryByText('Currently staked')).toBeTruthy();
    expect(queryByText(`${currentlyStaked} ${coin}`)).toBeTruthy();
    expect(queryByText('Fee')).toBeTruthy();
    expect(queryByText('Total staked')).toBeTruthy();
    expect(queryByText(`${Number(currentlyStaked) + Number(amountToStakeInHuman)} ${coin}`)).toBeTruthy();

    expect(queryByText(`VALIDATORS (${validatorsList.length})`)).toBeTruthy();
    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Identity')).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText('Comm.')).toBeTruthy();
    expect(queryByText('Nominators')).toBeTruthy();

    for (const validator of validatorsList) {
      const total = api.createType('Balance', validator.exposure.total);

      expect(queryByText(validatorsIdentities[validatorsList.indexOf(validator)].identity.display as Matcher)).toBeTruthy();
      expect(queryAllByText(total.toHuman())).toBeTruthy();
      expect(queryAllByText(`${validator.validatorPrefs.commission / (10 ** 7)}%`)).toBeTruthy();
      expect(queryAllByText(validator.exposure.others.length)).toBeTruthy();
    }

    expect(queryByLabelText('Password')).toBeTruthy();
    fireEvent.change(queryByLabelText('Password') as Element, { target: { value: 'invalidPassword' } });
    expect(queryByText('Please enter the account password')).toBeTruthy();
    fireEvent.click(confirmButton);
    await waitFor(() => queryByText('Password is not correct'), { timeout: 5000 });
  });

  test('when auto adjust is needed (amount ~= available)', async () => {
    const { queryAllByText, queryByLabelText, queryByText } = render(
      <ConfirmStaking
        amount={staker.balanceInfo.available}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={validatorsList}
        putInFrontInfo={undefined}
        rebagInfo={undefined}
        selectedValidators={validatorsList}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[0]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    await waitForElementToBeRemoved(() => queryAllByText('Confirm')[1], { timeout: 30000 });
    expect(queryByText('Account reap issue, consider fee!')).toBeTruthy();

    expect(queryByLabelText('Adjust')).toBeTruthy();
    fireEvent.click(queryByLabelText('Adjust') as Element);
    expect(queryAllByText('Confirm')).toHaveLength(2);
  });

  test('when state is stopNominating', () => {
    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={null}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={validatorsList}
        putInFrontInfo={undefined}
        rebagInfo={undefined}
        selectedValidators={[]}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[7]}
        validatorsIdentities={[]}
      />
    );

    expect(queryByText('STOP NOMINATING')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toBeFalsy();
    expect(queryByText('Declaring no desire to nominate validators')).toBeTruthy();
  });

  test('when state is changeValidator, setNominees', () => {
    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={null}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={validatorsList}
        putInFrontInfo={undefined}
        rebagInfo={undefined}
        selectedValidators={validatorsList}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[3]}
        validatorsIdentities={validatorsIdentities}
      />
    );

    expect(queryByText('NOMINATING')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toBeFalsy();
  });

  test('when state is unstake', () => {
    const amount = amountToMachine(amountToUnstake.toString(), decimals);

    const { queryByTestId, queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={[]}
        putInFrontInfo={undefined}
        rebagInfo={undefined}
        selectedValidators={[]}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[5]}
        validatorsIdentities={[]}
      />
    );
    const amountToUnstakeInHuman = amountToHuman(amount.toString(), decimals);

    expect(queryByText('UNSTAKING')).toBeTruthy();
    expect(queryByTestId('amount')?.textContent).toEqual(`${amountToUnstakeInHuman} ${coin}`);
    expect(queryByText('Note: The unstaked amount will be redeemable after {{days}} days')).toBeTruthy();
  });

  test('when state is withdrawUnbound', () => {
    const amount = amountToMachine(redeemAmount.toString(), decimals);

    const { queryByText } = render(
      <ConfirmStaking
        amount={amount}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={[]}
        putInFrontInfo={undefined}
        rebagInfo={undefined}
        selectedValidators={[]}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[6]}
        validatorsIdentities={[]}
      />
    );

    expect(queryByText('REDEEM')).toBeTruthy();
    expect(queryByText('Available balance after redeem will be', { exact: false })).toBeTruthy();
  });

  test('when state is tuneUp needs rebag', () => {
    const { queryByText } = render(
      <ConfirmStaking
        amount={0n}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={[]}
        putInFrontInfo={undefined}
        rebagInfo={rebagTrue}
        selectedValidators={[]}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[8]}
        validatorsIdentities={[]}
      />
    );

    expect(queryByText('TUNEUP')).toBeTruthy();
    expect(queryByText('Declaring that your account has sufficiently changed its score that should fall into a different bag.')).toBeTruthy();
    expect(queryByText('Current bag threshold')).toBeTruthy();
    expect(queryByText(rebagTrue?.currentBagThreshold ?? '')).toBeTruthy();
    expect(queryByText('You will probably need another tune up after this one!')).toBeTruthy();
  });

  test('when state is tuneUp needs putInFront', () => {
    const { queryByText } = render(
      <ConfirmStaking
        amount={0n}
        api={api}
        chain={chain}
        ledger={ledger}
        nominatedValidators={[]}
        putInFrontInfo={putInFront}
        rebagInfo={rebagFalse}
        selectedValidators={[]}
        setState={setState}
        showConfirmStakingModal={true}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state[8]}
        validatorsIdentities={[]}
      />
    );

    expect(queryByText('TUNEUP')).toBeTruthy();
    expect(queryByText('Changing your accout\'s position to a better one')).toBeTruthy();
    expect(queryByText('Current bag threshold')).toBeTruthy();
    expect(queryByText(rebagFalse.currentBagThreshold as Matcher)).toBeTruthy();
    expect(queryByText('Account to overtake')).toBeTruthy();
    expect(queryByText(makeShortAddr(putInFront.lighter) as Matcher)).toBeTruthy();
  });
});
