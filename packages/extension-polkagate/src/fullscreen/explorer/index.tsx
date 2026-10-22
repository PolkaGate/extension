// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { chainsHydrationSVG, chainsPolkadotCircleSVG, chainsSnowbridgePNG } from '@polkagate/apps-config/ui/logos/chains';
import { externalKodadotSVG, externalSubscanPNG, externalSubsquareSVG } from '@polkagate/apps-config/ui/logos/external';
import { Avatar, Chip, Grid, Link, Stack, Typography } from '@mui/material';
import { Record } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { SearchField } from '../../components';
import { useIsDark, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';

interface DappEntry {
  name: string;
  label: string;
  url: string;
  logo: string;
  category: string;
  description: string;
}

const DAPPS: DappEntry[] = [
  {
    category: 'Governance',
    description: 'On-chain governance discussions and voting',
    label: 'Subsquare',
    logo: externalSubsquareSVG as string,
    name: 'subsquare',
    url: 'https://polkadot.subsquare.io/'
  },
  {
    category: 'DeFi',
    description: 'Cross-chain liquidity and swaps on Polkadot',
    label: 'Hydration',
    logo: chainsHydrationSVG as string,
    name: 'hydration',
    url: 'https://app.hydration.net/'
  },
  {
    category: 'Bridge',
    description: 'Trustless Ethereum ↔ Polkadot bridge',
    label: 'Snowbridge',
    logo: chainsSnowbridgePNG as string,
    name: 'snowbridge',
    url: 'https://app.snowbridge.network/'
  },
  {
    category: 'Bridge',
    description: 'Interoperability protocol for cross-chain messaging',
    label: 'Hyperbridge',
    logo: 'https://hyperbridge.network/favicon.ico',
    name: 'hyperbridge',
    url: 'https://hyperbridge.network/'
  },
  {
    category: 'NFTs',
    description: 'NFT marketplace built on Polkadot & Kusama',
    label: 'KodaDot',
    logo: externalKodadotSVG as string,
    name: 'kodadot',
    url: 'https://kodadot.xyz/'
  },
  {
    category: 'NFTs',
    description: 'Advanced NFT infrastructure and marketplace',
    label: 'Unique Network',
    logo: 'https://unique.network/favicon.ico',
    name: 'unique',
    url: 'https://unique.network/'
  },
  {
    category: 'Explorer',
    description: 'Multi-chain block explorer and analytics',
    label: 'Subscan',
    logo: externalSubscanPNG as string,
    name: 'subscan',
    url: 'https://polkadot.subscan.io/'
  },
  {
    category: 'Developer',
    description: 'Developer interface for Polkadot & Substrate chains',
    label: 'Polkadot.js Apps',
    logo: chainsPolkadotCircleSVG as string,
    name: 'polkadotjs',
    url: 'https://polkadot.js.org/apps/'
  },
  {
    category: 'Security',
    description: 'A recovery service for compromised wallets on Polkadot-based chains, helping recover assets that remain technically recoverable.',
    label: 'PAPI Rescue',
    logo: 'https://www.papirescue.now/favicon.ico',
    name: 'papirescue',
    url: 'https://www.papirescue.now/'
  }
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(DAPPS.map((d) => d.category)))];

function ExplorerFullScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const onSearch = useCallback((val: string) => {
    setSearch(val.trim().toLowerCase());
  }, []);

  const filtered = useMemo(() => {
    return DAPPS.filter((d) => {
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      const matchesSearch = !search || d.label.toLowerCase().includes(search) || d.description.toLowerCase().includes(search) || d.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <HomeLayout childrenStyle={{ paddingLeft: '25px', position: 'relative', zIndex: 1 }}>
      <Stack direction='row' sx={{ justifyContent: 'space-between', mb: '8px', width: '98%' }}>
        <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
          {t('Explore dApps')}
        </Typography>
      </Stack>

      {/* Search */}
      <SearchField
        onInputChange={onSearch}
        placeholder={t('🔍 Search dApps')}
        style={{ marginRight: '20px', marginTop: '4px' }}
      />

      {/* Category filter chips */}
      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: '8px', mt: '12px' }}>
        {ALL_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={t(cat)}
            onClick={() => setActiveCategory(cat)}
            size='small'
            sx={{
              '&:hover': { opacity: 0.9 },
              bgcolor: activeCategory === cat
                ? isDark ? '#7B3FBE' : '#6D5ACD'
                : isDark ? '#2A1F4A' : '#EEE9FF',
              borderRadius: '8px',
              color: activeCategory === cat ? '#FFF' : isDark ? '#C4ADE8' : '#6D5ACD',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              px: '4px',
              transition: 'all 200ms ease'
            }}
          />
        ))}
      </Stack>

      {/* dApp list */}
      <VelvetBox style={{ margin: '12px 20px 0 0', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', padding: 0 }}>
        <Grid container item sx={{ bgcolor: isDark ? '#1B133C' : '#FFFFFF', border: isDark ? 'none' : '1px solid #E3E8F7', borderRadius: '15px', boxShadow: isDark ? 'none' : '0 12px 24px rgba(133, 140, 176, 0.12)', width: '100%' }}>
          {filtered.length > 0
            ? filtered.map((dapp, index) => (
              <Link
                href={dapp.url}
                key={dapp.name}
                rel='noreferrer'
                sx={{ color: 'inherit', textDecoration: 'none', width: '100%' }}
                target='_blank'
              >
                <Grid
                  alignItems='center'
                  container
                  item
                  justifyContent='space-between'
                  sx={{
                    ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '12px' },
                    bgcolor: isDark ? '#05091C' : '#FFFFFF',
                    borderBottom: `1px solid ${isDark ? '#1B133C' : '#EEF1FF'}`,
                    borderBottomLeftRadius: index === filtered.length - 1 ? '14px' : 0,
                    borderBottomRightRadius: index === filtered.length - 1 ? '14px' : 0,
                    borderTopLeftRadius: index === 0 ? '14px' : 0,
                    borderTopRightRadius: index === 0 ? '14px' : 0,
                    cursor: 'pointer',
                    p: '14px 16px',
                    transition: 'all 250ms ease-out'
                  }}
                >
                  <Stack alignItems='center' direction='row' gap='14px'>
                    <Avatar
                      src={dapp.logo}
                      sx={{ borderRadius: '10px', height: '42px', width: '42px' }}
                      variant='square'
                    />
                    <Stack alignItems='flex-start' direction='column' gap='3px'>
                      <Typography textAlign='left' variant='B-2'>
                        {dapp.label}
                      </Typography>
                      <Typography color={isDark ? '#BEAAD8' : '#7A68A4'} textAlign='left' variant='B-4'>
                        {dapp.description}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Chip
                    label={t(dapp.category)}
                    size='small'
                    sx={{
                      bgcolor: isDark ? '#2A1F4A' : '#EEE9FF',
                      borderRadius: '6px',
                      color: isDark ? '#C4ADE8' : '#6D5ACD',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  />
                </Grid>
              </Link>
            ))
            : (
              <Grid alignItems='center' container item justifyContent='center' sx={{ p: '60px 0' }}>
                <Stack alignItems='center' direction='column' gap='10px'>
                  <Record color={isDark ? '#4A3870' : '#C4B8E8'} size='36' variant='Bulk' />
                  <Typography color={isDark ? '#5A4880' : '#A090C8'} variant='B-3'>
                    {t('No dApps found')}
                  </Typography>
                </Stack>
              </Grid>
            )
          }
        </Grid>
      </VelvetBox>
    </HomeLayout>
  );
}

export default ExplorerFullScreen;
