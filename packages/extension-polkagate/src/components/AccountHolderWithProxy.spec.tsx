// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { Matcher, render, waitFor } from '@testing-library/react';
import React from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';

import { getMetadata } from '../messaging';
import { buildHierarchy } from '../util/buildHierarchy';
import { getSubstrateAddress } from '../util/utils';
import { AccountContext, AccountHolderWithProxy } from '.';

jest.setTimeout(120000);

const polkadotGenesisHash = '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';
const polkadotAddress = '1sVPbov6kVdWuVW9H7wWV5b2LX4V4nRQ7s6y2Tic6NCwtYm';
const fakeProxyAddress = '12TQ2YbR5UtTGz6HvECDwLF8y5gHDib4stpEbEkvjeyWuitU';
const substrateAddress = getSubstrateAddress(polkadotAddress);
let chain: Chain | null;

const accountInExtension = [
  { address: substrateAddress, genesisHash: polkadotGenesisHash, name: 'accHolder', type: 'sr25519' }
] as AccountJson[];

describe('Testing AccountHolderWithProxy component', () => {
  beforeAll(async () => {
    chain = await getMetadata(polkadotGenesisHash, true);
  });

  test('Without proxy', async () => {
    const { getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: accountInExtension,
          hierarchy: buildHierarchy(accountInExtension)
        }}
      >
        <AccountHolderWithProxy
          address={substrateAddress as string}
          chain={chain}
        />
      </AccountContext.Provider>
    );

    expect(getByText('Account holder')).toBeTruthy();
    await waitFor(() => expect(getByText(accountInExtension[0].name as Matcher)).toBeTruthy(), { timeout: 30000 });
    await waitFor(() => expect(getByText(`${polkadotAddress?.substring(0, 4)}...${polkadotAddress?.slice(-4)}`)).toBeTruthy(), { timeout: 30000 });
  });

  test('With proxy', async () => {
    const { getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: accountInExtension,
          hierarchy: buildHierarchy(accountInExtension)
        }}
      >
        <AccountHolderWithProxy
          address={substrateAddress as string}
          chain={chain}
          selectedProxyAddress={fakeProxyAddress}
        />
      </AccountContext.Provider>
    );

    expect(getByText('Account holder')).toBeTruthy();
    await waitFor(() => expect(getByText(accountInExtension[0].name as Matcher)).toBeTruthy(), { timeout: 30000 });
    await waitFor(() => expect(getByText(`${polkadotAddress?.substring(0, 4)}...${polkadotAddress?.slice(-4)}`)).toBeTruthy(), { timeout: 30000 });
    expect(getByText('Through')).toBeTruthy();
    expect(getByText(`${fakeProxyAddress?.substring(0, 4)}...${fakeProxyAddress?.slice(-4)}`)).toBeTruthy();
    expect(getByText('as proxy')).toBeTruthy();
  });
});
