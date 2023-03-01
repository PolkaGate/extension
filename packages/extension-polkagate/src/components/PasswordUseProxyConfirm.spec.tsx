// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { useApiWithChain } from '../hooks';
import { validProxy, westendGenesisHash } from '../util/test/testHelper';
import { PasswordUseProxyConfirm } from '.';

jest.setTimeout(100000);
ReactDOM.createPortal = jest.fn((modal) => modal);

const onChangeMock = jest.fn();
const onConfirmClickMock = jest.fn();
const setIsPasswordErrorMock = jest.fn();
const setSelectedProxyMock = jest.fn();
let api: ApiPromise | undefined;
const passPhrase = 'Polkagate@123';

describe('Testing PasswordUseProxyConfirm component', () => {
  beforeAll(async () => {
    const { result } = renderHook((prop) => useApiWithChain(prop.chain as Chain), { initialProps: { chain: { name: 'kusama' } } });

    await waitFor(() => expect(result.current).toBeTruthy(), {
      onTimeout (error) {
        console.error('Api connection is lost!');

        return error;
      },
      timeout: 60000
    });

    api = result.current;
  });

  test('Empty input, Without proxy', () => {
    const { container, getByRole, getByText } = render(
      <PasswordUseProxyConfirm
        api={api}
        genesisHash={westendGenesisHash}
        label='Password'
        onChange={onChangeMock}
        onConfirmClick={onConfirmClickMock}
        proxiedAddress={undefined}
        proxies={[]}
        proxyTypeFilter={[]}
        selectedProxy={undefined}
        setIsPasswordError={setIsPasswordErrorMock}
        setSelectedProxy={setSelectedProxyMock}
      />
    );

    const confirmButton = getByRole('button', { name: 'Confirm' });
    const inputTag = container.getElementsByTagName('input')[0];

    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
    expect(confirmButton).toBeTruthy();
    expect(confirmButton.hasAttribute('disabled')).toBeTruthy();
    expect(inputTag).toBeTruthy();
    expect(inputTag.getAttribute('value')).toBe('');

    fireEvent.click(confirmButton);
    expect(onConfirmClickMock).not.toBeCalled();
  });

  test('Empty input, With Proxy, Open SelectProxy page', () => {
    const { getByRole, getByText } = render(
      <PasswordUseProxyConfirm
        api={api}
        genesisHash={westendGenesisHash}
        label='Password'
        onChange={onChangeMock}
        onConfirmClick={onConfirmClickMock}
        proxiedAddress={undefined}
        proxies={validProxy}
        proxyTypeFilter={[]}
        selectedProxy={undefined}
        setIsPasswordError={setIsPasswordErrorMock}
        setSelectedProxy={setSelectedProxyMock}
      />
    );

    const useProxyButton = getByRole('button', { name: 'useProxy' });

    expect(useProxyButton).toBeTruthy();
    expect(getByText('Use proxy')).toBeTruthy();

    fireEvent.click(useProxyButton);

    expect(getByText('Select Proxy')).toBeTruthy();
  });

  test('Empty input, With selected Proxy', () => {
    const { getByRole, getByText } = render(
      <PasswordUseProxyConfirm
        api={api}
        genesisHash={westendGenesisHash}
        label='Password'
        onChange={onChangeMock}
        onConfirmClick={onConfirmClickMock}
        proxiedAddress={undefined}
        proxies={validProxy}
        proxyTypeFilter={[]}
        selectedProxy={validProxy[0].proxy}
        setIsPasswordError={setIsPasswordErrorMock}
        setSelectedProxy={setSelectedProxyMock}
      />
    );

    const useProxyButton = getByRole('button', { name: 'useProxy' });

    expect(useProxyButton).toBeTruthy();
    expect(getByText('Update proxy')).toBeTruthy();

    fireEvent.click(useProxyButton);

    expect(getByText('Select Proxy')).toBeTruthy();
  });

  test('Enter password', () => {
    const { container, getByRole } = render(
      <PasswordUseProxyConfirm
        api={api}
        genesisHash={westendGenesisHash}
        label='Password'
        onChange={onChangeMock}
        onConfirmClick={onConfirmClickMock}
        proxiedAddress={undefined}
        proxies={validProxy}
        proxyTypeFilter={[]}
        selectedProxy={validProxy[0].proxy}
        setIsPasswordError={setIsPasswordErrorMock}
        setSelectedProxy={setSelectedProxyMock}
      />
    );

    const inputTag = container.getElementsByTagName('input')[0];
    const confirmButton = getByRole('button', { name: 'Confirm' });

    expect(confirmButton.hasAttribute('disabled')).toBeTruthy();

    fireEvent.change(inputTag, { target: { value: passPhrase } });

    expect(onChangeMock).toBeCalled();
    expect(onChangeMock).toBeCalledWith(passPhrase);
    expect(setIsPasswordErrorMock).toBeCalled();
    expect(setIsPasswordErrorMock).toBeCalledWith(false);
    expect(confirmButton.hasAttribute('disabled')).toBeFalsy();
    expect(inputTag.getAttribute('value')).toBe(passPhrase);

    fireEvent.click(confirmButton);
    expect(onConfirmClickMock).toBeCalled();
  });
});
