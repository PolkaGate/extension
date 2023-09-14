// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Runs in the extension background, handling all keyring access

import '@polkadot/extension-inject/crossenv';

import type { RequestSignatures, TransportRequestMessage } from '@polkadot/extension-base/background/types';

import handlers from '@polkadot/extension-base/background/handlers';
import { withErrorLog } from '@polkadot/extension-base/background/handlers/helpers';
import { PORT_CONTENT, PORT_EXTENSION } from '@polkadot/extension-base/defaults';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { assert } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

// setup the notification (same a FF default background, white text)
withErrorLog(() => chrome.action.setBadgeBackgroundColor({ color: '#d90000' }));

// listen to all messages and handle appropriately
chrome.runtime.onConnect.addListener((port): void => {
  // shouldn't happen, however... only listen to what we know about
  assert([PORT_CONTENT, PORT_EXTENSION].includes(port.name), `Unknown connection from ${port.name}`);

  // message and disconnect handlers
  port.onMessage.addListener((data: TransportRequestMessage<keyof RequestSignatures>) => handlers(data, port));
  port.onDisconnect.addListener(() => console.log(`Disconnected from ${port.name}`));
});

// initial setup
cryptoWaitReady()
  .then((): void => {
    console.log('crypto initialized');

    // load all the keyring data
    keyring.loadAll({ store: new AccountsStore(), type: 'sr25519' });

    console.log('initialization completed');
  })
  .catch((error): void => {
    console.error('initialization failed', error);
  });

chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSf2WHD0oVR0NS7tW6C1U025H1XBEZXqwxvFvPhcoFa18eHQiA/viewform');

let creating: Promise<void> | undefined; // A global promise to avoid concurrency issues
const path = 'offscreen.html';

async function setupOffscreenDocument(): Promise<void> {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await clients.matchAll();

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return;
    }
  }

  // Create offscreen document if not already being created
  if (!creating) {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['BLOBS'],
      justification: 'keep service worker running'
    });

    try {
      await creating;
    } catch (error) {
      console.error('Error creating offscreen document:', error);
    } finally {
      creating = undefined; // Reset the creating promise
    }
  }
}

chrome.runtime.onStartup.addListener(setupOffscreenDocument);

self.onmessage = (e: MessageEvent) => {
  console.log(e?.data);
}; // keepAlive

// eslint-disable-next-line no-void
void setupOffscreenDocument();
