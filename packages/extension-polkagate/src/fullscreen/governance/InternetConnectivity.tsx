// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import WifiOffIcon from '@mui/icons-material/WifiOff';
import React, { useEffect, useState } from 'react';

async function checkInternetAccess() {
  try {
    const response = await fetch('https://www.google.com', {
      cache: 'no-store', // Ensure it doesn't get cached
      method: 'HEAD' // Only request headers (no content)
    });

    if (response.ok) {
      return true; // Internet is accessible
    } else {
      throw new Error('No internet access.');
    }
  } catch (error) {
    console.log('No internet access.', error);

    return false;
  }
}

const CHECK_INTERNET_CONNECTIVITY_PERIOD = 5000; // ms

function InternetConnectivity(): React.ReactElement {
  const [isOnline, setIsOnline] = useState<boolean>();

  useEffect(() => {
    checkInternetAccess().then((_isOnline) => {
      setIsOnline(_isOnline);
    }).catch(console.error);

    const intervalId = setInterval(() => {
      checkInternetAccess().then((_isOnline) => {
        setIsOnline(_isOnline);
      }).catch(console.error);
    }, CHECK_INTERNET_CONNECTIVITY_PERIOD);

    return () => clearInterval(intervalId);
  }, []);

  return (

    <>
      {
        isOnline === false &&
        <WifiOffIcon
          sx={{
            '@keyframes blink-animation': {
              to: {
                visibility: 'hidden'
              }
            },
            animation: 'blink-animation 1s steps(5, start) infinite',
            color: '#FF002B'
          }}
        />
      }
    </>
  );
}

export default React.memo(InternetConnectivity);
