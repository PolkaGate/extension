// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import type { StakingLedger } from '@polkadot/types/interfaces';

import { render } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { DeriveStakingQuery } from '@polkadot/api-derive/types';

import { Chain } from '../../../../../extension-chains/src/types';
import getChainInfo from '../../../util/getChainInfo';
import { AccountsBalanceType, BalanceType, ChainInfo, Validators } from '../../../util/plusTypes';
import { amountToMachine } from '../../../util/plusUtils';
import { nominatedValidators, stakingConsts, validatorsIdentities, validatorsName } from '../../../util/test/testHelper';
import Nominations from './Nominations';

const activeValidator: DeriveStakingQuery = {};
const chain: Chain = { name: 'westend' };
const StakedInHuman = '1';
const noStakedInHuman = '0';
const state = '';
const validatorsInfo: Validators = {
  current: [...validatorsName.slice(4)],
  waiting: [...validatorsName]
};
let chainInfo: ChainInfo;
let staker: AccountsBalanceType;
let balanceInfo: BalanceType;
const availableBalanceInHuman = 15; // WND

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

describe('Testing Nominations component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');

    balanceInfo = {
      available: amountToMachine(availableBalanceInHuman.toString(), chainInfo.decimals),
      coin: 'WND',
      decimals: chainInfo.decimals,
      total: amountToMachine(availableBalanceInHuman.toString(), chainInfo.decimals)
    };

    staker = {
      address: '5DaBEgUMNUto9krwGDzXfSAWcMTxxv7Xtst4Yjpq9nJue7tm',
      balanceInfo: balanceInfo,
      chain: 'westend',
      name: 'Amir khan'
    };
  });

  test('Checking existing elements when not staked and nominated yet', () => {
    const ledger: StakingLedger = {
      active: 0n
    };
    const { queryByText } = render(
      <Nominations
        activeValidator={activeValidator}
        chain={chain}
        api={chainInfo.api}
        ledger={ledger}
        noNominatedValidators={true}
        nominatedValidators={null}
        // nominatorInfo={nominatorInfo}
        // putInFrontInfo={putInFrontInfo}
        // rebagInfo={rebagInfo}
        // staker={staker}
        stakingConsts={stakingConsts}
        state={state}
        validatorsIdentities={[]}
        validatorsInfo={validatorsInfo}
      />);

    expect(queryByText('No nominated validators found')).toBeTruthy();
    expect(queryByText('Set nominees')).toBeFalsy();
  });

  test('Checking existing elements when staked but not nominated', () => {
    const ledger: StakingLedger = {
      active: 4000000000000n
    };

    const { queryByText } = render(
      <Nominations
        activeValidator={activeValidator}
        chain={chain}
        api={chainInfo.api}
        ledger={ledger}
        noNominatedValidators={true}
        nominatedValidators={null}
        // nominatorInfo={nominatorInfo}
        // putInFrontInfo={putInFrontInfo}
        // rebagInfo={rebagInfo}
        // staker={staker}
        stakingConsts={stakingConsts}
        state={state}
        validatorsIdentities={[]}
        validatorsInfo={validatorsInfo}
      />);

    expect(queryByText('No nominated validators found')).toBeTruthy();
    expect(queryByText('Set nominees')).toBeTruthy();
  });

  test('Checking existing elements when staked and nominated', () => {
    const ledger: StakingLedger = {
      active: 4000000000000n
    };

    const { queryAllByText, queryByText } = render(
      <Nominations
        activeValidator={activeValidator}
        api={chainInfo.api}
        chain={chain}
        ledger={ledger}
        noNominatedValidators={false}
        nominatedValidators={nominatedValidators}
        staker={staker}
        stakingConsts={stakingConsts}
        state={state}
        validatorsIdentities={validatorsIdentities}
        // nominatorInfo={nominatorInfo}
        // putInFrontInfo={putInFrontInfo}
        // rebagInfo={rebagInfo}
        validatorsInfo={validatorsInfo}
      />);

    expect(queryByText('More')).toBeTruthy();
    expect(queryByText('Identity')).toBeTruthy();
    expect(queryByText('Staked')).toBeTruthy();
    expect(queryByText('Comm.')).toBeTruthy();
    expect(queryByText('Nominators')).toBeTruthy();

    for (const nominatedValidator of nominatedValidators) {
      validatorsIdentities.forEach((acc) => {
        if (acc.accountId === nominatedValidator.accountId) {
          expect(queryByText(acc.identity.display)).toBeTruthy();
        }
      });
      const total = chainInfo.api.createType('Balance', nominatedValidator.exposure.total);

      expect(queryAllByText(total.toHuman())).toBeTruthy();
      expect(queryAllByText(nominatedValidator.exposure.others.length)).toBeTruthy();
      expect(queryAllByText(`${nominatedValidator.validatorPrefs.commission / (10 ** 7)}%`)).toBeTruthy();
    }

    expect(queryByText('Stop nominating')).toBeTruthy();
    expect(queryByText('Tune up')).toBeTruthy();
    expect(queryByText('Tune up')?.hasAttribute('disabled')).toBe(true);
    expect(queryByText('Change validators')).toBeTruthy();

    expect(queryByText('No nominated validators found')).toBeFalsy();
    expect(queryByText('Set nominees')).toBeFalsy();
  });

  test('Checking existing elements of Tune Up section!', () => {
    // TODO
  });
});
