// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { AmountWithOptions } from '.';

jest.setTimeout(20000);

let inputValue: string | undefined = '';

const onChangeAmountMock = jest.fn((val: string) => {
  inputValue = val;
});

const onPrimaryMock = jest.fn(() => {
  inputValue = '10';
});

const onSecondaryMock = jest.fn(() => {
  inputValue = '1';
});

describe('Testing AmountWithOptions component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    inputValue = '';
  });

  test('One option button', () => {
    const { getByRole, getByText, rerender } = render(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        primaryBtnText='Max'
        value={inputValue}
      />
    );

    const primaryButton = getByRole('button', { name: 'primaryBtn' });
    const inputElement = getByRole('spinbutton');

    expect(getByText('Amount')).toBeTruthy();
    expect(inputElement).toBeTruthy();
    expect(inputElement.getAttribute('value')).toBe('');
    expect(getByText('Max')).toBeTruthy();
    expect(primaryButton).toBeTruthy();

    fireEvent.click(primaryButton);
    expect(onPrimaryMock).toHaveBeenCalled();
    expect(onPrimaryMock).toHaveBeenCalledTimes(1);
    expect(onChangeAmountMock).not.toHaveBeenCalled();
    rerender(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        primaryBtnText='Max'
        value={inputValue}
      />
    );
    expect(inputElement.getAttribute('value')).toBe('10');
  });

  test('Two option buttons', () => {
    const { getByRole, getByText, rerender } = render(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        onSecondary={onSecondaryMock}
        primaryBtnText='Max'
        secondaryBtnText='Min'
        value={inputValue}
      />
    );

    const inputElement = getByRole('spinbutton');
    const primaryButton = getByRole('button', { name: 'primaryBtn' });
    const secondaryButton = getByRole('button', { name: 'secondaryBtn' });

    expect(getByText('Max')).toBeTruthy();
    expect(getByText('Min')).toBeTruthy();
    expect(primaryButton).toBeTruthy();
    expect(secondaryButton).toBeTruthy();

    fireEvent.click(primaryButton);
    expect(onPrimaryMock).toHaveBeenCalled();
    expect(onPrimaryMock).toHaveBeenCalledTimes(1);
    rerender(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        onSecondary={onSecondaryMock}
        primaryBtnText='Max'
        secondaryBtnText='Min'
        value={inputValue}
      />
    );
    expect(inputElement.getAttribute('value')).toBe('10');

    fireEvent.click(secondaryButton);
    expect(onSecondaryMock).toHaveBeenCalled();
    expect(onSecondaryMock).toHaveBeenCalledTimes(1);
    rerender(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        onSecondary={onSecondaryMock}
        primaryBtnText='Max'
        secondaryBtnText='Min'
        value={inputValue}
      />
    );
    expect(inputElement.getAttribute('value')).toBe('1');
  });

  test('Enter number', () => {
    const { getByRole, rerender } = render(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        primaryBtnText='Max'
        value={inputValue}
      />
    );

    const inputElement = getByRole('spinbutton');

    expect(inputElement.getAttribute('value')).toBe('');
    fireEvent.change(inputElement, { target: { value: 'invalidChar' } });
    expect(onChangeAmountMock).not.toHaveBeenCalled();
    expect(inputElement.getAttribute('value')).toBe('');

    fireEvent.change(inputElement, { target: { value: '123' } });
    expect(onChangeAmountMock).toHaveBeenCalled();
    expect(onChangeAmountMock).toHaveBeenCalledWith('123');
    rerender(
      <AmountWithOptions
        label='Amount'
        onChangeAmount={onChangeAmountMock}
        onPrimary={onPrimaryMock}
        primaryBtnText='Max'
        value={inputValue}
      />
    );
    expect(inputElement.getAttribute('value')).toBe('123');
  });
});
