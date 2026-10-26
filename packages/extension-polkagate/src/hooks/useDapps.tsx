// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { chainsHydrationSVG, chainsPolkadotCircleSVG, chainsSnowbridgePNG } from '@polkagate/apps-config/ui/logos/chains';
import { externalKodadotSVG, externalSubscanPNG, externalSubsquareSVG } from '@polkagate/apps-config/ui/logos/external';
import { ArrowSwapHorizontal, Category, Code, Convertshape2, Diamonds, Judge, SearchNormal1, Shield } from 'iconsax-react';
import React, { useMemo } from 'react';

import useTranslation from './useTranslation';

export interface DappEntry {
  name: string;
  label: string;
  url: string;
  logo: string;
  category: string;
  description: string;
}

export const DAPP_LOGOS = {
  basilisk: 'https://app.basilisk.cloud/favicon.ico',
  hydration: chainsHydrationSVG as string,
  hyperbridge: 'https://hyperbridge.network/favicon.ico',
  kodadot: externalKodadotSVG as string,
  papibounties: 'https://bounties.usepapi.app/papi_logo-dark.svg',
  papirescue: 'https://www.papirescue.now/apple-touch-icon.png',
  polkadotfaucet: 'https://faucet.polkadot.io/favicon.png',
  polkadotjs: chainsPolkadotCircleSVG as string,
  snowbridge: chainsSnowbridgePNG as string,
  subscan: externalSubscanPNG as string,
  subsquare: externalSubsquareSVG as string,
  taoapp: 'https://coin-images.coingecko.com/coins/images/28452/small/ARUsPeNQ_400x400.jpeg?1696527447',
  unique: 'https://unique.network/favicon.ico'
};

export const CATEGORY_ICONS: Record<string, React.ReactElement<{ color?: string }>> = {
  'All': <Category size='13' variant='Bulk' />,
  'Bridge': <ArrowSwapHorizontal size='13' variant='Bulk' />,
  'DeFi': <Convertshape2 size='13' variant='Bulk' />,
  'Developer': <Code size='13' variant='Bulk' />,
  'Explorer': <SearchNormal1 size='13' variant='Bulk' />,
  'Governance': <Judge size='13' variant='Bulk' />,
  'NFTs': <Diamonds size='13' variant='Bulk' />,
  'Security': <Shield size='13' variant='Bulk' />
};

interface UseDappsResult {
  DAPPS: DappEntry[];
  ALL_CATEGORIES: string[];
  tAll: string;
}

function useDapps(): UseDappsResult {
  const { t } = useTranslation();

  const tAll = t('All');

  const DAPPS = useMemo<DappEntry[]>(() => [
    { category: t('Governance'), description: t('On-chain governance discussions and voting'), label: 'Subsquare', logo: DAPP_LOGOS.subsquare, name: 'subsquare', url: 'https://polkadot.subsquare.io/' },
    { category: t('DeFi'), description: t('Cross-chain liquidity and swaps on Polkadot'), label: 'Hydration', logo: DAPP_LOGOS.hydration, name: 'hydration', url: 'https://app.hydration.net/' },
    { category: t('Bridge'), description: t('Trustless Ethereum ↔ Polkadot bridge'), label: 'Snowbridge', logo: DAPP_LOGOS.snowbridge, name: 'snowbridge', url: 'https://app.snowbridge.network/' },
    { category: t('Bridge'), description: t('Interoperability protocol for cross-chain messaging'), label: 'Hyperbridge', logo: DAPP_LOGOS.hyperbridge, name: 'hyperbridge', url: 'https://hyperbridge.network/' },
    { category: t('NFTs'), description: t('NFT marketplace built on Polkadot & Kusama'), label: 'KodaDot', logo: DAPP_LOGOS.kodadot, name: 'kodadot', url: 'https://kodadot.xyz/' },
    { category: t('NFTs'), description: t('Advanced NFT infrastructure and marketplace'), label: 'Unique Network', logo: DAPP_LOGOS.unique, name: 'unique', url: 'https://unique.network/' },
    { category: t('Explorer'), description: t('Multi-chain block explorer and analytics'), label: 'Subscan', logo: DAPP_LOGOS.subscan, name: 'subscan', url: 'https://polkadot.subscan.io/' },
    { category: t('Developer'), description: t('Developer interface for Polkadot & Substrate chains'), label: 'Polkadot.js Apps', logo: DAPP_LOGOS.polkadotjs, name: 'polkadotjs', url: 'https://polkadot.js.org/apps/' },
    { category: t('Security'), description: t('A recovery service for compromised wallets on Polkadot-based chains, helping recover assets that remain technically recoverable.'), label: 'PAPI Rescue', logo: DAPP_LOGOS.papirescue, name: 'papirescue', url: 'https://www.papirescue.now/' },
    { category: t('DeFi'), description: t('Staking and portfolio management for the Bittensor (TAO) network'), label: 'Tao App', logo: DAPP_LOGOS.taoapp, name: 'taoapp', url: 'https://www.tao.app/' },
    { category: t('Developer'), description: t('Get test tokens for Polkadot, Kusama, and their testnets'), label: 'Polkadot Faucet', logo: DAPP_LOGOS.polkadotfaucet, name: 'polkadotfaucet', url: 'https://faucet.polkadot.io/' },
    { category: t('Governance'), description: t('Bounties management and tracking for Polkadot & Kusama governance'), label: 'PAPI Bounties', logo: DAPP_LOGOS.papibounties, name: 'papibounties', url: 'https://bounties.usepapi.app/' },
    { category: t('DeFi'), description: t('AMM-based DeFi protocol on Kusama for swaps and liquidity provision'), label: 'Basilisk', logo: DAPP_LOGOS.basilisk, name: 'basilisk', url: 'https://app.basilisk.cloud/' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t]);

  const ALL_CATEGORIES = useMemo(
    () => [tAll, ...Array.from(new Set(DAPPS.map((d) => d.category)))],
    [DAPPS, tAll]
  );

  return { ALL_CATEGORIES, DAPPS, tAll };
}

export default useDapps;
