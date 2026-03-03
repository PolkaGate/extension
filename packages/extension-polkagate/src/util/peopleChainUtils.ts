// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KUSAMA_PEOPLE_GENESIS_HASH, PASEO_ASSET_HUB_GENESIS_HASH, PASEO_PEOPLE_GENESIS_HASH, POLKADOT_PEOPLE_GENESIS_HASH, RELAY_CHAINS_NAMES, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, WESTEND_PEOPLE_GENESIS_HASH, WESTMINT_GENESIS_HASH } from './constants';

/**
 * @description To provide people chain if its already available for that chain
 * @param genesisHash
 * @returns endpoint and chain
 */

export const getPeopleChainGenesisHash = (chainName: string | undefined) => {
  const startWith = RELAY_CHAINS_NAMES.find((name) => chainName?.startsWith(name)) || undefined;

  switch (startWith) {
    case 'Westend':
      return WESTEND_PEOPLE_GENESIS_HASH;
    case 'Kusama':
      return KUSAMA_PEOPLE_GENESIS_HASH;
    case 'Polkadot':
      return POLKADOT_PEOPLE_GENESIS_HASH;
    case 'Paseo':
      return PASEO_PEOPLE_GENESIS_HASH;
    default:
      return undefined;
  }
};

/**
 * Fetches the chain name based on the genesis hash
 * @param {string} genesisHash - The genesis hash of the chain
 * @returns {string} The name of the chain
*/
export const getPeopleChainName = (genesisHash: string) => {
  if (genesisHash === STATEMINT_GENESIS_HASH) {
    return 'PolkadotPeople';
  } else if (genesisHash === STATEMINE_GENESIS_HASH) {
    return 'KusamaPeople';
  } else if (genesisHash === PASEO_ASSET_HUB_GENESIS_HASH) {
    return 'PaseoPeople';
  } else if (genesisHash === WESTMINT_GENESIS_HASH) {
    return 'WestendPeople';
  } else {
    return '';
  }
};
