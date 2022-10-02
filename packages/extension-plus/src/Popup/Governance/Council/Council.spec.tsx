// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import type { DeriveCollectiveProposal } from '@polkadot/api-derive/types';
import type { Codec } from '@polkadot/types/types';

import { render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { AccountContext, SettingsContext } from '@polkadot/extension-ui/components';
import { buildHierarchy } from '@polkadot/extension-ui/util/buildHierarchy';
import { Balance } from '@polkadot/types/interfaces';

import Extension from '../../../../../extension-base/src/background/handlers/Extension';
import getCouncilAll from '../../../util/api/getCouncilAll';
import getCurrentBlockNumber from '../../../util/api/getCurrentBlockNumber';
import getChainInfo from '../../../util/getChainInfo';
import { ChainInfo, CouncilInfo, PersonsInfo } from '../../../util/plusTypes';
import { amountToHuman, remainingTime } from '../../../util/plusUtils';
import { accounts, chain, createAcc, createExtension, firstSuri, makeShortAddr } from '../../../util/test/testHelper';
import Motions from './motions/Motions';
import CouncilCouncilors from './overview/Overview';
import VoteCouncil from './overview/vote/Vote';

jest.setTimeout(60000);
ReactDOM.createPortal = jest.fn((modal) => modal);

let chainInfo: ChainInfo;
let motions: DeriveCollectiveProposal[];
let currentBlockNumber: number;
let availableBalance: Balance;
const SettingsStruct = { prefix: 0 };
let councilInfo: CouncilInfo;
let accountInfos;
let candidates;
let members: [];
let runnersUp;
let membersInfo: { backed: string, infos: string };
let runnersUpInfo: { backed: string, infos: string };
let candidatesInfo: { backed: string, infos: string };
let allCouncilInfo: PersonsInfo;
let extension: Extension;
let address: string;

describe('Testing Council component', () => {
  beforeAll(async () => {
    chainInfo = await getChainInfo(chain().name);

    extension = await createExtension();
    address = await createAcc(firstSuri, chainInfo.genesisHash, extension);

    currentBlockNumber = await getCurrentBlockNumber(chain().name);

    await chainInfo.api.derive.council?.proposals().then((p) => {
      if (p) motions = (JSON.parse(JSON.stringify(p)));
    });

    await chainInfo.api.query.system.account(accounts[0].address).then((balance: Codec) => {
      availableBalance = chainInfo.api.createType('Balance', (balance.data.free).sub(balance.data.miscFrozen));
    });

    await getCouncilAll(chain().name).then((c) => {
      councilInfo = c;
    });

    if (councilInfo) {
      accountInfos = councilInfo.accountInfos;
      candidates = councilInfo.candidates;
      members = councilInfo.members;
      runnersUp = councilInfo.runnersUp;
      membersInfo = {
        backed: members.map((m) => m[1].toString()),
        infos: accountInfos.slice(0, members.length)
      };
      runnersUpInfo = {
        backed: runnersUp.map((m) => m[1].toString()),
        infos: accountInfos.slice(members.length, members.length + runnersUp.length)
      };
      candidatesInfo = {
        backed: candidates.map((m) => '0'), // TODO: is 0 a good default for candidates backup amount?!
        // desiredSeats: Number(candidateCount),
        infos: accountInfos.slice(members.length + runnersUp.length)
      };
      allCouncilInfo = {
        backed: membersInfo.backed.concat(runnersUpInfo.backed, candidatesInfo.backed),
        infos: accountInfos
      };
    }
  });

  test('Checking the COUNCILLORS\' tab elements', () => {
    const { getByRole, queryAllByText, queryByText } = render(
      <CouncilCouncilors
        address={address}
        chainInfo={chainInfo}
        councilInfo={councilInfo}
      />
    );

    expect(queryByText(`Seats${members.length}/${councilInfo.desiredSeats.toString()}`)).toBeTruthy();
    expect(queryByText(`Runners up${councilInfo.runnersUp.length}/${councilInfo.desiredRunnersUp.toString()}`)).toBeTruthy();
    expect(queryByText(`Candidates${councilInfo.candidateCount.toString()}`)).toBeTruthy();
    expect(getByRole('button', { name: 'Vote' })).toBeTruthy();
    expect(getByRole('button', { name: 'Cancel votes' })).toBeTruthy();

    expect(queryByText('Members')).toBeTruthy();

    for (const member of membersInfo.infos) {
      if (member.identity.display && member.identity.displayParent) {
        expect(queryAllByText(`${member.identity.displayParent} /`)).toBeTruthy();
        expect(queryAllByText(`${member.identity.display}`)).toBeTruthy();
      } else if (!(member.identity.displayParent) && member.identity.display) {
        expect(queryAllByText(`${member.identity.display}`)).toBeTruthy();
      } else if (member.identity.displayParent && !(member.identity.display)) {
        expect(queryAllByText(`${member.identity.displayParent} /`)).toBeTruthy();
      } else {
        expect(queryAllByText(makeShortAddr(member.accountId))).toBeTruthy();
      }

      expect(queryAllByText(`Backed: ${amountToHuman(membersInfo.backed[membersInfo.infos.indexOf(member)], chainInfo.decimals, 2, true)} ${chainInfo.coin}`)).toBeTruthy();
    }

    expect(queryByText('Runners up')).toBeTruthy();

    for (const runnerUp of runnersUpInfo.infos) {
      if (runnerUp.identity.display && runnerUp.identity.displayParent) {
        expect(queryAllByText(`${runnerUp.identity.displayParent} /`)).toBeTruthy();
        expect(queryAllByText(`${runnerUp.identity.display}`)).toBeTruthy();
      } else if (!(runnerUp.identity.displayParent) && runnerUp.identity.display) {
        expect(queryAllByText(`${runnerUp.identity.display}`)).toBeTruthy();
      } else if (runnerUp.identity.displayParent && !(runnerUp.identity.display)) {
        expect(queryAllByText(`${runnerUp.identity.displayParent} /`)).toBeTruthy();
      } else {
        expect(queryAllByText(makeShortAddr(runnerUp.accountId))).toBeTruthy();
      }

      expect(queryAllByText(`Backed: ${amountToHuman(runnersUpInfo.backed[runnersUpInfo.infos.indexOf(runnerUp)], chainInfo.decimals, 2)} ${chainInfo.coin}`)).toBeTruthy();
    }

    expect(queryByText('Candidates')).toBeTruthy();

    if (candidatesInfo) {
      for (const Candidate of candidatesInfo.infos) {
        if (Candidate.identity.display && Candidate.identity.displayParent) {
          expect(queryAllByText(`${Candidate.identity.displayParent} /`)).toBeTruthy();
          expect(queryAllByText(`${Candidate.identity.display}`)).toBeTruthy();
        } else if (!(Candidate.identity.displayParent) && Candidate.identity.display) {
          expect(queryAllByText(`${Candidate.identity.display}`)).toBeTruthy();
        } else if (Candidate.identity.displayParent && !(Candidate.identity.display)) {
          expect(queryAllByText(`${Candidate.identity.displayParent} /`)).toBeTruthy();
        } else {
          expect(queryAllByText(makeShortAddr(Candidate.accountId))).toBeTruthy();
        }

        expect(queryAllByText(`Backed: ${amountToHuman(candidatesInfo.backed[candidatesInfo.infos.indexOf(Candidate)], chainInfo.decimals, 2)} ${chainInfo.coin}`)).toBeTruthy();
      }
    } else {
      expect(queryByText('No Candidates found')).toBeTruthy();
    }
  });

  test('Checking the Vote component elements', async () => {
    const { queryAllByText, queryByLabelText, queryByTestId, queryByText } = render(
      <SettingsContext.Provider value={SettingsStruct}>
        <AccountContext.Provider
          value={{
            accounts: accounts,
            hierarchy: buildHierarchy(accounts)
          }}
        >
          <VoteCouncil
            address={address}
            allCouncilInfo={allCouncilInfo}
            chain={chain()}
            chainInfo={chainInfo}
            showVotesModal={true}
          />
        </AccountContext.Provider>
      </SettingsContext.Provider>
    );

    expect('Vote').toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Voter:')).toBeTruthy();
      expect(queryByTestId('balance')?.textContent).toEqual(`Available: ${availableBalance.toHuman()}`);
    }, { timeout: 15000 });
    expect(queryByText('Voting bond:')).toBeTruthy();
    expect(queryAllByText('Vote value')).toBeTruthy();
    expect(queryByText('Fee:', { exact: false })).toBeTruthy();
    expect(queryByText('will be locked and used in elections')).toBeTruthy();

    expect(queryByText('Accounts to vote')).toBeTruthy();

    for (const councilInfo of allCouncilInfo.infos) {
      if (councilInfo.identity.display && councilInfo.identity.displayParent) {
        expect(queryAllByText(`${councilInfo.identity.displayParent} /`)).toBeTruthy();
        expect(queryAllByText(`${councilInfo.identity.display}`)).toBeTruthy();
      } else if (!(councilInfo.identity.displayParent) && councilInfo.identity.display) {
        expect(queryAllByText(`${councilInfo.identity.display}`)).toBeTruthy();
      } else if (councilInfo.identity.displayParent && !(councilInfo.identity.display)) {
        expect(queryAllByText(`${councilInfo.identity.displayParent} /`)).toBeTruthy();
      } else {
        expect(queryAllByText(makeShortAddr(councilInfo.accountId))).toBeTruthy();
      }

      expect(queryAllByText(`Backed: ${amountToHuman(allCouncilInfo.backed[allCouncilInfo.infos.indexOf(councilInfo)], chainInfo.decimals, 2)} ${chainInfo.coin}`)).toBeTruthy();
    }

    expect(queryByLabelText('Password')).toBeTruthy();
    expect(queryByText('Please enter the account password')).toBeTruthy();
    expect(queryByTestId('confirmButton')).toBeTruthy();
  });

  test('Checking the Cancelvote component elements', () => { /* TODO */ });

  test('Checking the MOTIONS\' tab elements', () => {
    const { queryAllByRole, queryByText } = render(
      <Motions
        chainInfo={chainInfo}
        currentBlockNumber={currentBlockNumber}
        motions={motions?.length ? [motions[0]] : []}
      />
    );

    if (motions?.length) {
      expect(queryByText('Index')).toBeTruthy();
      expect(queryByText(`Voting end${remainingTime(motions[0].votes.end - currentBlockNumber)}#${motions[0].votes.end}`)).toBeTruthy();
      expect(queryByText(`VotsAye ${motions[0].votes.ayes.length}/${motions[0].votes.threshold}`)).toBeTruthy();
      expect(queryByText(`Threshold${motions[0].votes.threshold}`)).toBeTruthy();
      expect(queryAllByRole('link')).toHaveLength(2);
    } else {
      expect(queryByText('No active motion')).toBeTruthy();
    }
  });
});
