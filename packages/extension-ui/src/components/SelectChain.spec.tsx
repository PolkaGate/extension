// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { kusamaGenesisHash, polkadotAddress, polkadotGenesisHash, westendGenesisHash } from '../util/test/testHelper';
import { DropdownOption } from '../util/types';
import { getSubstrateAddress } from '../util/utils';
import { SelectChain } from '.';

jest.setTimeout(20000);

const substrateAddress = getSubstrateAddress(polkadotAddress);

const onNetworkChangeMock = jest.fn();
const options: DropdownOption[] = [
  { text: 'Polkadot', value: polkadotGenesisHash },
  { text: 'Kusama', value: kusamaGenesisHash },
  { text: 'Westend', value: westendGenesisHash }
];

describe('Testing SelectChain component', () => {
  test('Select options', () => {
    const { getAllByRole, getAllByText, getByRole, getByText } = render(
      <SelectChain
        address={substrateAddress}
        defaultValue={options[0].value}
        label='Select Network'
        onChange={onNetworkChangeMock}
        options={options}
        style={{}}
      />
    );

    const select = getByRole('button');

    expect(getByText('Select Network')).toBeTruthy();
    expect(select).toBeTruthy();
    fireEvent.click(select);

    const displayedOptions = getAllByRole('option');

    expect(displayedOptions).toHaveLength(options.length);
    options.forEach((option, index) => {
      expect(getAllByText(option.text)).toBeTruthy();
      expect(displayedOptions[index].getAttribute('data-value')).toBe(option.value);
    });

    fireEvent.click(displayedOptions[1]); // select a random option
    expect(onNetworkChangeMock).toHaveBeenCalled();
    expect(onNetworkChangeMock).toHaveBeenCalledTimes(1);

    fireEvent.click(getByRole('button'));

    fireEvent.click(getAllByRole('option')[2]); // select another random option
    expect(onNetworkChangeMock).toHaveBeenCalled();
    expect(onNetworkChangeMock).toHaveBeenCalledTimes(2);
    expect(getByText(options[2].text)).toBeTruthy();
  });
});
