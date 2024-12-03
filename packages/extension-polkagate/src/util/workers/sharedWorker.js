// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { createAssets } from '@polkagate/apps-config/assets';

import { getAssetOnAssetHub } from './shared-helpers/getAssetOnAssetHub.js';
import { getAssetOnMultiAssetChain } from './shared-helpers/getAssetOnMultiAssetChain.js';
import { getAssetOnRelayChain } from './shared-helpers/getAssetOnRelayChain.js';
import getNFTs from './shared-helpers/getNFTs.js';

const assetsChains = createAssets();

// Handle connections to the shared worker
onconnect = (event) => {
  const port = event.ports[0]; // Get the MessagePort from the connection

  console.info('Shared worker: port connected');

  port.onmessage = (e) => {
    const { functionName, parameters } = e.data;

    const params = Object.values(parameters);

    console.info('Shared worker, message received for:', functionName, parameters);

    try {
      switch (functionName) {
        case 'getAssetOnRelayChain':
          getAssetOnRelayChain(...params, port).catch(console.error);
          break;

        case 'getAssetOnMultiAssetChain': {
          // eslint-disable-next-line no-case-declarations
          const assetsToBeFetched = assetsChains[parameters.chainName];

          /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but will fetch them on-demand later in account details page*/
          if (!assetsToBeFetched) {
            console.info(`Shared worker, getAssetOnMultiAssetChain: No assets to be fetched on ${parameters.chainName}`);

            return port.postMessage(JSON.stringify({ functionName })); // FIXME: if this happens, should be handled in caller
          }

          getAssetOnMultiAssetChain(assetsToBeFetched, ...params, port).catch(console.error);
          break;
        }

        case 'getAssetOnAssetHub': {
          if (!parameters.assetsToBeFetched) {
            console.warn('getAssetOnAssetHub: No assets to be fetched on, but just Native Token');

            parameters.assetsToBeFetched = [];
          }

          getAssetOnAssetHub(...params, port).catch(console.error);
          break;
        }

        case 'getNFTs':
          getNFTs(...params, port).catch(console.error);
          break;

        default:
          console.error('unknown function sent to shared worker!');

          return port.postMessage(JSON.stringify({ functionName }));
      }
    } catch (error) {
      console.error(`Error while shared worker probably running ${functionName}`, error);

      return port.postMessage(JSON.stringify({ functionName }));
    }
  };
};
