// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { render, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { useApiWithChain } from '../hooks';
import { buildHierarchy } from '../util/buildHierarchy';
import { getSubstrateAddress } from '../util/utils';
import { AccountContext, AmountFee } from '.';

jest.setTimeout(90000);

const kusamaAddress = 'Cgp9bcq1dGP1Z9B6F2ccTSTHNez9jq2iUX993ZbDVByPSU2';
const substrateAddress = getSubstrateAddress(kusamaAddress);
const kusamaGenesisHash = '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';

const availableProxiesInExtension = [
  { address: substrateAddress, genesisHash: kusamaGenesisHash, name: 'availableAccount', type: 'sr25519' }
] as AccountJson[];

describe('Testing AmountFee component', () => {
  test('Just amount', () => {
    const { getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: availableProxiesInExtension,
          hierarchy: buildHierarchy(availableProxiesInExtension)
        }}
      >
        <AmountFee
          address={substrateAddress as string}
          amount='5'
          label='Your amount'
          token='KSM'
        />
      </AccountContext.Provider>
    );

    expect(getByText('Your amount')).toBeTruthy();
    expect(getByText('5 KSM')).toBeTruthy();
  });

  test('Amount and Fee', async () => {
    const { result } = renderHook((prop) => useApiWithChain(prop.chain as Chain), { initialProps: { chain: { name: 'kusama' } } });

    await waitFor(() => expect(result.current).toBeTruthy(), {
      onTimeout: (err) => {
        console.error('Api connection failed!');

        return err;
      },
      timeout: 60000
    });

    const feeAmount = result.current?.createType('Balance', new BN('10000000000'));

    await waitFor(() => expect(feeAmount).toBeTruthy(), { timeout: 20000 });

    const { getByText } = render(
      <AccountContext.Provider
        value={{
          accounts: availableProxiesInExtension,
          hierarchy: buildHierarchy(availableProxiesInExtension)
        }}
      >
        <AmountFee
          address={substrateAddress as string}
          amount='5'
          fee={feeAmount}
          label='Your amount'
          token='KSM'
          withFee
        />
      </AccountContext.Provider>
    );

    expect(getByText('Your amount')).toBeTruthy();
    expect(getByText('5 KSM')).toBeTruthy();
    expect(getByText('Fee:')).toBeTruthy();
    expect(getByText(feeAmount?.toHuman() as string)).toBeTruthy();
  });
});
