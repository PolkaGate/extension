// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import Extension from '../../../../extension-base/src/background/handlers/Extension';
import getChainInfo from '../../util/getChainInfo';
import { AccountsBalanceType, BalanceType, ChainInfo } from '../../util/plusTypes';
import { amountToMachine, balanceToHuman } from '../../util/plusUtils';
import { createAccount, createExtension } from '../../util/test/testHelper';
import TransferFund from './index';

jest.setTimeout(50000);

ReactDOM.createPortal = jest.fn((modal) => modal);

const props = {
  address: '5HEbNn6F37c9oW8E9PnnVnZBkCvz8ucjTbAQLi5H1goDqEbA',
  chain: {
    name: 'westend'
  },
  formattedAddress: '5HEbNn6F37c9oW8E9PnnVnZBkCvz8ucjTbAQLi5H1goDqEbA',
  givenType: 'ethereum',
  name: 'Amir khan'
};

const decimals = 12;
const availableBalanceInHuman = 0.15; // WND
let chainInfo: ChainInfo;
const balanceInfo: BalanceType = {
  available: amountToMachine(availableBalanceInHuman.toString(), decimals),
  coin: 'WND',
  decimals: decimals,
  total: amountToMachine(availableBalanceInHuman.toString(), decimals)
};

const sender: AccountsBalanceType | null = {
  address: props.address,
  balanceInfo: balanceInfo,
  chain: 'westend',
  name: 'Amir khan'
};

const recepientAddress = '5FbSap4BsWfjyRhCchoVdZHkDnmDm3NEgLZ25mesq4aw2WvX';

describe('Testing TransferFund index', () => {
  const invalidAddress = 'bela bela bela';
  const availableBalance = balanceToHuman(sender, 'available');

  let rendered: RenderResult<typeof import('@testing-library/dom/types/queries'), HTMLElement>;
  const transferAmountInHuman = '0.1';
  const invalidAmount = 1000000000000000;

  beforeAll(async () => {
    chainInfo = await getChainInfo('westend');
  });

  beforeEach(() => {
    rendered = render(
      <TransferFund
        chain={props.chain}
        api={chainInfo.api}
        givenType={props.givenType}
        sender={sender}
        transferModalOpen={true}
      />
    );
  });

  test('Checking existing elements', () => {
    expect(rendered.container.querySelector('#senderAddress')).not.toBeNull();
    expect(screen.queryAllByText(sender.name)).toHaveLength(1);
    expect(screen.queryAllByText(sender.address)).toHaveLength(1);

    expect(screen.queryAllByLabelText('Recipient')).toHaveLength(1);
  });

  test('Checking component functionality with invalid address', () => {
    fireEvent.change(screen.queryByLabelText('Recipient') as Element, { target: { value: invalidAddress } });
    expect(screen.queryAllByText('Recipient address is invalid')).toHaveLength(1);
  });

  test('Checking component functionality with valid address but invalid amount', () => {
    fireEvent.change(screen.queryByLabelText('Recipient') as Element, { target: { value: recepientAddress } });
    expect(screen.queryAllByText('Recipient address is invalid')).toHaveLength(0);

    expect(rendered.container.querySelector('#transferBody')).not.toBeNull();
    expect(screen.queryAllByText('Asset:')).toHaveLength(1);
    expect(rendered.container.querySelector('#availableBalance')).not.toBeNull();
    expect(screen.queryAllByText(`Available Balance: ${availableBalance}`)).toHaveLength(1);
    expect(screen.queryAllByText('Amount:')).toHaveLength(1);
    expect(screen.queryAllByLabelText('Transfer Amount')).toHaveLength(1);

    fireEvent.change(screen.queryByLabelText('Transfer Amount') as Element, { target: { value: invalidAmount } });
    expect(screen.queryByTestId('nextButton')?.children.item(0)?.textContent).toEqual('Insufficient Balance');
    expect(screen.queryByTestId('nextButton')?.children.item(0)?.hasAttribute('disabled')).toBe(true);
  });

  test('Checking component functionality with valid address and valid amount', () => {
    fireEvent.change(screen.queryByLabelText('Recipient') as Element, { target: { value: recepientAddress } });
    fireEvent.change(screen.queryByLabelText('Transfer Amount') as Element, { target: { value: transferAmountInHuman } });
    expect(screen.queryByTestId('nextButton')?.children.item(0)?.textContent).toEqual('Next');
    expect(screen.queryByTestId('nextButton')?.children.item(0)?.hasAttribute('disabled')).toBe(false);

    expect(screen.queryByTestId('allButton')?.children.item(0)?.textContent).toEqual('All');
    expect(screen.queryByTestId('safeMaxButton')?.children.item(0)?.textContent).toEqual('Max');
    fireEvent.click(screen.queryByTestId('nextButton')?.children.item(0) as Element);
    expect(screen.queryAllByText('Confirm Transfer')).toHaveLength(1);
  });
});

describe('Testing transferFund with real account', () => {
  let extension: Extension;
  let realSender: AccountsBalanceType | null;
  let secondAddress: string;
  const firstSuri = 'seed sock milk update focus rotate barely fade car face mechanic mercy';
  const secondSuri = 'inspire erosion chalk grant decade photo ribbon custom quality sure exhaust detail';

  beforeAll(async () => {
    chainInfo = await getChainInfo(props.chain.name);

    extension = await createExtension();
    const firstAddress = await createAccount(firstSuri, extension);

    secondAddress = await createAccount(secondSuri, extension);

    realSender = {
      address: firstAddress,
      balanceInfo: balanceInfo,
      chain: 'westend',
      name: 'Amir khan'
    };
  });

  test('checking All button', async () => {
    const { container, queryAllByText, queryByLabelText, queryByTestId } = render(
      <TransferFund
        chain={props.chain}
        api={chainInfo.api}
        givenType={props.givenType}
        sender={realSender}
        transferModalOpen={true}
      />
    );

    fireEvent.change(queryByLabelText('Recipient') as Element, { target: { value: secondAddress } });
    expect(queryByTestId('allButton')?.children.item(0)?.textContent).toEqual('All');
    fireEvent.click(container.querySelector('button[name=All]') as Element);
    await waitFor(() => expect(queryByTestId('nextButton')?.children.item(0)?.hasAttribute('disabled')).toBe(false), { timeout: 20000 });// wait enough to receive fee from blockchain

    fireEvent.click(screen.queryByTestId('nextButton')?.children.item(0) as Element);
    expect(queryAllByText('Confirm Transfer')).toHaveLength(1);
  });

  test('checking Max button', async () => {
    const { container, queryAllByText, queryByLabelText, queryByTestId } = render(
      <TransferFund
        chain={props.chain}
        api={chainInfo.api}
        givenType={props.givenType}
        sender={realSender}
        transferModalOpen={true}
      />
    );

    fireEvent.change(queryByLabelText('Recipient') as Element, { target: { value: secondAddress } });

    expect(queryByTestId('safeMaxButton')?.children.item(0)?.textContent).toEqual('Max');
    fireEvent.click(container.querySelector('button[name=Max]') as Element);
    await waitFor(() => expect(queryByTestId('nextButton')?.children.item(0)?.hasAttribute('disabled')).toBe(false), { timeout: 25000 });

    fireEvent.click(queryByTestId('nextButton')?.children.item(0) as Element);
    expect(queryAllByText('Confirm Transfer')).toHaveLength(1);
  });
});
