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
import getPrices from '../api/getPrices';

const ACALA_GENESISHASH = '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c';
const KUSAMA_ASSETHUB_GENESISHASH = '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a';
const POLKADOT_ASSETHUB_GENESISHASH = '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f';

const CHAINS_TO_CHECK = [{
  genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  name: 'Polkadot',
  priceID: 'polkadot'
},
{
  genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  name: 'Kusama',
  priceID: 'kusama'
},
{
  genesisHash: ACALA_GENESISHASH,
  name: 'Acala',
  priceID: 'acala'
},
{
  genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  name: 'Westend',
  priceID: ''
},
{
  genesisHash: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
  name: 'Astar',
  priceID: 'astar'
},
{
  genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
  name: 'HydraDX',
  priceID: 'hydradx'
},
{
  genesisHash: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
  name: 'Karura',
  priceID: 'karura'
},
{
  genesisHash: '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9',
  name: 'WestendAssetHub',
  priceID: ''
}
];
// const fetchPriceFor = ['hydradx', 'karura', 'liquid-staking-dot', 'acala-dollar-acala', 'astar', 'kusama', 'acala',
//   'polkadot', 'tether', 'usd-coin'
// ];

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
      token: getToken(genesisHash)
    });
  }));

  promises.push(params);
}

function getDecimal (genesisHash) {
  const network = selectableNetworks.find((network) => network.genesisHash[0] === genesisHash);

  return network?.decimals?.length ? network.decimals[0] : undefined;
}

async function acalaTokens (accounts, results, promises) {
  const allEndpoints = createWsEndpoints();

  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === 'acala')
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'))
    .slice(0, 5);

  const { connections, fastApi } = await fastestEndpoint(chainEndpoints, true);

  const tokensList = [
    'LDOT', // 'liquid-staking-dot' price apiID
    'ACA',
    'DOT',
    'AUSD' // acala-dollar-acala price apiID
  ];

  // const ldotPriceID = 'liquid-staking-dot';
  // const AusdPriceID = 'acala-dollar-acala';

  for (const token of tokensList) {
    const params = accounts.map((address) => fastApi.query.tokens.accounts(address, { Token: token }).then((bal) => {
      const total = bal.free.add(bal.reserved);
      const zeroBalance = total.isZero();

      if (zeroBalance) {
        return;
      }

      results.push({
        address,
        balances: String(total),
        chain: sanitizeText('Acala'),
        decimal: getDecimal(ACALA_GENESISHASH),
        genesisHash: ACALA_GENESISHASH,
        token
      });

      postMessage(JSON.stringify(results));
    }));

    promises.push(params);
  }

  return connections;
}

async function kusamaAssetHubTokens (accounts, results, promises) {
  const assetsToFetch = [
    {
      name: 'Polkadot',
      id: 14,
      priceID: 'polkadot'
    },
    {
      name: 'Tether USD',
      id: 19840,
      priceID: 'tether'
    },
    {
      name: 'USD Coin',
      id: 10,
      priceID: 'usd-coin'
    }
  ];
  const allEndpoints = createWsEndpoints();

  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === 'kusamaassethub')
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'));

  const { connections, fastApi } = await fastestEndpoint(chainEndpoints, false);

  getNativeToken(accounts, fastApi, KUSAMA_ASSETHUB_GENESISHASH, 'kusama', promises, results);

  for (const asset of assetsToFetch) {
    const params = accounts.map((address) => fastApi.query.assets.account(asset.id, address));

    promises.push(Promise.all([fastApi.query.assets.metadata(asset.id), ...params]).then((p) => {
      const metadata = p[0];
      const accountsAssets = p.slice(1);

      const decimal = metadata.decimals.toNumber();
      const token = metadata.symbol.toHuman();

      accountsAssets.forEach((asset, index) => {
        const total = asset.isNone ? BN_ZERO : asset.unwrap().balance;
        const zeroBalance = total.isZero();

        if (zeroBalance) {
          return;
        }

        results.push({
          address: accounts[index],
          assetId: asset.id,
          balances: String(total),
          chain: sanitizeText('KusamaAssetHub'),
          decimal,
          genesisHash: KUSAMA_ASSETHUB_GENESISHASH,
          token
        });

        postMessage(JSON.stringify(results));
      });
    }));
  }

  return connections;
}

async function polkadotAssetHubTokens (accounts, results, promises) {
  const assetsToFetch = [
    {
      name: 'Tether USD',
      id: 1984,
      priceID: 'tether'
    },
    {
      name: 'USD Coin',
      id: 1337,
      priceID: 'usd-coin'
    }
  ];
  const allEndpoints = createWsEndpoints();

  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === 'polkadotassethub')
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'));

  const { connections, fastApi } = await fastestEndpoint(chainEndpoints, false);

  getNativeToken(accounts, fastApi, POLKADOT_ASSETHUB_GENESISHASH, 'polkadot', promises, results);

  for (const asset of assetsToFetch) {
    const params = accounts.map((address) => fastApi.query.assets.account(asset.id, address));

    promises.push(Promise.all([fastApi.query.assets.metadata(asset.id), ...params]).then((p) => {
      const metadata = p[0];
      const accountsAssets = p.slice(1);

      const decimal = metadata.decimals.toNumber();
      const token = metadata.symbol.toHuman();

      accountsAssets.forEach((asset, index) => {
        const total = asset.isNone ? BN_ZERO : asset.unwrap().balance;
        const zeroBalance = total.isZero();

        if (zeroBalance) {
          return;
        }

        results.push({
          address: accounts[index],
          assetId: asset.id,
          balances: String(total),
          chain: sanitizeText('PolkadotAssetHub'),
          decimal,
          genesisHash: POLKADOT_ASSETHUB_GENESISHASH,
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

async function setupConnections(chain, accounts, allEndpoints) {
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

  const acalaConnections = await acalaTokens(accounts, results, promises);
  const pAHConnections = await polkadotAssetHubTokens(accounts, results, promises);
  const kAHConnections = await kusamaAssetHubTokens(accounts, results, promises);

  const newPromises = CHAINS_TO_CHECK.map((chain) => {
    return setupConnections(chain.name, accounts, allEndpoints)
      .then(({ balances, connections }) => {
        balances.forEach(({ address, balance }) => {
          const zeroBalance = balance.isZero();

          if (zeroBalance) {
            return;
          }

          results.push({
            address,
            balances: String(balance),
            chain: sanitizeText(chain.name),
            decimal: getDecimal(chain.genesisHash),
            genesisHash: chain.genesisHash,
            token: getToken(chain.genesisHash)
          });

          postMessage(JSON.stringify(results));
        });

        closeWebsockets(connections);
      })
      .catch((error) => {
        console.error(`Error fetching balances for ${chain.name}:`, error);
      });
  });

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
