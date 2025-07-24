// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const updateStorage = async (label: string, newInfo: object) => {
  try {
    // Retrieve the previous value
    const previousData = await getStorage(label) as object;

    // Update the previous data with the new data
    const updatedData = { ...previousData, ...newInfo } as unknown;

    // Set the updated data in storage
    await setStorage(label, updatedData);

    return true;
  } catch (error) {
    console.error('Error while updating data', error);

    return false;
  }
};

export const getStorage = (label: string, parse = false): Promise<object | string> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([label], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(parse ? JSON.parse((result[label] || '{}') as string) as object : result[label] as object);
      }
    });
  });
};

export const watchStorage = (label: string, setChanges: (value: any) => void, parse = false) => {
  // eslint-disable-next-line no-undef
  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: 'sync' | 'local' | 'managed' | 'session') => {
    if (areaName === 'local' && label in changes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const change = changes[label];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newValue = change.newValue; // This is optional, so handle accordingly

      setChanges(parse ? JSON.parse((newValue || '{}') as string) : newValue);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return an unsubscribe function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};

export const getAndWatchStorage = (key: string, setter: (value: any) => void, parse = false): (() => void) => {
  getStorage(key, parse)
    .then((value) => setter(value as any))
    .catch(console.error);

  return watchStorage(key, setter, parse);
};

export const setStorage = (label: string, data: unknown, stringify = false) => {
  return new Promise<boolean>((resolve) => {
    const _data = stringify ? JSON.stringify(data) : data;

    chrome.storage.local.set({ [label]: _data }, () => {
      if (chrome.runtime.lastError) {
        console.log('Error while setting storage:', chrome.runtime.lastError);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
