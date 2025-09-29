import knownSubstrate from '@substrate/ss58-registry';
import { knownGenesis, knownIcon, knownLedger, knownTestnet } from './defaults/index.js';
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
    westmint: '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9',
    polkadotPeople: '0x67fa177a097bfa18f77ea95ab56e9bcdfeb0e5b8a40e46298bb93e16b6fc5008',
    westendPeople: '0x1eb6fb0ba5187434de017a70cb84d4f47142df1d571d0ef9e7e1407f2b80b93c',
    kusamaPeople: '0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f',
    paseo: '0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f',
    paseoAssetHub: '0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2',
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

const testnets = [{
    "prefix": 42,
    "network": "westend",
    "displayName": "Westend",
    "symbols": ["WND"],
    "decimals": [12],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
},
{
    "prefix": 0,
    "network": "paseo",
    "displayName": "Paseo Testnet",
    "symbols": ["PAS"],
    "decimals": [10],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
}];

const assetHubs = [{
    "prefix": 42,
    "network": "westmint",
    "displayName": "Westend Asset Hub",
    "symbols": ["WND"],
    "decimals": [12],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
},
{
    "prefix": 2,
    "network": "statemine",
    "displayName": "Kusama Asset Hub",
    "symbols": ["KSM"],
    "decimals": [12],
    "standardAccount": "*25519",
    "website": "https://kusama.network"
},
{
    "prefix": 0,
    "network": "statemint",
    "displayName": "Polkadot Asset Hub",
    "symbols": ["DOT"],
    "decimals": [10],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
},
{
    "prefix": 0,
    "network": "paseoAssetHub",
    "displayName": "Paseo Asset Hub",
    "symbols": ["PAS"],
    "decimals": [10],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
}];

const peopleChains = [
    {
        "prefix": 42,
        "network": "westendPeople",
        "displayName": "Westend People",
        "symbols": ["WND"],
        "decimals": [12],
        "standardAccount": "*25519",
        "website": "https://polkadot.network"
    },
    {
        "prefix": 2,
        "network": "kusamaPeople",
        "displayName": "Kusama People",
        "symbols": ["KSM"],
        "decimals": [12],
        "standardAccount": "*25519",
        "website": "https://kusama.network"
    },
    {
        "prefix": 0,
        "network": "polkadotPeople",
        "displayName": "Polkadot People",
        "symbols": ["DOT"],
        "decimals": [10],
        "standardAccount": "*25519",
        "website": "https://polkadot.network"
    }
];

knownSubstrate.push(...assetHubs, ...peopleChains, ...testnets, ...evmChains);

export const allNetworks = knownSubstrate.map(toExpanded);
export const availableNetworks = allNetworks.filter(filterAvailable).sort(sortNetworks);
export const selectableNetworks = availableNetworks.filter(filterSelectable);
