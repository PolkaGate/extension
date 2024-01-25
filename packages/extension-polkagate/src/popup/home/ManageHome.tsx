// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import useIsExtensionPopup from '../../hooks/useIsExtensionPopup';
import HomePageFullScreen from '../homeFullScreen';
import Home from '.';

export default function ManageHome (): React.ReactElement {
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
