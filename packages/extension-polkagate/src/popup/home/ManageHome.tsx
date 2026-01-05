// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import HomePageFullScreen from '../../fullscreen/home';
import useIsExtensionPopup from '../../hooks/useIsExtensionPopup';
import Home from '.';

function ManageHome (): React.ReactElement {
  const onExtension = useIsExtensionPopup();

  return onExtension ? <Home /> : <HomePageFullScreen />;
}

export default React.memo(ManageHome);
