// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import '@polkadot/extension-mocks/chrome';

import type { StakingLedger } from '@polkadot/types/interfaces';

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import getChainInfo from '../../../util/getChainInfo';
import { ChainInfo } from '../../../util/plusTypes';
import { stakingConsts } from '../../../util/test/testHelper';
import Unstake from './Unstake';

ReactDOM.createPortal = jest.fn((modal) => modal);
jest.setTimeout(60000);

const ledger: StakingLedger = {
  active: 5000000000000n
};
let chainInfo: ChainInfo;
const setUnstakeAmount = () => null;

const notStaked = '0';
const staked = '5';
const notYetFetched = null;
const validAmount = 3;
const invalidAmount = 12345;

describe('Testing Unstake component', () => {
  beforeAll(async () => chainInfo = await getChainInfo('westend'));

  test('Checking the existence of elements while fetching from chain', () => {
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
       api={chainInfo.api}
        currentlyStakedInHuman={notYetFetched}
        ledger={ledger}
        nextToUnStakeButtonBusy={false}
        setUnstakeAmount={setUnstakeAmount}
        stakingConsts={stakingConsts}
      />
    );
    const nextStepButton = queryAllByRole('button')[1];

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Fetching data from blockchain ...')).toBeTruthy();
    expect(queryByText('Next')).toBeTruthy();
    expect(nextStepButton.hasAttribute('disabled')).toBe(true);
  });

  test('Checking the existence of elements after fetch', () => {
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
       api={chainInfo.api}
        currentlyStakedInHuman={notStaked}
        ledger={ledger}
        nextToUnStakeButtonBusy={false}
        setUnstakeAmount={setUnstakeAmount}
        stakingConsts={stakingConsts}
      />
    );
    const nextStepButton = queryAllByRole('button')[1];

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Nothing to unstake')).toBeTruthy();
    expect(queryByText('Next')).toBeTruthy();
    expect(nextStepButton.hasAttribute('disabled')).toBe(true);
  });

  test('Checking the unstak while there is some active fund', () => {
    const { queryAllByRole, queryByLabelText, queryByText } = render(
      <Unstake
       api={chainInfo.api}
        currentlyStakedInHuman={staked}
        ledger={ledger}
        nextToUnStakeButtonBusy={false}
        setUnstakeAmount={setUnstakeAmount}
        stakingConsts={stakingConsts}
      />
    );
    const nextStepButton = queryAllByRole('button')[1];
    const maxButton = queryAllByRole('button')[0];

    expect(queryByLabelText('Amount')).toBeTruthy();
    expect(queryByText('Max:')).toBeTruthy();
    expect(queryByText('Next')).toBeTruthy();

    fireEvent.change(queryByLabelText('Amount'), { target: { value: validAmount } });
    expect(nextStepButton.hasAttribute('disabled')).toBe(false);

    fireEvent.change(queryByLabelText('Amount'), { target: { value: invalidAmount } });
    expect(queryByText('It is more than already staked!')).toBeTruthy();
    expect(nextStepButton.hasAttribute('disabled')).toBe(true);

    fireEvent.click(maxButton);
    expect(nextStepButton.hasAttribute('disabled')).toBe(false);
  });
});
