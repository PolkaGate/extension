// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
import { hexToString } from '@polkadot/util';

import { KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH } from '../../constants';
import getChainName from '../../getChainName';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from '../utils';

const BATCH_SIZE = 50;

/**
 * Fetches the chain name based on the genesis hash
 * @param {string} genesisHash - The genesis hash of the chain
 * @returns {string} The name of the chain
*/
const getPeopleChainName = (genesisHash) => {
  if (genesisHash === POLKADOT_GENESIS_HASH) {
    return 'PolkadotPeople';
  } else if (genesisHash === KUSAMA_GENESIS_HASH) {
    return 'KusamaPeople';
  } else {
    return 'WestendPeople';
  }
};

/**
 * Extended version of DeriveStakingQuery which includes identity information
 * @typedef {Object} ValidatorInformation
 * @extends {import('@polkadot/api-derive/types').DeriveStakingQuery}
 * @property {import('@polkadot/api-derive/types').DeriveAccountRegistration | null | undefined} [identity] - Optional identity information for the validator
*/

/**
 * Converts raw identity data from hex format to readable strings
 * @param {import('@polkadot/types/lookup').PalletIdentityRegistration} id - The identity object containing raw hex data
 * @returns {Object} Converted identity with human-readable string values
 */
const convertId = (id) => ({
  display: hexToString(id.info.display.asRaw.toHex()),
  email: hexToString(id.info.email.asRaw.toHex()),
  // github: id.info.github && hexToString(id.info.github.asRaw.toHex()),
  judgements: id.judgements,
  legal: hexToString(id.info.legal.asRaw.toHex()),
  riot: hexToString(
    id.info.riot
      ? id.info.riot.asRaw.toHex()
      : id.info.matrix.asRaw.toHex()
  ),
  twitter: hexToString(id.info.twitter.asRaw.toHex()),
  web: hexToString(id.info.web.asRaw.toHex())
});

/**
 * Fetches and processes validator information from a Polkadot/Substrate network
 * This includes both elected and waiting validators along with their identities
 *
 * @param {string} genesisHash - The Polkadot API instance
 * @param {MessagePort } port
 */
