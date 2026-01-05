// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

const CHECK_INTERNET_CONNECTIVITY_PERIOD = 5000; // ms

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

export default function useIsOnline(): boolean | undefined {
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

  return isOnline;
}
