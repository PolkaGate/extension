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
// added by PolkaGate
knownGenesis.westmint = [
    '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9'
];
const testnets = [{
    "prefix": 42,
    "network": "westend",
    "displayName": "Westend",
    "symbols": ["WND"],
    "decimals": [12],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
}]
const assetHubs = [{
    "prefix": 42,
    "network": "westmint",
    "displayName": "Westend Asset Hub",
    "symbols": ["WND"],
    "decimals": [12],
    "standardAccount": "*25519",
    "website": "https://polkadot.network"
}, {
    "prefix": 42,
    "network": "statemine",
    "displayName": "Kusama Asset Hub",
    "symbols": ["KSM"],
    "decimals": [12],
    "standardAccount": "*25519",
    "website": "https://kusama.network"
}, {
    "prefix": 42,
    "network": "statemint",
    "displayName": "Polkadot Asset Hub",
    "symbols": ["DOT"],
    "decimals": [10],
    "standardAccount": "*25519",
    "website": "https://kusama.network"
}];
knownSubstrate.push(...assetHubs, ...testnets);

export const allNetworks = knownSubstrate.map(toExpanded);
export const availableNetworks = allNetworks.filter(filterAvailable).sort(sortNetworks);
export const selectableNetworks = availableNetworks.filter(filterSelectable);
