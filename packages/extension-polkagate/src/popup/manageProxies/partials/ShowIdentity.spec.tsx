// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { render } from '@testing-library/react';
import React from 'react';

import ShowIdentity from './ShowIdentity';

jest.setTimeout(20000);

const accId = {
  display: 'PolkaGate',
  email: 'polkagate@outlook.com',
  legal: '@polkagate:matrix.org',
  riot: 'Polkagate',
  twitter: '@PolkaGate',
  web: 'http://polkagate.xyz'
};

describe('Testing ShowIdentity component', () => {
  test('Wait for identity', () => {
    const { getByRole, getByText } = render(
      <ShowIdentity />
    );

    expect(getByText('Identity')).toBeTruthy();
    expect(getByRole('progressbar')).toBeTruthy();
    expect(getByText('looking for identity...')).toBeTruthy();
  });

  test('No identity', () => {
    const { getByText, queryByRole, queryByText } = render(
      <ShowIdentity accountIdentity={null} />
    );

    expect(getByText('Identity')).toBeTruthy();
    expect(queryByRole('progressbar')).toBeFalsy();
    expect(queryByText('looking for identity...')).toBeFalsy();
    expect(getByText('No identity found')).toBeTruthy();
  });

  test('With identity', () => {
    const { getByText, queryByRole, queryByText } = render(
      <ShowIdentity accountIdentity={accId} />
    );

    expect(getByText('Identity')).toBeTruthy();
    expect(queryByRole('progressbar')).toBeFalsy();
    expect(queryByText('looking for identity...')).toBeFalsy();
    expect(queryByText('No identity found')).toBeFalsy();

    expect(queryByText('Display:')).toBeTruthy();
    expect(queryByText('Legal:')).toBeTruthy();
    expect(queryByText('Email:')).toBeTruthy();
    expect(queryByText('Element:')).toBeTruthy();
    expect(queryByText('Twitter:')).toBeTruthy();
    expect(queryByText('Web:')).toBeTruthy();

    expect(queryByText(accId.display)).toBeTruthy();
    expect(queryByText(accId.legal)).toBeTruthy();
    expect(queryByText(accId.email)).toBeTruthy();
    expect(queryByText(accId.riot)).toBeTruthy();
    expect(queryByText(accId.twitter)).toBeTruthy();
    expect(queryByText(accId.web)).toBeTruthy();
  });
});
