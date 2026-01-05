// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthorizeRequestHandlerProp } from '.';

import React from 'react';

import ConnectedDapp from '@polkadot/extension-polkagate/src/partials/ConnectedDapp';

import HomeLayout from '../../fullscreen/components/layout';

interface Props {
  authorizeRequestHandler: AuthorizeRequestHandlerProp
}

function AuthFullScreenMode ({ authorizeRequestHandler }: Props): React.ReactElement {
  return (
    <HomeLayout>
      <ConnectedDapp
        authorizeRequestHandler={authorizeRequestHandler}
      />
    </HomeLayout>
  );
}

export default React.memo(AuthFullScreenMode);
