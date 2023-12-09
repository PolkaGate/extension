// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const OWNER = 'Nick-1979';
const REPO = 'polkagate-extension';
const FILE_PATH = 'chainsInformation.json';
const DATABASE_NAME = 'PolkaGateDB';
const OBJECT_STORE_NAME = 'ChainsInformation';

const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE_PATH}`;

const getDBVersion = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Check if the object store already exists
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        // Create the object store
        db.createObjectStore(OBJECT_STORE_NAME, { autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

      const getRequest = objectStore.get('Version');

      getRequest.onsuccess = (event) => {
        const result = event.target.result;

        if (result) {
          resolve(result);
        } else {
          console.log('get version failed, no database found');

          reject('get version failed, no database found');
        }

        db.close();
      };

      getRequest.onerror = () => {
        console.error('Error retrieving version');
        reject('Error retrieving version');
        db.close();
      };

      // Complete the transaction
      transaction.oncomplete = () => {
        console.log('Transaction completed');
      };

      transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.error);
        reject('Transaction error');
      };
    };
  });
};

const initializeIndexedDB = (jsonFile: JSON) => {
  const request = indexedDB.open(DATABASE_NAME, 1);

  // Handle database creation or upgrade
  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create an object store (similar to a table in SQL databases)
    db.createObjectStore(OBJECT_STORE_NAME, {
      autoIncrement: true
    });
  };

  // Handle successful database opening
  request.onsuccess = (event) => {
    const db = event.target.result;

    // Start a transaction
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    for (const key in jsonFile) {
      const addRequest = objectStore.add(jsonFile[key], `${key}`);

      // Handle the success or error of the add operation
      addRequest.onsuccess = (event) => {
        console.log('JSON data added successfully');
      };

      addRequest.onerror = (event) => {
        console.error('Error adding JSON data:', event.target.error);
      };
    }

    // Complete the transaction
    transaction.oncomplete = () => {
      console.log('Transaction completed');
    };

    transaction.onerror = (event) => {
      console.error('Transaction error:', event.target.error);
    };

    db.close();
  };
};

const updateIndexedDB = (jsonFile: JSON) => {
  const request = indexedDB.open(DATABASE_NAME, 1);

  request.onsuccess = (event) => {
    const db = event.target.result;

    // Start a transaction
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    const clearRequest = objectStore.clear();

    clearRequest.onsuccess = () => {
      console.log('Database cleared successfully');
      initializeIndexedDB(jsonFile);
    };

    clearRequest.onerror = (event) => {
      console.error('Error clearing object store:', event.target.error);
    };

    // Complete the transaction
    transaction.oncomplete = () => {
      console.log('Transaction completed');
    };

    transaction.onerror = (event) => {
      console.error('Transaction error:', event.target.error);
    };

    db.close();
  };
};

export async function updateIndexedDBChainInformation(): Promise<void> {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const json = await response.json() as JSON;

      const fetchedDBV = json.Version;
      const existingDBVersion = await getDBVersion().catch(console.error);

      if (existingDBVersion) {
        if (fetchedDBV > existingDBVersion) {
          updateIndexedDB(json);
        }
      } else {
        initializeIndexedDB(json);
      }
    } else {
      throw new Error(`Failed to fetch JSON file. Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch JSON file: ${error.message}`);
  }
}
