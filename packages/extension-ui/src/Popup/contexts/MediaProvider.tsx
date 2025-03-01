// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useEffect, useState } from 'react';

import { MediaContext, SettingsContext } from '@polkadot/extension-polkagate/src/components/contexts';

interface MediaProviderProps {
  children: React.ReactNode;
}

// Request permission for video, based on access we can hide/show import
async function requestMediaAccess(cameraOn: boolean): Promise<boolean> {
  if (!cameraOn) {
    return false;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });

    return true;
  } catch (error) {
    console.error('Permission for video declined', (error as Error).message);
  }

  return false;
}

export default function MediaProvider({ children }: MediaProviderProps) {
  const settings = useContext(SettingsContext);
  const [cameraOn, setCameraOn] = useState(settings.camera === 'on');
  const [mediaAllowed, setMediaAllowed] = useState(false);

  useEffect(() => {
    setCameraOn(settings.camera === 'on');
  }, [settings.camera]);

  useEffect(() => {
    requestMediaAccess(cameraOn)
      .then(setMediaAllowed)
      .catch(console.error);
  }, [cameraOn]);

  return (
    <MediaContext.Provider value={cameraOn && mediaAllowed}>
      {children}
    </MediaContext.Provider>
  );
}
