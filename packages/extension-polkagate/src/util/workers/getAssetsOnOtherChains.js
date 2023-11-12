// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

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

const CHAINS_TO_CHECK = [{
  genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  name: 'Polkadot'
},
{
  genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  name: 'Kusama'
},
{
  genesisHash: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
  name: 'Acala'
},
{
  genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  name: 'Westend'
},
{
  genesisHash: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
  name: 'Astar'
},
{
  genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
  name: 'HydraDX'
},
{
  genesisHash: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
  name: 'Karura'
},
{
  genesisHash: '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
  name: 'KusamaAssetHub'
},
{
  genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
  name: 'PolkadotAssetHub'
},
{
  genesisHash: '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9',
  name: 'WestendAssetHub'
}
];

function getPoolBalance (api, address, balances, connections) {
  return api.query.nominationPools.poolMembers(address).then((res) => {
    const member = res && res.unwrapOr(undefined);

    if (!member) {
      connections.forEach((con) => con.wsProvider.disconnect().catch(handleError));

      return balances.freeBalance.add(balances.reservedBalance);
    }

    const poolId = member.poolId;
    const accounts = poolId && getPoolAccounts(api, poolId);

    if (!accounts) {
      connections.forEach((con) => con.wsProvider.disconnect().catch(handleError));

      return balances.freeBalance.add(balances.reservedBalance);
    }

    return Promise.all([
      api.query.nominationPools.bondedPools(poolId),
      api.derive.staking.account(accounts.stashId),
      api.call.nominationPoolsApi.pendingRewards(address)
    ]).then(([bondedPool, stashIdAccount, myClaimable]) => {
      const active = member.points.isZero()
        ? BN_ZERO
        : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));

      const rewards = myClaimable;
      let unlockingValue = BN_ZERO;

      member?.unbondingEras?.forEach((value) => {
        unlockingValue = unlockingValue.add(value);
      });

      connections.forEach((con) => con.wsProvider.disconnect().catch(handleError));

      return balances.freeBalance.add(balances.reservedBalance).add(active.add(rewards).add(unlockingValue));
    }).catch(console.error);
  }).catch(console.error);
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

function getDecimal (genesisHash) {
  const network = selectableNetworks.find((network) => network.genesisHash[0] === genesisHash);

  return network?.decimals?.length ? network.decimals[0] : undefined;
}

function getAssetsOnOtherChains (accountAddress) {
  console.log(`get assets on other chains called for ${accountAddress}`);
  const allEndpoints = createWsEndpoints();

  // Create an array to store the results
  const results = [];

  const promises = CHAINS_TO_CHECK.map((chain) => {
    return setupConnections(chain.name, accountAddress, allEndpoints)
      .then((assetBalance) => {
        if (!assetBalance.isZero()) {
          getPrices([sanitizeText(chain.name)]).then((price) => {
            results.push({
              balances: Number(assetBalance),
              chain: sanitizeText(chain.name),
              decimal: getDecimal(chain.genesisHash),
              price: price.prices[sanitizeText(chain.name).toLowerCase()]?.usd ?? 0,
              token: getToken(chain.genesisHash)
            });
          }).catch((error) => {
            results.push({
              balances: Number(assetBalance),
              chain: sanitizeText(chain.name),
              decimal: getDecimal(chain.genesisHash),
              price: undefined,
              token: getToken(chain.genesisHash)
            });
            console.error(`Error fetching price for ${chain}:`, error);
          });
        }
      })
      .catch((error) => {
        console.error(`Error fetching balances for ${chain}:`, error);
      });
  });

  // Wait for all promises to resolve
  return Promise.all(promises)
    .then(() => {
      return results;
    })
    .catch((error) => {
      console.error('Error fetching balances:', error);

      return results; // Return whatever results were collected before the error
    });
}

function setupConnections (chain, accountAddress, allEndpoints) {
  const chainEndpoints = allEndpoints
    .filter((endpoint) => endpoint.info && endpoint.info.toLowerCase() === chain.toLowerCase())
    .filter((endpoint) => endpoint.value && endpoint.value.startsWith('wss://'));

  console.log(`Connecting to endpoints for ${chain}`);

  const connections = chainEndpoints.map((endpoint) => {
    const wsProvider = new WsProvider(endpoint.value);
    const connection = ApiPromise.create({
      provider: wsProvider
    });

    return {
      connection,
      wsProvider
    };
  });

  // Wait for the fastest connection to resolve
  return Promise.any(connections.map((con) => con.connection))
    .then((fastApi) => fastApi.derive.balances && fastApi.derive.balances.all(accountAddress)
      .then((balances) => {
        if (fastApi && !fastApi.query.nominationPools) {
          connections.forEach((con) => con.wsProvider.disconnect().catch(handleError));

          return balances.freeBalance.add(balances.reservedBalance);
        } else if (fastApi && fastApi.query.nominationPools) {
          const total = getPoolBalance(fastApi, accountAddress, balances, connections);

          return total;
        }
      }))
    .catch((error) => {
      handleError(error);

      return null; // Return null or a placeholder value to indicate failure
    });
}

onmessage = (e) => {
  const {
    accountAddress
  } = e.data;

  // eslint-disable-next-line no-void
  void getAssetsOnOtherChains(accountAddress).then((assetsBalances) => {
    postMessage(JSON.stringify(assetsBalances));
  });
};
