// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { options } from '@acala-network/api';

import {
  ApiPromise,
  WsProvider
} from '@polkadot/api';
import {
  createWsEndpoints
} from '@polkadot/apps-config';
import { selectableNetworks } from '@polkadot/networks';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import getPoolAccounts from '../../util/getPoolAccounts';
import { ACALA_GENESIS_HASH, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH } from '../constants';
import { DEFAULT_ASSETS } from '../defaultAssets';

async function fastestEndpoint (chainEndpoints, isACA) {
  let connection;

  const connections = chainEndpoints.map((endpoint) => {
    const wsProvider = new WsProvider(endpoint.value);

    if (isACA) {
      connection = new ApiPromise(options({ provider: wsProvider })).isReady;
    } else {
      connection = ApiPromise.create({ provider: wsProvider });
    }

    return {
      connection,
      wsProvider
    };
  });

  const fastestApi = await Promise.any(connections.map((con) => con.connection));

  return {
    connections,
    fastApi: fastestApi
  };
}

function closeWebsockets (connections) {
  connections.forEach((con) => con.wsProvider.disconnect().catch(handleError));
}

function handleError (error) {
  console.error('Error:', error);
}

function sanitizeText (input) {
  return input
    .split(/(?=[A-Z])/)
    .join(' ')
    .trim();
}

function getToken (genesisHash) {
  const network = selectableNetworks.find((network) => network.genesisHash[0] === genesisHash);

  return network?.symbols?.length ? network.symbols[0] : undefined;
}

function firstLetterUppercase (text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getNativeToken (accounts, api, genesisHash, tokenName, promises, results) {
  const params = accounts.map((address) => api.derive.balances.all(address).then((balances) => {
    const availableBalance = balances.freeBalance.add(balances.reservedBalance);
    const chainName = firstLetterUppercase(tokenName) + 'AssetHub';

    if (availableBalance.isZero()) {
      return;
    }

    results.push({
      address,
      balances: String(availableBalance),
      chain: sanitizeText(chainName),
      decimal: getDecimal(genesisHash),
      genesisHash,
      priceId: tokenName,
      token: getToken(genesisHash)
    });
  }));

  promises.push(params);
}

function getDecimal (genesisHash) {
  const network = selectableNetworks.find((network) => network.genesisHash[0] === genesisHash);

  return network?.decimals?.length ? network.decimals[0] : undefined;
}

async function acalaTokens (accounts, acalaAssetsList, results, promises) {
  if (!acalaAssetsList || acalaAssetsList.length === 0) {
    return [];
  }

  const allEndpoints = createWsEndpoints();

  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === 'acala')
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'))
    .slice(0, 5);

  const { connections, fastApi } = await fastestEndpoint(chainEndpoints, true);

  for (const asset of acalaAssetsList) {
    const params = accounts.map((address) => fastApi.query.tokens.accounts(address, { Token: asset.token }).then((bal) => {
      const total = bal.free.add(bal.reserved);
      const zeroBalance = total.isZero();

      if (zeroBalance) {
        return;
      }

      results.push({
        address,
        balances: String(total),
        chain: sanitizeText('Acala'),
        decimal: asset?.decimal ?? getDecimal(ACALA_GENESIS_HASH),
        genesisHash: ACALA_GENESIS_HASH,
        priceId: asset.priceId,
        token: asset.token
      });

      postMessage(JSON.stringify(results));
    }));

    promises.push(params);
  }

  return connections;
}

async function assetHubTokens (accounts, assetsToFetch, assetHubChainName, genesishash, results, promises) {
  if (!assetsToFetch || assetsToFetch.length === 0) {
    return [];
  }

  const allEndpoints = createWsEndpoints();

  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === assetHubChainName.toLowerCase())
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'));

  const { connections, fastApi } = await fastestEndpoint(chainEndpoints, false);

  const nativeAssetName = assetHubChainName.toLowerCase() === 'polkadotassethub'
    ? 'polkadot'
    : assetHubChainName.toLowerCase() === 'kusamaassethub'
      ? 'kusama'
      : 'westend';

  getNativeToken(accounts, fastApi, genesishash, nativeAssetName, promises, results);

  for (const asset of assetsToFetch) {
    const params = accounts.map((address) => fastApi.query.assets.account(asset.assetId, address));

    promises.push(Promise.all([fastApi.query.assets.metadata(asset.assetId), ...params]).then((p) => {
      const metadata = p[0];
      const accountsAssets = p.slice(1);

      const decimal = metadata.decimals.toNumber();
      const token = metadata.symbol.toHuman();

      accountsAssets.forEach((accountAsset, index) => {
        const total = accountAsset.isNone ? BN_ZERO : accountAsset.unwrap().balance;
        const zeroBalance = total.isZero();

        if (zeroBalance) {
          return;
        }

        results.push({
          address: accounts[index],
          assetId: asset?.assetId,
          balances: String(total),
          chain: sanitizeText(assetHubChainName),
          decimal,
          genesisHash: genesishash,
          priceId: asset?.priceId,
          token
        });

        postMessage(JSON.stringify(results));
      });
    }));
  }

  return connections;
}