export default async function getValidatorsInformation (genesisHash, port) {
  const chainName = getChainName(genesisHash);

  if (!chainName) {
    console.error('Invalid genesisHash provided:', genesisHash);
    port.postMessage(JSON.stringify({ functionName: 'getValidatorsInformation', results: null }));

    return;
  }

  const endpoints = getChainEndpoints(chainName);

  try {
    const { api, connections } = await fastestEndpoint(endpoints);

    console.log('getting validators information on ' + chainName);

    const [electedInfo, waitingInfo, currentEra] = await Promise.all([
      api.derive.staking.electedInfo({ withClaimedRewardsEras: true, withController: true, withDestination: true, withExposure: true, withExposureMeta: true, withLedger: true, withNominations: true, withPrefs: true }),
      api.derive.staking.waitingInfo({ withClaimedRewardsEras: true, withController: true, withDestination: true, withExposure: true, withExposureMeta: true, withLedger: true, withNominations: true, withPrefs: true }),
      api.query['staking']['currentEra']()
    ]);

    console.log('electedInfo, waitingInfo, currentEra fetched successfully');

    // Close the initial connections to the relay chain
    closeWebsockets(connections);

    // Start connect to the People chain endpoints in order to fetch identities
    console.log('Connecting to People chain endpoints...');
    const peopleChainName = getPeopleChainName(genesisHash);
    const peopleEndpoints = getChainEndpoints(peopleChainName);
    const { api: peopleApi, connections: peopleConnections } = await fastestEndpoint(peopleEndpoints);

    // Keep elected and waiting validators separate
    const electedValidatorsInfo = electedInfo.info;
    const waitingValidatorsInfo = waitingInfo.info;

    // Initialize separate result arrays
    /**
     * @type {ValidatorInformation[]}
    */
    const electedValidatorsInformation = [];
    /**
     * @type {import('@polkadot/api-derive/types').DeriveStakingQuery[]}
    */
    const electedMayHaveSubId = [];
    /**
     * @type {ValidatorInformation[]}
    */
    const electedAccountSubInfo = [];

    /**
     * @type {ValidatorInformation[]}
    */
    const waitingValidatorsInformation = [];
    /**
     * @type {import('@polkadot/api-derive/types').DeriveStakingQuery[]}
    */
    const waitingMayHaveSubId = [];
    /**
     * @type {ValidatorInformation[]}
    */
    const waitingAccountSubInfo = [];

    // Process elected validators
    console.log('Processing elected validators identities...');
    await processDirectIdentities(peopleApi, electedValidatorsInfo, electedValidatorsInformation, electedMayHaveSubId);
    await processSubIdentities(peopleApi, electedMayHaveSubId, electedValidatorsInformation, electedAccountSubInfo);
    await processParentIdentities(peopleApi, electedAccountSubInfo, electedValidatorsInformation);

    // Process waiting validators
    console.log('Processing waiting validators identities...');
    await processDirectIdentities(peopleApi, waitingValidatorsInfo, waitingValidatorsInformation, waitingMayHaveSubId);
    await processSubIdentities(peopleApi, waitingMayHaveSubId, waitingValidatorsInformation, waitingAccountSubInfo);
    await processParentIdentities(peopleApi, waitingAccountSubInfo, waitingValidatorsInformation);

    closeWebsockets(peopleConnections);

    const results = {
      eraIndex: Number(currentEra?.toString() || '0'),
      genesisHash,
      validatorsInformation: {
        elected: electedValidatorsInformation,
        waiting: waitingValidatorsInformation
      }
    };

    port.postMessage(JSON.stringify({ functionName: 'getValidatorsInformation', results: JSON.stringify(results) }));
  } catch (e) {
    console.error('Something went wrong while fetching validators', e);

    port.postMessage(JSON.stringify({ functionName: 'getValidatorsInformation', results: null }));
  }
}

/**
 * Processes direct identities for validators
 * @param {import('@polkadot/api').ApiPromise} api - The Polkadot API instance
 * @param {import("@polkadot/api-derive/types").DeriveStakingQuery[]} validatorsInfo - List of validators to process
 * @param {ValidatorInformation[]} validatorsInformation - Output array for validators with identities
 * @param {import("@polkadot/api-derive/types").DeriveStakingQuery[]} mayHaveSubId - Output array for validators without direct identities
 * @private
 */
async function processDirectIdentities (api, validatorsInfo, validatorsInformation, mayHaveSubId) {
  let totalProcessed = 0;

  try {
    while (validatorsInfo.length > totalProcessed) {
      console.log(`Fetching validators identity: ${totalProcessed}/${validatorsInfo.length}`);
      const currentBatch = validatorsInfo.slice(totalProcessed, totalProcessed + BATCH_SIZE);

      // Query identities in batch
      const identityEntries = await Promise.all(
        currentBatch.map((info) => api.query['identity']['identityOf'](info.accountId.toString()))
      );

      // Process results
      const processedBatch = currentBatch.map((validatorInfo, index) => {
        const identityOption = identityEntries[index];
        const identity = !identityOption.isSome ? undefined : identityOption.unwrap();

        return {
          ...validatorInfo,
          identity: identity ? convertId(identity) : undefined
        };
      });

      // Separate validators with and without identity
      const noIdentity = processedBatch.filter((info) => info.identity === undefined);
      const withIdentity = processedBatch.filter((info) => info.identity !== undefined);

      // Add to appropriate result arrays
      noIdentity.length > 0 &&
      mayHaveSubId.push(...noIdentity);

      withIdentity.length > 0 &&
      validatorsInformation.push(...withIdentity);

      totalProcessed += BATCH_SIZE;
    }

    console.log(`Fetching validators identity, DONE 👍 : ${validatorsInformation.length}/${validatorsInfo.length}`);
  } catch (error) {
    console.error('Error fetching identity:', error);
  }
}

