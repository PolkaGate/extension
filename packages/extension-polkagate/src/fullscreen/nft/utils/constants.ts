// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const KODADOT_IPFS_GATEWAY = 'https://image.w.kodadot.xyz/ipfs/';
export const INFURA_IPFS_GATEWAY = 'https://ipfs.infura.io/ipfs/';
export const PINATA_IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
export const CLOUDFLARE_IPFS_GATEWAY = 'https://cloudflare-ipfs.com/ipfs/';
export const DWEB_IPFS_GATEWAY = 'https://dweb.link/ipfs/';
export const FLEEK_IPFS_GATEWAY = 'https://ipfs.fleek.co/ipfs/';
export const WEB3_STORAGE_IPFS_GATEWAY = 'https://w3s.link/ipfs/';
export const CRUST_IPFS_GATEWAY = 'https://crustwebsites.net/ipfs/';
export const CF_IPFS_GATEWAY = 'https://cf-ipfs.com/ipfs/';
export const ETERNUM_IPFS_GATEWAY = 'https://ipfs.eternum.io/ipfs/';
export const HARDBIN_IPFS_GATEWAY = 'https://hardbin.com/ipfs/';
export const FOREVERLAND_IPFS_GATEWAY = 'https://4everland.io/ipfs/';

export const IPFS_GATEWAYS = [
  IPFS_GATEWAY,
  KODADOT_IPFS_GATEWAY,
  INFURA_IPFS_GATEWAY,
  PINATA_IPFS_GATEWAY,
  CLOUDFLARE_IPFS_GATEWAY,
  DWEB_IPFS_GATEWAY,
  FLEEK_IPFS_GATEWAY,
  WEB3_STORAGE_IPFS_GATEWAY,
  CRUST_IPFS_GATEWAY,
  CF_IPFS_GATEWAY,
  ETERNUM_IPFS_GATEWAY,
  HARDBIN_IPFS_GATEWAY,
  FOREVERLAND_IPFS_GATEWAY
];

export const MAX_RETRY_ATTEMPTS = IPFS_GATEWAYS.length;
export const INITIAL_BACKOFF_TIME = 1000; // 1 second

export const SUPPORTED_NFT_CHAINS = {
  'Kusama Asset Hub': { name: 'kusamaassethub', prefix: 2 },
  'Polkadot Asset Hub': { name: 'polkadotassethub', prefix: 0 }
};

export const THUMBNAIL_HEIGHT = '340px';
export const THUMBNAIL_WIDTH = '190px';
export const PREVIEW_SIZE = '200px';
