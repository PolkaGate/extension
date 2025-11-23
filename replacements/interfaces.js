// Copyright 2017-2025 @polkadot/apps-config and @PolkaGate/apps-configs authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { knownGenesis } from './genesis.js';
import { knownIcon } from './icons.js';
import knownSubstrate from './knownSubstrate.js';
import { knownLedger } from './ledger.js';
import { knownTestnet } from './testnets.js';
const UNSORTED = [0, 2, 42];
const TESTNETS = ['testnet'];
function toExpanded(o) {
    const network = o.network || '';
    const nameParts = network.replace(/_/g, '-').split('-');
    const n = o;
    // ledger additions
    n.slip44 = knownLedger[network];
    n.hasLedgerSupport = !!n.slip44;
    // general items
    n.genesisHash = knownGenesis[network] || [];
    n.icon = knownIcon[network] || 'substrate';
    // filtering
    n.isTestnet = !!knownTestnet[network] || TESTNETS.includes(nameParts[nameParts.length - 1]);
    n.isIgnored = n.isTestnet || (!(o.standardAccount &&
        o.decimals && o.decimals.length &&
        o.symbols && o.symbols.length) &&
        o.prefix !== 42);
    return n;
}
function filterSelectable({ genesisHash, prefix }) {
    return !!genesisHash.length || prefix === 42;
}
function filterAvailable(n) {
    return !n.isIgnored && !!n.network;
}
function sortNetworks(a, b) {
    const isUnSortedA = UNSORTED.includes(a.prefix);
    const isUnSortedB = UNSORTED.includes(b.prefix);
    return isUnSortedA === isUnSortedB
        ? isUnSortedA
            ? 0
            : a.displayName.localeCompare(b.displayName)
        : isUnSortedA
            ? -1
            : 1;
}

const polkagateAddedGenesisHashes = {
    ethereum: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
    goerli: '0x5fbe6b8f0e9b91f8c5c88ee6f7a3b7f7d05c1e71f6e4c4c1c6e8c123456789ab',
    sepolia: '0x25a5cc106eea7138acab33231d7160d69cb777ee0c2c553fcddf5138993e6dd9'
};

Object.entries(polkagateAddedGenesisHashes).forEach(([key, hash]) => (knownGenesis[key] = [hash]));

const evmTestChains = [
    {
        prefix: 5, // Goerli testnet
        network: "goerli",
        displayName: "Goerli Testnet",
        symbols: ["ETH"],
        decimals: [18],
        standardAccount: "0x",
        website: "https://goerli.net/#about"
    },
    {
        prefix: 60, // Sepolia testnet
        network: "sepolia",
        displayName: "Sepolia Testnet",
        symbols: ["ETH"],
        decimals: [18],
        standardAccount: "0x",
        website: "https://sepolia.dev"
    }
];

const evmChains = [
    {
        prefix: 60, // Ethereum's SLIP-44 coin type
        network: "ethereum",
        displayName: "Ethereum Mainnet",
        symbols: ["ETH"],
        decimals: [18],
        standardAccount: "0x",
        website: "https://ethereum.org"
    },
    ...evmTestChains
];

knownSubstrate.push( ...evmChains);

export const allNetworks = knownSubstrate.map(toExpanded);
export const availableNetworks = allNetworks.filter(filterAvailable).sort(sortNetworks);
export const selectableNetworks = availableNetworks.filter(filterSelectable);
