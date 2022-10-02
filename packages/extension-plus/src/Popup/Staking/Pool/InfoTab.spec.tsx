// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import '@polkadot/extension-mocks/chrome';

import { render } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import ShowBalance2 from '../../../components/ShowBalance2';
import getChainInfo from '../../../util/getChainInfo';
import { poolStakingConst } from '../../../util/test/testHelper';
import Info from './InfoTab';

let api: ApiPromise | undefined;

ReactDOM.createPortal = jest.fn((modal) => modal);
jest.setTimeout(60000);

describe('Testing info tab', () => {
  beforeAll(async () => {
    const chainInfo = await getChainInfo('westend');

    api = chainInfo?.api;
  });

  test('Checking the existence of elements when loading is done', () => {
    const { queryByTestId, queryByText } = render(
      <Info
        api={api}
        info={poolStakingConst}
      />
    );

    const ShowValue = (value: BN) => {
      return render(
        <ShowBalance2
          api={api}
          balance={value}
        />
      ).asFragment().textContent;
    };

    expect(queryByText('Welcome to pool Staking')).toBeTruthy();
    expect(queryByText('Information you need to know about')).toBeTruthy();
    expect(queryByTestId('info')?.children.item(2)?.children.item(0)?.textContent).toEqual(`Minimum {{token}}s needed to join a pool:${ShowValue(poolStakingConst.minJoinBond)}`);
    expect(queryByTestId('info')?.children.item(2)?.children.item(1)?.textContent).toEqual(`Minimum {{token}}s needed to create a pool:${ShowValue(poolStakingConst.minCreationBond)}`);
    expect(queryByTestId('info')?.children.item(2)?.children.item(2)?.textContent).toEqual(`The number of currenttly existing pools:${poolStakingConst.lastPoolId} `);
    expect(queryByTestId('info')?.children.item(2)?.children.item(3)?.textContent).toEqual(`Maximum possible pools:${poolStakingConst.maxPools} `);
    expect(queryByTestId('info')?.children.item(2)?.children.item(4)?.textContent).toEqual(`Maximum possible pool members:${poolStakingConst.maxPoolMembers} `);
    // poolStakingConst.maxPoolMembersPerPool = -1;
    expect(queryByTestId('info')?.children.item(2)?.children.item(5)?.textContent).toBeFalsy();
  });
});
