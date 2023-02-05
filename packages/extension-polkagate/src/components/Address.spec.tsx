// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { render } from '@testing-library/react';
import React from 'react';

import { getSubstrateAddress } from '../util/utils';
import { Address } from '.';

jest.setTimeout(20000);

const polkadotAddress = '17VdcY2F3WvhSLFHBGZreubzQNQ3NZzLbQsugGzHmzzprSG';
const substrateAddress = getSubstrateAddress(polkadotAddress);

describe('Testing Address component', () => {
  test('No input props', () => {
    const { container, getAllByText } = render(
      <Address />
    );

    const identiconElement = container.getElementsByTagNameNS('*', 'svg');

    expect(identiconElement).toBeTruthy();
    expect(identiconElement.item(0)?.getAttribute('name')).toBe(null);
    expect(getAllByText('<unknown>').length).toBe(2);
  });

  test('With address', () => {
    const { container, getByRole, getByText } = render(
      <Address address={polkadotAddress} />
    );

    const identiconElement = container.getElementsByTagNameNS('*', 'svg');
    const copyButton = getByRole('button');

    expect(getByRole('heading').textContent).toBe('<unknown>');
    expect(getByText(`${substrateAddress?.at(0) as string}...${substrateAddress?.at(-1) as string}`)).toBeTruthy();
    expect(identiconElement).toBeTruthy();
    expect(identiconElement.item(0)?.getAttribute('name')).toBe(substrateAddress);
    expect(copyButton).toBeTruthy();
  });

  test('With name', () => {
    const { getAllByRole } = render(
      <Address name='PolkaGate' />
    );

    expect(getAllByRole('heading').at(0)?.textContent).toBe('PolkaGate');
    expect(getAllByRole('heading').at(1)?.textContent).toBe('<unknown>');
  });

  test('No copy button', () => {
    const { getByRole, getByText, queryByRole } = render(
      <Address address={polkadotAddress} name='PolkaGate' showCopy={false} />
    );

    expect(getByRole('heading').textContent).toBe('PolkaGate');
    expect(getByText(`${substrateAddress?.at(0) as string}...${substrateAddress?.at(-1) as string}`)).toBeTruthy();
    expect(queryByRole('button')).toBeFalsy();
  });
});
