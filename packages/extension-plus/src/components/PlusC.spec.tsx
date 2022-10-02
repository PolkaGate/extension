// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description This test is to test plus component
*/
import '@polkadot/extension-mocks/chrome';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { grey } from '@mui/material/colors';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, shallow } from 'enzyme';
import React from 'react';

import AddressQRcode from '../Popup/AddressQRcode/AddressQRcode';
import TransactionHistory from '../Popup/History';
import TransferFunds from '../Popup/Transfer';
import { chain } from '../util/test/testHelper';
import Balance from './Balance';
import Plus from './Plus';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
configure({ adapter: new Adapter() });

const Chain = {
  name: 'westend'
};

const Props = {
  address: '5FkGthTZn2eNkNX5eN7Rac8KNsE9QvBejwrzaDiBV3UrQgYQ',
  chain: Chain,
  formattedAddress: '5FkGthTZn2eNkNX5eN7Rac8KNsE9QvBejwrzaDiBV3UrQgYQ',
  givenType: undefined,
  name: 'amir khan'
};

const t = (text: string) => text;

describe('Testing Plus component', () => {
  test('rendering Plus while chain is null', () => {
    const wrapper = shallow(
      <Plus
        address={Props.address}
        chain={null}
        formattedAddress={Props.formattedAddress}
        givenType={Props.givenType}
        name={Props.name}
        t={t}
      />).dive();

    expect(wrapper.find(FontAwesomeIcon)).toHaveLength(5);
    expect(wrapper.find('#noChainAlert').text()).toEqual('Please select a chain to view your balance.');
    wrapper.find(FontAwesomeIcon).forEach((node) => expect(node.prop('color')).toBe(grey[300]));

    expect(wrapper.find('#emptyCoinPrice')).toHaveLength(0);
  });

  test('rendering Plus', () => {
    const wrapper = shallow(
      <Plus
        address={Props.address}
        chain={chain()}
        formattedAddress={Props.formattedAddress}
        givenType={Props.givenType}
        name={Props.name}
        t={t}

      />).dive();

    expect(wrapper.find(Balance)).toHaveLength(3);

    wrapper.find('#receive').simulate('click');
    expect(wrapper.find(AddressQRcode)).toHaveLength(1);

    wrapper.find('#send').simulate('click');
    expect(wrapper.find(TransferFunds)).toHaveLength(1);

    wrapper.find('#history').simulate('click');
    expect(wrapper.find(TransactionHistory)).toHaveLength(1);

    wrapper.find('#staking').simulate('click');

    expect(wrapper.find('#emptyCoinPrice')).toHaveLength(1);
  });
});