/**
 * Processes sub-identity for validators without direct identity
 * @param {import('@polkadot/api').ApiPromise} api - The Polkadot API instance
 * @param {import("@polkadot/api-derive/types").DeriveStakingQuery[]} mayHaveSubId - Validators that might have sub-identity
 * @param {ValidatorInformation[]} validatorsInformation - Output array for validators without any identity
 * @param {ValidatorInformation[]} accountSubInfo - Output array for validators with sub-identity
 * @private
 */
async function processSubIdentities (api, mayHaveSubId, validatorsInformation, accountSubInfo) {
  let totalProcessed = 0;

  try {
    while (mayHaveSubId.length > totalProcessed) {
      console.log(`Fetching validators sub-identity: ${totalProcessed}/${mayHaveSubId.length}`);
      const currentBatch = mayHaveSubId.slice(totalProcessed, totalProcessed + BATCH_SIZE);

      // Query sub-identity in batch
      const subIdEntries = await Promise.all(
        currentBatch.map((info) => api.query['identity']['superOf'](info.accountId))
      );

      // Process results
      const processedBatch = currentBatch.map((validatorInfo, index) => {
        const subIdOption = subIdEntries[index];

        if (!subIdOption.isSome) {
          return {
            ...validatorInfo,
            identity: null
          };
        }

        const subId = subIdOption.unwrap();

        return {
          ...validatorInfo,
          identity: subId
            ? {
              display: hexToString(subId[1].asRaw.toHex()),
              parentAddress: subId[0].toString()
            }
            : undefined
        };
      });

      // Separate validators with and without sub-identity
      const noSubId = processedBatch.filter((info) => info.identity === null);
      const withSubId = processedBatch.filter((info) => info.identity !== null);

      // Add to appropriate result arrays
      if (noSubId.length > 0) {
        validatorsInformation.push(...noSubId);
      }

      if (withSubId.length > 0) {
        accountSubInfo.push(...withSubId);
      }

      totalProcessed += BATCH_SIZE;
    }

    console.log(`Fetching validators sub-identity, DONE 👍 : ${accountSubInfo.length}/${mayHaveSubId.length}`);
  } catch (error) {
    console.error('Error fetching validators sub-identity:', error);
  }
}

/**
 * Processes parent identities for validators with sub-identities
 * @param {import('@polkadot/api').ApiPromise} api - The Polkadot API instance
 * @param {ValidatorInformation[]} accountSubInfo - Validators with sub-identities
 * @param {ValidatorInformation[]} validatorsInformation - Output array for results
 * @private
 */
async function processParentIdentities (api, accountSubInfo, validatorsInformation) {
  let totalProcessed = 0;

  try {
    while (accountSubInfo.length > totalProcessed) {
      console.log(`Fetching validators PARENT identities: ${totalProcessed}/${accountSubInfo.length}`);
      const currentBatch = accountSubInfo.slice(totalProcessed, totalProcessed + BATCH_SIZE);

      // Query parent identities in batch
      const parentIdentityEntries = await Promise.all(
        currentBatch.map((info) => api.query['identity']['identityOf'](info.identity.parentAddress))
      );

      // Process results
      const processedBatch = currentBatch.map((validatorInfo, index) => {
        const parentIdentityOption = parentIdentityEntries[index];

        if (!parentIdentityOption.isSome) {
          return validatorInfo;
        }

        const parentIdentity = parentIdentityOption.unwrap();
        const parentDisplay = parentIdentity.info.display.isRaw
          ? hexToString(parentIdentity.info.display.asRaw.toHex())
          : '';

        return {
          ...validatorInfo,
          identity: {
            ...validatorInfo.identity,
            displayParent: parentDisplay
          }
        };
      });

      // Add to result array
      validatorsInformation.push(...processedBatch);
      totalProcessed += BATCH_SIZE;
    }

    console.log(`Fetching validators parent identity, DONE 👍 : ${accountSubInfo.length}/${accountSubInfo.length}`);
  } catch (error) {
    console.error('Error fetching parent identities:', error);
  }
}
