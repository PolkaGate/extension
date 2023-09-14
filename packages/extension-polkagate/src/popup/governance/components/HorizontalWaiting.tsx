// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Wordpress } from 'better-react-spinkit';
import React from 'react';

function HorizontalWaiting({ color }: { color: string }): React.ReactElement {
  return (
    <div>
      <Wordpress
        color={color}
        timingFunction='linear'
      />
      <Wordpress
        color={color}
        timingFunction='ease'
      />
      <Wordpress
        color={color}
        timingFunction='ease-in'
      />
      <Wordpress
        color={color}
        timingFunction='ease-out'
      />
      <Wordpress
        color={color}
        timingFunction='ease-in-out'
      />
    </div>
  );
}

export default React.memo(HorizontalWaiting);
