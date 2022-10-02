// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';
import 'jsdom-worker-fix';

import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route } from 'react-router';

import getChainInfo from '../../util/getChainInfo';
import { ChainInfo } from '../../util/plusTypes';
import { amountToHuman, remainingTime } from '../../util/plusUtils';
import { actives, auction, crowdloan, display, endpoints, winners } from '../../util/test/testHelper';
import AuctionTab from './AuctionTab';
import CrowdloanTab from './CrowdloanTab';
import Crowdloans from './index';

jest.setTimeout(60000);

let chainInfo: ChainInfo;

describe('Testing Crowdloans component', () => {
  test('Checking the existence of elements', () => {
    const { queryAllByText, queryByText } = render(
      <>
        <MemoryRouter initialEntries={['/auction-crowdloans']}>
          <Route path='/auction-crowdloans'><Crowdloans className='amir' /></Route>
        </MemoryRouter>
      </>
    );

    expect(queryAllByText('Crowdloans')).toBeTruthy();
    expect(queryByText('Auction')).toBeTruthy();
    expect(queryByText('Loading Auction/Crowdloans ...')).toBeTruthy();
  });
});

describe('Testing Auction component', () => {
  beforeAll(async () => chainInfo = await getChainInfo('westend'));
  test('Checking the AuctionTab\'s elements', () => {
    const { queryAllByText, queryByText } = render(
      <AuctionTab
        auction={auction}
        chainInfo={chainInfo}
        endpoints={endpoints}
        myContributions={undefined}
      />
    );

    // Auction
    expect(queryAllByText('Auction')).toBeTruthy();
    expect(queryAllByText('Lease', { exact: false })).toBeTruthy();
    expect(queryAllByText(`${Number(auction.auctionInfo[0])} - ${Number(auction.auctionInfo[0]) + Number(chainInfo.api.consts.auctions.leasePeriodsPerSlot.toString()) - 1}`, { exact: false })).toBeTruthy();
    expect(queryAllByText('Ending stage', { exact: false })).toBeTruthy();
    expect(queryAllByText(`${Number(auction.auctionInfo[1])} - ${Number(auction.auctionInfo[1]) + Number(chainInfo.api.consts.auctions?.endingPeriod.toString())}`, { exact: false })).toBeTruthy();
    expect(queryAllByText('Current block', { exact: false })).toBeTruthy();
    expect(queryAllByText(`${auction.currentBlockNumber}`, { exact: false })).toBeTruthy();
    expect(queryByText('Remaining Time', { exact: false })?.textContent).toEqual(`Remaining Time:  ${remainingTime((Number(auction.auctionInfo[1]) + Number(chainInfo.api.consts.auctions?.endingPeriod.toString())) - auction.currentBlockNumber)}`);

    // Bids
    expect(queryByText('Bids')).toBeTruthy();
    expect(queryByText(display(crowdloan).slice(0, 15))).toBeTruthy();
    expect(queryByText(`Parachain Id: ${auction.winning[0][1].replace(/,/g, '')}`)).toBeTruthy();
    expect(queryAllByText('Lease', { exact: false })).toBeTruthy();
    expect(queryAllByText(`${String(crowdloan?.fund.firstPeriod)} - ${String(crowdloan?.fund.lastPeriod)}`, { exact: false })).toBeTruthy();
    expect(queryAllByText('End', { exact: false })).toBeTruthy();
    expect(queryByText(`${crowdloan.fund.end}`, { exact: false })).toBeTruthy();
    expect(queryByText('Raised/Cap', { exact: false })).toBeTruthy();
    expect(queryByText(`${Number(amountToHuman(crowdloan.fund.raised, chainInfo.decimals, 0)).toLocaleString()}`, { exact: false })).toBeTruthy();
    expect(queryByText(`/${Number(amountToHuman(crowdloan.fund.cap, chainInfo.decimals)).toLocaleString()}`, { exact: false })).toBeTruthy();
  });

  describe('Testing CrowdloansTab component', () => {
    test('Checking the CrowdloanTab\'s elements', () => {
      const { queryAllByText, queryByText } = render(
        <CrowdloanTab
          auction={auction}
          chainInfo={chainInfo}
          endpoints={endpoints}
          // eslint-disable-next-line react/jsx-no-bind
          handleContribute={() => true}
          myContributions={undefined}
        />
      );

      expect(queryByText('view active crowdloans')).toBeTruthy();
      expect(queryByText('view auction winners')).toBeTruthy();
      expect(queryByText('view ended crowdloans')).toBeTruthy();
      expect(queryByText(`Actives(${actives.length})`)).toBeTruthy();
      expect(queryByText(`Winners(${winners.length})`)).toBeTruthy();
      expect(queryByText('Ended(0)')).toBeTruthy();
      // debug(undefined, 300000);

      // active crowdloans
      for (const active of actives) {
        expect(queryByText(display(active).slice(0, 15))).toBeTruthy();
        expect(queryByText(`Parachain Id: ${active.fund.paraId}`)).toBeTruthy();

        expect(queryAllByText('Lease', { exact: false })).toBeTruthy();
        expect(queryAllByText(`${String(active?.fund.firstPeriod)} - ${String(active?.fund.lastPeriod)}`, { exact: false })).toBeTruthy();

        expect(queryAllByText('End', { exact: false })).toBeTruthy();
        expect(queryAllByText(`${active.fund.end}`, { exact: false })).toBeTruthy();

        expect(queryAllByText('Raised/Cap', { exact: false })).toBeTruthy();
        expect(queryAllByText(`${Number(amountToHuman(active.fund.raised, chainInfo.decimals, 0)).toLocaleString()}`, { exact: false })).toBeTruthy();
        expect(queryAllByText(`/${Number(amountToHuman(active.fund.cap, chainInfo.decimals)).toLocaleString()}`, { exact: false })).toBeTruthy();
      }

      expect(queryAllByText('Next')).toHaveLength(actives.length);

      // winner crowdloans
      for (const winner of winners) {
        expect(queryByText(display(winner).slice(0, 15))).toBeTruthy();
        expect(queryByText(`Parachain Id: ${winner.fund.paraId}`)).toBeTruthy();

        expect(queryAllByText('Lease', { exact: false })).toBeTruthy();
        expect(queryAllByText(`${String(winner?.fund.firstPeriod)} - ${String(winner?.fund.lastPeriod)}`, { exact: false })).toBeTruthy();

        expect(queryAllByText('End', { exact: false })).toBeTruthy();
        expect(queryAllByText(`${winner.fund.end}`, { exact: false })).toBeTruthy();

        expect(queryAllByText('Raised/Cap', { exact: false })).toBeTruthy();
        expect(queryAllByText(`${Number(amountToHuman(winner.fund.raised, chainInfo.decimals, 0)).toLocaleString()}`, { exact: false })).toBeTruthy();
        expect(queryAllByText(`/${Number(amountToHuman(winner.fund.cap, chainInfo.decimals)).toLocaleString()}`, { exact: false })).toBeTruthy();
      }

      // ended crowdloans
      expect(queryByText('There is no item to show')).toBeTruthy();
    });
  });
});
