// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import type { StakingLedger } from '@polkadot/types/interfaces';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import getChainInfo from '../../../util/getChainInfo';
import { AccountsBalanceType, ChainInfo } from '../../../util/plusTypes';
import { amountToHuman, amountToMachine } from '../../../util/plusUtils';
import { nominatedValidators, stakingConsts } from '../../../util/test/testHelper';
import Stake from './Stake';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

const availableBalance = '5.4321';
let chainInfo: ChainInfo;
const nextToStakeButtonBusy = false;
const state = '';
let staker: AccountsBalanceType;

const setStakeAmount = () => { };

const ledger: StakingLedger = {
  active: 0n
};
const invalidHugeAmountForStaking = '123456789';
const invalidTinyAmountForStaking = '0.12345';
const validAmount = 1;

describe('Testing EasyStaking component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
    staker = { balanceInfo: { available: amountToMachine(availableBalance, chainInfo.decimals), decimals: chainInfo.decimals } };
  });

  test('Checking the exist component', async () => {
    const { debug, queryAllByRole, queryByLabelText, queryByRole, queryByText } = render(
      <Stake
        api={chainInfo.api}
        ledger={ledger}
        nextToStakeButtonBusy={nextToStakeButtonBusy}
        nominatedValidators={nominatedValidators}
        setStakeAmount={setStakeAmount}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state}
      />);

    expect(queryByLabelText('Amount')).toBeTruthy();
    await waitFor(() => queryByText('Min:'), { timeout: 10000 });
    expect(queryByText('Min:')).toBeTruthy();
    expect(queryByText('Max: ~')).toBeTruthy();
    expect(queryByText('Validator selection:')).toBeTruthy();
    expect(queryByText('Auto')).toBeTruthy();
    expect(queryByText('Manual')).toBeTruthy();
    expect(queryByText('Keep nominated')).toBeTruthy();
    expect(queryByText('Next')).toBeTruthy();
    const minButton = queryAllByRole('button')[0];
    const maxButton = queryAllByRole('button')[1];
    const nextStepButton = queryAllByRole('button')[2];
    const amountInput = queryByRole('spinbutton');

    expect(nextStepButton.hasAttribute('disabled')).toBe(true);

    fireEvent.click(minButton);
    expect(nextStepButton.hasAttribute('disabled')).toBe(false);
    expect(Number(amountInput.value)).toEqual(Number(amountToHuman(stakingConsts.minNominatorBond, chainInfo?.decimals)));

    fireEvent.click(maxButton);
    expect(nextStepButton.hasAttribute('disabled')).toBe(false);
    expect(Number(amountInput.value)).toBeLessThanOrEqual(Number(availableBalance));

    fireEvent.change(amountInput, { target: { value: validAmount } });
    expect(nextStepButton.hasAttribute('disabled')).toBe(false);
  });

  test('Checking the exist component', () => {
    const { queryAllByRole, queryByRole, queryByText } = render(
      <Stake
        api={chainInfo.api}
        ledger={ledger}
        nextToStakeButtonBusy={nextToStakeButtonBusy}
        nominatedValidators={nominatedValidators}
        setStakeAmount={setStakeAmount}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state}
      />
    );
    const nextStepButton = queryAllByRole('button')[2];
    const amountInput = queryByRole('spinbutton');

    expect(amountInput).toBeTruthy();
    fireEvent.change(amountInput, { target: { value: invalidHugeAmountForStaking } });
    expect(queryByText('Insufficient Balance')).toBeTruthy();
    expect(nextStepButton.hasAttribute('disabled')).toBe(true);

    fireEvent.change(amountInput, { target: { value: invalidTinyAmountForStaking } });
    expect(queryByText('Staking amount is too low, it must be at least 1 WND')).toBeTruthy();
    expect(nextStepButton.hasAttribute('disabled')).toBe(true);
  });
});
