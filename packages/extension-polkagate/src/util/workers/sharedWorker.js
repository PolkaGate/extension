// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';

import { getAssetOnAssetHub } from './shared-helpers/getAssetOnAssetHub.js';
import { getAssetOnMultiAssetChain } from './shared-helpers/getAssetOnMultiAssetChain.js';
import { getAssetOnRelayChain } from './shared-helpers/getAssetOnRelayChain.js';

const assetsChains = createAssets();

onmessage = (e) => {
  const { functionName, parameters } = e.data;

  const params = Object.values(parameters);

  try {
    switch (functionName) {
      case 'getAssetOnRelayChain':
        getAssetOnRelayChain(...params).catch(console.error);
        break;

      case 'getAssetOnMultiAssetChain':
        // eslint-disable-next-line no-case-declarations
        const assetsToBeFetched = assetsChains[parameters.chainName];

        /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but wil fetch them on-demand later in account details page*/
        if (!assetsToBeFetched) {
          console.info(`getAssetOnMultiAssetChain: No assets to be fetched on ${parameters.chainName}`);

          return postMessage({ functionName }); // FIXME: if this happens, should be handled in caller
        }

        getAssetOnMultiAssetChain(assetsToBeFetched, ...params).catch(console.error);
        break;

      case 'getAssetOnAssetHub':
        if (!parameters.assetsToBeFetched) {
          console.warn('getAssetOnAssetHub: No assets to be fetched on, but just Native Token');

          parameters.assetsToBeFetched = [];
        }

        getAssetOnAssetHub(...params).catch(console.error);
        break;

      default:
        console.error('unknown function sent to shared worker!');

        return postMessage({ functionName });
    }
  } catch (error) {
    console.error(`Error while shared worker probably running ${functionName}`, error);

    return postMessage({ functionName });
  }
};
