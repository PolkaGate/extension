// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import HomePageFullScreen from '../../fullscreen/homeFullScreen';
import useIsExtensionPopup from '../../hooks/useIsExtensionPopup';
import Home from '.';

function ManageHome(): React.ReactElement {
  const onExtension = useIsExtensionPopup();
  const [home, setHome] = useState<React.ReactElement>(<></>);

  useEffect(() => {
    if (onExtension) {
      setHome(<Home />);
    } else {
      setHome(<HomePageFullScreen />);
    }
  }, [onExtension]);

  return (home);
}

export default React.memo(ManageHome);
