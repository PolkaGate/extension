// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import type { Codec } from '@polkadot/types/types';

import { render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApiPromise } from '@polkadot/api';
import { DeriveTreasuryProposal, DeriveTreasuryProposals } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces';
import { BN_HUNDRED, BN_MILLION } from '@polkadot/util';

import Extension from '../../../../../extension-base/src/background/handlers/Extension';
import { buildHierarchy } from '../../../../../extension-polkagate/src/util/buildHierarchy';
import { AccountContext, SettingsContext } from '../../../../../extension-ui/src/components';
import getTips from '../../../util/api/getTips';
import getChainInfo from '../../../util/getChainInfo';
import { ChainInfo, Tip } from '../../../util/plusTypes';
import { toHuman } from '../../../util/plusUtils';
import { accounts, chain, createAcc, createExtension, firstSuri } from '../../../util/test/testHelper';
import ProposalsOverview from './proposals/overview';
import SubmitProposal from './proposals/SubmitProposal';
import TipsOverview from './tips/Overview';
import ProposeTip from './tips/ProposeTip';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

let chainInfo: ChainInfo;
let extension: Extension;
let address: string;
let proposalsInfo: DeriveTreasuryProposals | null;
let proposal: DeriveTreasuryProposal;
let tips: Tip[];
let tip: Tip;
let availableBalance: Balance;
const SettingsStruct = { prefix: 0 };
let bondPercentage: number;
let proposalBondMinimum: Balance;
let reportDeposit: Balance;
let api: ApiPromise;

