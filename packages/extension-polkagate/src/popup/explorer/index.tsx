// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { chainsHydrationSVG, chainsPolkadotCircleSVG, chainsSnowbridgePNG } from '@polkagate/apps-config/ui/logos/chains';
import { externalKodadotSVG, externalSubscanPNG, externalSubsquareSVG } from '@polkagate/apps-config/ui/logos/external';
import { Avatar, Chip, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { Record } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, Motion, SearchField } from '../../components';
import { useBackground, useIsDark, useIsSidePanel, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';

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
    logo: 'https://www.papirescue.now/apple-touch-icon.png',
    name: 'papirescue',
    url: 'https://www.papirescue.now/'
  }
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(DAPPS.map((d) => d.category)))];

function ExplorerPage(): React.ReactElement {
  useBackground('default');

  const { t } = useTranslation();
  const isDark = useIsDark();
  const navigate = useNavigate();
  const isSidePanel = useIsSidePanel();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const onSearch = useCallback((val: string) => {
    setSearch(val.trim().toLowerCase());
  }, []);

  const onBack = useCallback(() => navigate('/') as void, [navigate]);

  const filtered = useMemo(() => {
    return DAPPS.filter((d) => {
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      const matchesSearch = !search || d.label.toLowerCase().includes(search) || d.description.toLowerCase().includes(search) || t(d.category).toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, t]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, height: isSidePanel ? '100vh' : undefined, overflow: isSidePanel ? 'hidden' : undefined, pb: isSidePanel ? '86px' : undefined, position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          onClick={onBack}
          style={{ pb: 0 }}
          text={t('Explore dApps')}
        />
        <Motion style={isSidePanel ? { display: 'flex', flex: '1 1 auto', flexDirection: 'column', minHeight: 0, overflow: 'hidden' } : undefined} variant='slide'>
          <SearchField
            onInputChange={onSearch}
            placeholder={t('🔍 Search dApps')}
            style={{ padding: '8px 4% 4px' }}
          />
          {/* Category filter chips */}
          <Container disableGutters sx={{ display: 'flex', flexWrap: 'nowrap', gap: '6px', overflowX: 'auto', px: '4%', py: '8px' }}>
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
                  flexShrink: 0,
                  fontSize: '11px',
                  fontWeight: 600,
                  transition: 'all 200ms ease'
                }}
              />
            ))}
          </Container>
          <VelvetBox style={{ flex: isSidePanel ? '1 1 auto' : undefined, margin: '0 4%', minHeight: isSidePanel ? 0 : '200px', overflowY: isSidePanel ? 'auto' : undefined, width: '92%' }}>
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
                        ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '8px' },
                        bgcolor: isDark ? '#05091C' : '#FFFFFF',
                        borderBottom: `1px solid ${isDark ? '#1B133C' : '#EEF1FF'}`,
                        borderBottomLeftRadius: index === filtered.length - 1 ? '14px' : 0,
                        borderBottomRightRadius: index === filtered.length - 1 ? '14px' : 0,
                        borderTopLeftRadius: index === 0 ? '14px' : 0,
                        borderTopRightRadius: index === 0 ? '14px' : 0,
                        cursor: 'pointer',
                        p: '10px 12px',
                        transition: 'all 250ms ease-out'
                      }}
                    >
                      <Stack alignItems='center' direction='row' gap='12px'>
                        <Avatar
                          src={dapp.logo}
                          sx={{ borderRadius: '10px', height: '38px', width: '38px' }}
                          variant='square'
                        />
                        <Stack alignItems='flex-start' direction='column' gap='2px'>
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
                          fontSize: '10px',
                          fontWeight: 600
                        }}
                      />
                    </Grid>
                  </Link>
                ))
                : (
                  <Grid alignItems='center' container item justifyContent='center' sx={{ p: '40px 0' }}>
                    <Stack alignItems='center' direction='column' gap='8px'>
                      <Record color={isDark ? '#4A3870' : '#C4B8E8'} size='32' variant='Bulk' />
                      <Typography color={isDark ? '#5A4880' : '#A090C8'} variant='B-3'>
                        {t('No dApps found')}
                      </Typography>
                    </Stack>
                  </Grid>
                )
              }
            </Grid>
          </VelvetBox>
        </Motion>
      </Grid>
      <HomeMenu />
    </>
  );
}

export default ExplorerPage;
