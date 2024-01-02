// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import { AddressInput } from '.';

jest.setTimeout(20000);

const mockedSetState = jest.fn();
const myAddresses: [string, string | null, string | undefined][] = [
  ['17VdcY2F3WvhSLFHBGZreubzQNQ3NZzLbQsugGzHmzzprSG', '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e', 'PolkaGate'],
  ['152ko3nMR5WxUktu7pM2B3Y4CJu5vgrpMbzEzuQkQs9ewpsf', '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e', 'Kami'],
  ['1399wMi4YRuWysELB3bRK3YCqv5rVGKmzpuAvxCjMjDRkipJ', '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e', 'AmirEkbatanifard']
];
const invalidAddress = '35as1d6sa1d6sa1d615as';
const validAddress = 'Cgp9bcq1dGP1Z9B6F2ccTSTHNez9jq2iUX993ZbDVByPSU2';

describe('Testing AddressInput component', () => {
  test('Valid Vs invalid address', () => {
    const { getByRole, getByText, queryByText } = render(
      <AddressInput address='' label='Enter address:' setAddress={mockedSetState} />
    );

    const inputElement = getByRole('combobox');

    expect(getByText('Enter address:')).toBeTruthy();
    expect(inputElement).toBeTruthy();
    expect(inputElement.getAttribute('value')).toBe('');
    expect(queryByText('Invalid address')).toBeFalsy();

    fireEvent.change(inputElement, { target: { value: invalidAddress } });
    expect(inputElement.getAttribute('value')).toBe(invalidAddress);
    expect(queryByText('Invalid address')).toBeTruthy();
    expect(mockedSetState).toHaveBeenCalledWith(undefined);

    fireEvent.change(inputElement, { target: { value: validAddress } });
    expect(queryByText('Invalid address')).toBeFalsy();
    expect(mockedSetState).toHaveBeenCalledWith(validAddress);

    fireEvent.change(inputElement, { target: { value: '' } });
    expect(queryByText('Invalid address')).toBeFalsy();
    expect(mockedSetState).toHaveBeenCalledWith(null);
  });

  test('Clear/paste and qrScanner button', async () => {
    const { getAllByRole, getByRole } = render(
      <AddressInput addWithQr address='' label='Enter address:' setAddress={mockedSetState} />
    );

    const mockReadText = jest.fn().mockResolvedValue('test');

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: mockReadText
      }
    });
    const inputElement = getByRole('combobox');
    const pasteClearButton = getAllByRole('button')[0];
    const qrScannerButton = getByRole('button', { name: 'qrScanner' });

    expect(qrScannerButton).toBeTruthy();
    expect(pasteClearButton.getAttribute('aria-label')).toBe('paste'); // paste icon
    fireEvent.click(pasteClearButton);
    await waitFor(() => expect(mockReadText).toHaveBeenCalled(), { timeout: 3000 });
    await waitFor(() => expect(inputElement.getAttribute('value')).toBe('test'), { timeout: 3000 });

    expect(pasteClearButton.getAttribute('aria-label')).toBe('clear'); // clear icon
    fireEvent.click(pasteClearButton);
    await waitFor(() => expect(inputElement.getAttribute('value')).toBe(''), { timeout: 3000 });
    expect(pasteClearButton.getAttribute('aria-label')).toBe('paste');
  });

  test('Select an address', () => {
    const { getByRole } = render(
      <AddressInput address='' allAddresses={myAddresses} label='Enter address:' setAddress={mockedSetState} />
    );

    const inputElement = getByRole('combobox');

    fireEvent.mouseDown(inputElement);
    expect(getByRole('listbox')).toBeTruthy();
    expect(getByRole('listbox').childElementCount).toBe(myAddresses.length);

    const firstItemOfOptions = getByRole('listbox').children.item(0);

    fireEvent.click(firstItemOfOptions as Element);
    expect(inputElement.getAttribute('value')).toBe(myAddresses[0][0]);
  });

  test('Disabled', () => {
    const { getByRole, queryByRole } = render(
      <AddressInput address='' allAddresses={myAddresses} disabled label='Enter address:' setAddress={mockedSetState} />
    );

    const inputElement = getByRole('combobox');

    fireEvent.mouseDown(inputElement);
    expect(queryByRole('listbox')).toBeFalsy();
    expect(queryByRole('button', { name: 'paste' })).toBeFalsy();
    expect(queryByRole('button', { name: 'qrScanner' })).toBeFalsy();
  });
});
