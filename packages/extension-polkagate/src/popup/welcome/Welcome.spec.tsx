// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import Welcome from '.';

jest.setTimeout(20000);

describe('Testing Welcome page', () => {
  test('Checking the existence of the elements', () => {
    const { getByLabelText, getByRole, getByText } = render(
      <Welcome />
    );

    expect(getByRole('img')).toBeTruthy();
    expect(getByText('Polkagate')).toBeTruthy();
    expect(getByLabelText('menu')).toBeTruthy();

    expect(getByRole('heading', { name: 'Welcome' })).toBeTruthy();
    expect(getByText('Before we start, just a couple of notes regarding use:')).toBeTruthy();

    expect(getByText('We do not send any clicks, pageviews or events to a central server.')).toBeTruthy();
    expect(getByText('We do not use any trackers or analytics.')).toBeTruthy();
    expect(getByText('We do not collect keys, addresses or any information. Your information never leaves this machine.')).toBeTruthy();

    expect(getByText('... We are not in the information collection business (even anonymized).')).toBeTruthy();

    expect(getByRole('button', { name: 'Understood, let me continue' })).toBeTruthy();
  });

  test('Checking the button functionality', () => {
    jest.spyOn(Storage.prototype, 'setItem');
    Storage.prototype.setItem = jest.fn();

    const { getByRole } = render(
      <Welcome />
    );

    fireEvent.click(getByRole('button', { name: 'Understood, let me continue' }));
    expect(Storage.prototype.setItem).toBeCalled();
    expect(Storage.prototype.setItem).toBeCalledWith('welcome_read', 'ok');
  });
});
