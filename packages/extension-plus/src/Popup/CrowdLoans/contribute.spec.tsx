// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import { Matcher, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { AccountContext, SettingsContext } from '@polkadot/extension-ui/components';
import { Balance } from '@polkadot/types/interfaces';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { buildHierarchy } from '../../../../extension-polkagate/src/util/buildHierarchy';
import getChainInfo from '../../util/getChainInfo';
import { ChainInfo } from '../../util/plusTypes';
import { accounts, actives, auction, endpoints, getText, makeShortAddr, SettingsStruct } from '../../util/test/testHelper';
import Contribute from './Contribute';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

let chainInfo: ChainInfo;
const contributeTo = actives[0];
const shortAddress = makeShortAddr(encodeAddress(decodeAddress(accounts[2].address), 0));
let availableBalance: Balance;
let minContribution: Balance;

describe('Testing Contribute component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo('polkadot') as ChainInfo;
    await chainInfo?.api.derive.balances?.all(encodeAddress(decodeAddress(accounts[2].address), 0)).then((b) => {
      availableBalance = (b?.availableBalance);
    });

    if (!chainInfo) return;

    minContribution = chainInfo?.api.createType('Balance', auction.minContribution);
  });
  test('Checking the existence of elements', async () => {
    const { queryAllByText, queryByTestId, queryByText } = render(
      <SettingsContext.Provider value={SettingsStruct}>
        <AccountContext.Provider
          value={{
            accounts: accounts,
            hierarchy: buildHierarchy(accounts)
          }}
        >
          <Contribute
            address={accounts[2].address}
            auction={auction}
            chainInfo={chainInfo}
            contributeModal={true}
            crowdloan={contributeTo}
            endpoints={endpoints}
            myContributions={undefined}
          />
        </AccountContext.Provider>
      </SettingsContext.Provider>
    );

    expect(queryByText('Contribute')).toBeTruthy();
    await waitFor(() => expect(queryByText(display?.slice(0, 15) as Matcher)).toBeTruthy(), { timeout: 20000 });
    expect(queryByText(`Parachain Id: ${contributeTo.fund.paraId}`)).toBeTruthy();
    expect(queryByText('Contributor:')).toBeTruthy();
    expect(queryByText(accounts[2].name as Matcher)).toBeTruthy();
    expect(queryByText(shortAddress)).toBeTruthy();
    expect(queryByText(`Available: ${availableBalance}`)).toBeTruthy();
    expect(queryAllByText('Contribution amount')).toBeTruthy();
    expect(queryByText(`Minimum contribution: ${minContribution.toHuman()}`)).toBeTruthy();
    expect(queryAllByText('Password')).toBeTruthy();
    expect(queryByText('Please enter the account password')).toBeTruthy();
    expect(queryByTestId('confirmButton')).toBeTruthy();
  });
});

const display = contributeTo.identity.info.legal || contributeTo.identity.info.display || getText(contributeTo.fund.paraId);
