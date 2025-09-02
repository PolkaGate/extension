// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { MyTooltip } from '../components';

function UnableToPayFee ({ warningText }: { warningText: string | undefined }) {
  return (
    <MyTooltip
      content={warningText}
    >
      <FontAwesomeIcon
        beat
        color='#FF4FB9'
        fontSize='15px'
        icon={faTriangleExclamation}
        style={{ marginRight: '4px' }}
      />
    </MyTooltip>
  );
}

export default UnableToPayFee;
