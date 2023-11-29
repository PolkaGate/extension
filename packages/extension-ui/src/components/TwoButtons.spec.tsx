// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { TwoButtons } from '.';

jest.setTimeout(20000);

const onPrimaryMock = jest.fn();
const onSecondaryMock = jest.fn();
const primaryBtnText = 'Accept';

describe('Testing TwoButtons component', () => {
  test('Checking the existence and functionality of the buttons', () => {
    const { getAllByRole, getByRole, getByText } = render(
      <TwoButtons onPrimaryClick={onPrimaryMock} onSecondaryClick={onSecondaryMock} primaryBtnText={primaryBtnText} />
    );

    const twoButtons = getAllByRole('button');
    const secondaryButton = getByRole('button', { name: 'Cancel' });
    const primaryButton = getByRole('button', { name: primaryBtnText });

    expect(twoButtons).toHaveLength(2);
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText(primaryBtnText)).toBeTruthy();

    fireEvent.click(secondaryButton);
    expect(onSecondaryMock).toHaveBeenCalled();

    fireEvent.click(primaryButton);
    expect(onPrimaryMock).toHaveBeenCalled();
  });

  test('Disabled', () => {
    jest.resetAllMocks();
    const { getByRole } = render(
      <TwoButtons disabled onPrimaryClick={onPrimaryMock} onSecondaryClick={onSecondaryMock} primaryBtnText={primaryBtnText} />
    );

    const secondaryButton = getByRole('button', { name: 'Cancel' });
    const primaryButton = getByRole('button', { name: primaryBtnText });

    fireEvent.click(secondaryButton);
    expect(onSecondaryMock).toHaveBeenCalled();

    fireEvent.click(primaryButton);
    expect(onPrimaryMock).not.toHaveBeenCalled();
  });

  test('Busy', () => {
    jest.resetAllMocks();
    const { getByRole, queryByText } = render(
      <TwoButtons isBusy onPrimaryClick={onPrimaryMock} onSecondaryClick={onSecondaryMock} primaryBtnText={primaryBtnText} />
    );

    const primaryBusyButton = getByRole('button', { name: 'primaryBusyButton' });

    expect(queryByText(primaryBtnText)).toBeFalsy();
    fireEvent.click(primaryBusyButton);
    expect(onPrimaryMock).not.toHaveBeenCalled();
  });
});