describe('Testing Treasury component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo(chain().name);
    api = chainInfo.api;

    extension = await createExtension();
    address = await createAcc(firstSuri, chainInfo.genesisHash, extension);

    await api.query.system.account(accounts[0].address).then((balance: Codec) => {
      availableBalance = api.createType('Balance', (balance.data.free).sub(balance.data.miscFrozen));
    });

    proposalsInfo = await chainInfo.api.derive.treasury.proposals();

    const { proposals } = proposalsInfo;

    if (proposals?.length) proposal = proposals[0];

    bondPercentage = api.consts.treasury.proposalBond.mul(BN_HUNDRED).div(BN_MILLION).toNumber();
    proposalBondMinimum = api.createType('Balance', api.consts.treasury.proposalBondMinimum);

    const reason = [];

    reportDeposit = api.createType('Balance', (api.consts.tips.tipReportDepositBase).add((api.consts.tips.dataDepositPerByte).muln(reason.length)));

    const res = await getTips(chain().name, 0, 10);

    tips = res?.data?.list;
    if (tips?.length) tip = tips[0];
  });

  test('Checking the Proposals\' tab elements, with no proposal', () => {
    const { queryByText } = render(
      <ProposalsOverview
        address={''}
        chain={chain()}
        chainInfo={chainInfo}
        proposalsInfo={null}
      />
    );

    expect(queryByText('No active proposals')).toBeTruthy();
  });

  test('Checking the Proposals\' tab elements', async () => {
    const { getByRole, queryAllByText, queryByText } = render(
      <ProposalsOverview
        address={''}
        chain={chain()}
        chainInfo={chainInfo}
        proposalsInfo={proposalsInfo}
      />
    );

    if (proposal) {
      expect(getByRole('button', { name: 'Submit' })).toBeTruthy();
      expect(queryAllByText(`Payment: ${toHuman(api, proposal.proposal.value)}`)).toBeTruthy();
      expect(queryAllByText(`Bond: ${toHuman(api, proposal.proposal.bond)}`)).toBeTruthy();

      await waitFor(() => {
        expect(queryAllByText('Proposer')).toBeTruthy();
        expect(queryAllByText(proposal.proposal.proposer.toString())).toBeTruthy();

        expect(queryAllByText('Beneficiary')).toBeTruthy();
        expect(queryAllByText(proposal.proposal.beneficiary.toString())).toBeTruthy();
      }, { timeout: 10000 });
    }
  });

  test('Checking the submit proposal elements', async () => {
    const { queryByLabelText, queryByTestId, queryByText } = render(
      <SettingsContext.Provider value={SettingsStruct}>
        <AccountContext.Provider
          value={{
            accounts: accounts,
            hierarchy: buildHierarchy(accounts)
          }}
        >
          <SubmitProposal
            address={address}
            chain={chain()}
            chainInfo={chainInfo}
            showSubmitProposalModal={true}
          />
        </AccountContext.Provider>
      </SettingsContext.Provider>
    );

    expect('Submit proposal').toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Proposer:')).toBeTruthy();
      expect(queryByText(`Available: ${availableBalance.toHuman()}`)).toBeTruthy();
    }, { timeout: 15000 });

    expect(queryByLabelText('Beneficiary')).toBeTruthy();

    expect(queryByLabelText('Value')).toBeTruthy();
    expect(queryByText('will be allocated to the beneficiary if approved')).toBeTruthy();

    expect(queryByText(`Proposal bond: ${bondPercentage.toFixed(2)} %`)).toBeTruthy();
    expect(queryByText(`Minimum bond: ${proposalBondMinimum.toHuman()}`)).toBeTruthy();

    expect(queryByLabelText('Password')).toBeTruthy();
    expect(queryByText('Please enter the account password')).toBeTruthy();
    expect(queryByTestId('confirmButton')).toBeTruthy();
  });

  // Tips tab
  test('Checking the Tips\' tab elements, with no tips', () => {
    const { queryByText } = render(
      <SettingsContext.Provider value={SettingsStruct}>
        <AccountContext.Provider
          value={{
            accounts: accounts,
            hierarchy: buildHierarchy(accounts)
          }}
        >
          <TipsOverview
            address={address}
            chain={chain()}
            chainInfo={chainInfo}
            tips={null}
          />
        </AccountContext.Provider>
      </SettingsContext.Provider>
    );

    expect(queryByText('No active tips')).toBeTruthy();
  });

  test('Checking the Tips\' tab elements', async () => {
    const { getByRole, queryAllByText } = render(
      <SettingsContext.Provider value={SettingsStruct}>
        <AccountContext.Provider
          value={{
            accounts: accounts,
            hierarchy: buildHierarchy(accounts)
          }}
        >
          <TipsOverview
            address={address}
            chain={chain()}
            chainInfo={chainInfo}
            tips={tips}
          />
        </AccountContext.Provider>
      </SettingsContext.Provider>
    );

    if (tip) {
      expect(getByRole('button', { name: 'Propose tip' })).toBeTruthy();
      expect(queryAllByText(`Status: ${tip.status}`)).toBeTruthy();
      expect(queryAllByText(`Amount: ${toHuman(api, tip.amount)}`)).toBeTruthy();
      expect(queryAllByText(`Tippers: ${tip.tipper_num}`)).toBeTruthy();
      expect(queryAllByText(`Reason: ${tip.reason}`)).toBeTruthy();

      await waitFor(() => {
        expect(queryAllByText('Finder')).toBeTruthy();
        expect(queryAllByText(tip.finder.address)).toBeTruthy();

        expect(queryAllByText('Beneficiary')).toBeTruthy();
        expect(queryAllByText(tip.beneficiary.address)).toBeTruthy();
      }, { timeout: 10000 });
    }
  });

  test('Checking the propose tip elements', async () => {
    const { queryByLabelText, queryByTestId, queryByText } = render(
      <SettingsContext.Provider value={SettingsStruct}>
        <AccountContext.Provider
          value={{
            accounts: accounts,
            hierarchy: buildHierarchy(accounts)
          }}
        >
          <ProposeTip
            address={address}
            chain={chain()}
            chainInfo={chainInfo}
            showProposeTipModal={true}
          />
        </AccountContext.Provider>
      </SettingsContext.Provider>
    );

    expect('Propose tip').toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Proposer:')).toBeTruthy();
      expect(queryByText(`Available: ${availableBalance.toHuman()}`)).toBeTruthy();
    }, { timeout: 15000 });

    expect(queryByLabelText('Beneficiary')).toBeTruthy();

    expect(queryByLabelText('Reason')).toBeTruthy();
    expect(queryByText('declare why the recipient deserves a tip payout?')).toBeTruthy();

    expect(queryByText(`Report deposit: ${reportDeposit.toHuman()}`)).toBeTruthy();

    expect(queryByLabelText('Password')).toBeTruthy();
    expect(queryByText('Please enter the account password')).toBeTruthy();
    expect(queryByTestId('confirmButton')).toBeTruthy();
  });

});
