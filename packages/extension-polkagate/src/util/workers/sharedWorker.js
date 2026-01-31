// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { createAssets } from '@polkagate/apps-config/assets';

import { FETCHING_ASSETS_FUNCTION_NAMES } from '../constants';
import { getAssetOnAssetHub } from './shared-helpers/getAssetOnAssetHub.js';
import { getAssetOnMultiAssetChain } from './shared-helpers/getAssetOnMultiAssetChain.js';
import { getAssetOnRelayChain } from './shared-helpers/getAssetOnRelayChain.js';
import getNFTs from './shared-helpers/getNFTs.js';
import { getPool } from './shared-helpers/getPool.js';
import getValidatorsInformation from './shared-helpers/getValidatorsInformation.js';

const assetsChains = createAssets();

// Queue system
class RequestQueue {
  constructor () {
    this.queue = [];
    this.isProcessing = false;
  }

  add (task) {
    this.queue.push(task);
    console.info(`Shared worker: Task added to queue. Queue length: ${this.queue.length}`);

    if (!this.isProcessing) {
      this.processNext().catch(console.error);
    }
  }

  async processNext () {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      console.info('Shared worker: Queue empty, processing complete');

      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    console.info(`Shared worker: Processing task. Remaining in queue: ${this.queue.length}`);

    try {
      await task();
    } catch (error) {
      console.error('Shared worker: Error processing task', error);
    }

    // Process next task
    this.processNext().catch(console.error);
  }

  getQueueLength () {
    return this.queue.length;
  }
}

const requestQueue = new RequestQueue();

// Handle connections to the shared worker
onconnect = (/** @type {{ ports: any[]; }} */ event) => {
  const port = event.ports[0]; // Get the MessagePort from the connection

  console.info('Shared worker: port connected');

  port.onmessage = (/** @type {{ data: { functionName: any; parameters: any; }; }} */ e) => {
    const { functionName, parameters } = e.data;

    const params = Object.values(parameters);

    console.info('Shared worker, message received for:', functionName, parameters);

    // Add the request to the queue
    requestQueue.add(async () => {
      try {
        switch (functionName) {
          case FETCHING_ASSETS_FUNCTION_NAMES.RELAY: {
            await getAssetOnRelayChain(...params, port);
            break;
          }

          case FETCHING_ASSETS_FUNCTION_NAMES.MULTI_ASSET: {
            const assetsToBeFetched = assetsChains[parameters.chainName];

            /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but will fetch them on-demand later in account details page*/
            if (!assetsToBeFetched) {
              console.info(`Shared worker, getAssetOnMultiAssetChain: No assets to be fetched on ${parameters.chainName}`);
              port.postMessage(JSON.stringify({ functionName }));

              return;
            }

            await getAssetOnMultiAssetChain(assetsToBeFetched, ...params, port);
            break;
          }

          case FETCHING_ASSETS_FUNCTION_NAMES.ASSET_HUB: {
            if (!parameters.assetsToBeFetched) {
              console.warn('getAssetOnAssetHub: No assets to be fetched on, but just Native Token');
              parameters.assetsToBeFetched = [];
            }

            await getAssetOnAssetHub(...params, port);
            break;
          }

          case 'getNFTs':
            await getNFTs(...params, port);
            break;

          case 'getValidatorsInformation':
            await getValidatorsInformation(...params, port);
            break;

          case 'getPool':
            await getPool(...params, port);
            break;

          default:
            console.error('unknown function sent to shared worker!');
            port.postMessage(JSON.stringify({ functionName }));
        }
      } catch (error) {
        console.error(`Error while shared worker running ${functionName}`, error);
        port.postMessage(JSON.stringify({ functionName, error: error.message }));
      }
    });
  };
};
