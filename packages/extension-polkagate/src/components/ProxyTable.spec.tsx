// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { render } from '@testing-library/react';
import React from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';

import { getMetadata } from '../messaging';
import { buildHierarchy } from '../util/buildHierarchy';
import { ProxyItem } from '../util/types';
import { AccountContext, ProxyTable } from '.';

jest.setTimeout(20000);

const existingProxies: ProxyItem[] = [
  {
    proxy: {
      delay: 5,
      delegate: '5CfYeju83Pc2K6Eoj7XUsvbNEcSQCWFn6WkAuJnGqReBGeea',
      proxyType: 'Any'
    },
    status: 'current'
  },
  {
    proxy: {
      delay: 8,
      delegate: '5F4AbLCQn7KKhD6PZEkHQ9W6hAvS6Y6Y8JjV4PpJZkVPT6S4',
      proxyType: 'Auction'
    },
    status: 'current'
  }
];
const otherProxies: ProxyItem[] = [
  {
    proxy: {
      delay: 10,
      delegate: '5Gpb8Jcfch81hiJ9FCht2y5Naxo1VxHdXX3HPm3XF2rFcrTD',
      proxyType: 'Staking'
    },
    status: 'remove'
  },
  {
    proxy: {
      delay: 15,
      delegate: '5CqJerMyAZJnCStDSHvPueimhpfq753bKnBhUvhGYZ1tN7Ur',
      proxyType: 'CancelProxy'
    },
    status: 'new'
  }
];
const polkadotGenesisHash = '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';
// const proxiedAddress = '5CcKTicopEfmizTABdUWtJGCL9ocTaVSf95FHcKrT1xZFsAq';
const availableProxiesInExtension = [
  { address: existingProxies[0].proxy.delegate, genesisHash: polkadotGenesisHash, name: 'anyProxyAddress', type: 'sr25519' },
  { address: existingProxies[1].proxy.delegate, genesisHash: polkadotGenesisHash, name: 'auctionProxyAddress', type: 'sr25519' }
] as AccountJson[];

const onSelectMock = jest.fn();

let chain: Chain | null | undefined;

describe('Testing ProxyTable component', () => {
  beforeAll(async () => {
    chain = await getMetadata(polkadotGenesisHash, true);
  });

  test('No chain selected', () => {
    const { getByText, queryByRole, queryByText } = render(
      <ProxyTable
        chain={undefined}
        label='Proxy table'
        mode='None'
        proxies={undefined}
      />
    );

    expect(getByText('Proxy table')).toBeTruthy();
    expect(queryByRole('progressbar')).toBeFalsy();
    expect(queryByText('looking for proxies...')).toBeFalsy();
  });

  test('Wait for proxies', () => {
    const { getByRole, getByText } = render(
      <ProxyTable
        chain={chain}
        label='Proxy table'
        mode='None'
        proxies={undefined}
      />
    );

    expect(getByText('Proxy table')).toBeTruthy();
    expect(getByRole('progressbar')).toBeTruthy();
    expect(getByText('looking for proxies...')).toBeTruthy();
  });

  test('No proxy found', () => {
    const { getByText, queryByRole, queryByText } = render(
      <ProxyTable
        chain={chain}
        label='Proxy table'
        mode='None'
        proxies={[]}
      />
    );

    expect(queryByRole('progressbar')).toBeFalsy();
    expect(queryByText('looking for proxies...')).toBeFalsy();
    expect(getByText('Identity')).toBeTruthy();
    expect(getByText('Type')).toBeTruthy();
    expect(getByText('Delay')).toBeTruthy();
    expect(getByText('No proxies found for the account’s address on {{chainName}}.')).toBeTruthy();
  });

  test('Show proxies', () => {
    const { getByText, queryByText } = render(
      <ProxyTable
        chain={chain}
        label='Proxy table'
        mode='None'
        onSelect={onSelectMock}
        proxies={existingProxies}
      />
    );

    expect(queryByText('No proxies found for the account’s address on {{chainName}}.')).toBeFalsy();
    expect(getByText('Identity')).toBeTruthy();
    expect(getByText('Type')).toBeTruthy();
    expect(getByText('Delay')).toBeTruthy();
    existingProxies.forEach((item) => {
      expect(getByText(`${item.proxy.delegate.slice(0, 4)}...${item.proxy.delegate.slice(-4)}`)).toBeTruthy();
      expect(getByText(item.proxy.proxyType)).toBeTruthy();
      expect(getByText(item.proxy.delay)).toBeTruthy();
    });
  });

  test('Proxies availability', () => {
    const { getAllByText, getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: availableProxiesInExtension,
          hierarchy: buildHierarchy(availableProxiesInExtension)
        }}
      >
        <ProxyTable
          chain={chain}
          label='Proxy table'
          mode='Availability'
          onSelect={onSelectMock}
          proxies={[...existingProxies, ...otherProxies]}
        />
      </AccountContext.Provider>
    );

    expect(getByText('Available')).toBeTruthy();
    expect(getAllByText('Yes')).toHaveLength(availableProxiesInExtension.length);
    expect(getAllByText('No')).toHaveLength(2);
  });

  test('Proxies status', () => {
    const { getByText } = render(
      <ProxyTable
        chain={chain}
        label='Proxy table'
        mode='Status'
        proxies={otherProxies}
      />
    );

    expect(getByText('Status')).toBeTruthy();
    otherProxies.forEach((proxy) => {
      expect(getByText(proxy.status === 'new' ? 'Adding' : 'Removing')).toBeTruthy();
    });
  });

  test('Select proxy', () => {
    const { getAllByRole, getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: availableProxiesInExtension,
          hierarchy: buildHierarchy(availableProxiesInExtension)
        }}
      >
        <ProxyTable
          chain={chain}
          label='Proxy table'
          mode='Select'
          proxies={[...existingProxies, ...otherProxies]}
        />
      </AccountContext.Provider>
    );

    const radioButtons = getAllByRole('radio');

    expect(getByText('Select')).toBeTruthy();
    expect(radioButtons).toHaveLength([...existingProxies, ...otherProxies].length);
    radioButtons.forEach((radio) => {
      const relatedRadio = radio.getAttribute('value');
      const isDisabled = radio.hasAttribute('disabled');

      expect(isDisabled).toBe(relatedRadio <= 1 ? false : true);
    });
  });

  test('Delete proxy', () => {
    const { getAllByRole, getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: availableProxiesInExtension,
          hierarchy: buildHierarchy(availableProxiesInExtension)
        }}
      >
        <ProxyTable
          chain={chain}
          label='Proxy table'
          mode='Delete'
          proxies={existingProxies}
        />
      </AccountContext.Provider>
    );

    const checkBoxes = getAllByRole('checkbox');

    expect(getByText('Delete')).toBeTruthy();
    expect(checkBoxes).toHaveLength(existingProxies.length);
  });
});