async function getPoolBalance (api, address, availableBalance) {
  const response = await api.query.nominationPools.poolMembers(address);
  const member = response && response.unwrapOr(undefined);

  if (!member) {
    return availableBalance;
  }

  const poolId = member.poolId;
  const accounts = poolId && getPoolAccounts(api, poolId);

  if (!accounts) {
    return availableBalance;
  }

  const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
    api.query.nominationPools.bondedPools(poolId),
    api.derive.staking.account(accounts.stashId),
    api.call.nominationPoolsApi.pendingRewards(address)
  ]);

  const active = member.points.isZero()
    ? BN_ZERO
    : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));

  const rewards = myClaimable;
  let unlockingValue = BN_ZERO;

  member?.unbondingEras?.forEach((value) => {
    unlockingValue = unlockingValue.add(value);
  });

  return availableBalance.add(active.add(rewards).add(unlockingValue));
}

async function setupConnections (chain, accounts, allEndpoints) {
  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === chain.toLowerCase())
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'));

  console.log(`Connecting to endpoints for ${chain}`);

  const { connections, fastApi } = await fastestEndpoint(chainEndpoints, false);

  if (fastApi.isConnected && fastApi.derive.balances) {
    const requests = accounts.map(async (accountAddress) => {
      const balances = await fastApi.derive.balances.all(accountAddress);

      const availableBalance = balances.freeBalance.add(balances.reservedBalance);

      if (fastApi.query.nominationPools) {
        const total = await getPoolBalance(fastApi, accountAddress, availableBalance);

        return { address: accountAddress, balance: total };
      }

      return { address: accountAddress, balance: availableBalance };
    });

    return { balances: await Promise.all(requests), connections };
  }
}

async function getAssetsOnOtherChains (accounts) {
  console.log(`get assets on other chains called for ${accounts}`);
  const allEndpoints = createWsEndpoints();

  // Create an array to store the results
  const results = [];

  const promises = [];

  const acalaAssets = DEFAULT_ASSETS.filter((asset) => asset.genesisHash === ACALA_GENESIS_HASH);
  const polkadotAssetHubsAssets = DEFAULT_ASSETS.filter((asset) => asset.genesisHash === STATEMINT_GENESIS_HASH);
  const kusamaAssetHubsAssets = DEFAULT_ASSETS.filter((asset) => asset.genesisHash === STATEMINE_GENESIS_HASH);
  const otherAssets = DEFAULT_ASSETS.filter((asset) =>
    asset.genesisHash !== STATEMINE_GENESIS_HASH &&
    asset.genesisHash !== STATEMINT_GENESIS_HASH &&
    asset.genesisHash !== ACALA_GENESIS_HASH
  );

  console.log('polkadotAssetHubsAssets:', polkadotAssetHubsAssets);

  const acalaConnections = await acalaTokens(accounts, acalaAssets, results, promises);
  const pAHConnections = await assetHubTokens(accounts, polkadotAssetHubsAssets, 'PolkadotAssetHub', STATEMINT_GENESIS_HASH, results, promises);
  const kAHConnections = await assetHubTokens(accounts, kusamaAssetHubsAssets, 'KusamaAssetHub', STATEMINE_GENESIS_HASH, results, promises);

  const newPromises = otherAssets.length > 0
    ? otherAssets.map((asset) => {
      return setupConnections(asset.name, accounts, allEndpoints)
        .then(({ balances, connections }) => {
          balances.forEach(({ address, balance }) => {
            const zeroBalance = balance.isZero();

            if (zeroBalance) {
              return;
            }

            results.push({
              address,
              balances: String(balance),
              chain: sanitizeText(asset.name),
              decimal: getDecimal(asset.genesisHash),
              genesisHash: asset.genesisHash,
              priceId: asset.priceId,
              token: getToken(asset.genesisHash)
            });

            postMessage(JSON.stringify(results));
          });

          closeWebsockets(connections);
        })
        .catch((error) => {
          console.error(`Error fetching balances for ${asset.name}:`, error);
        });
    })
    : [];

  promises.push(...newPromises);

  await Promise.all(promises).finally(() => {
    closeWebsockets([...acalaConnections, ...pAHConnections, ...kAHConnections]);
    const noAssetsOnOtherChains = results.every((res) => res.balances === '0');

    if (noAssetsOnOtherChains) {
      return postMessage('null');
    } else {
      return postMessage('Done');
    }
  });
}

onmessage = async (e) => {
  const {
    accounts
  } = e.data;

  let tryCount = 1;

  console.log(`tryCount fetch assets on other chains: ${tryCount}`);

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      // eslint-disable-next-line no-void
      await getAssetsOnOtherChains(accounts);

      tryCount = 0;
    } catch (error) {
      console.error(`Error while fetching assets on other chains, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage('Done');
    }

    tryCount++;
  }
};
